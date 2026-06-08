/**
 * send-invite — Creates an Authorized User invite for the specified account
 * and sends the invitation email via Resend.
 *
 * The owner's accountId is passed explicitly and verified via is_account_owner.
 * Eligibility (account status + active entitlement) is enforced server-side by
 * can_send_au_invite. Duplicate pending invites are blocked by the unique
 * partial index on (account_id, lower(email)).
 *
 * Delivery status is tracked on the invite row: insert with 'not_sent', then
 * flip to 'sent' or 'failed' based on the Resend response. A delivery failure
 * does NOT delete the invite row — the owner can resend (Phase 4).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const inviteSchema = z.object({
  accountId: z.string().uuid(),
  email: z.string().email().max(255).transform((v) => v.trim().toLowerCase()),
  role: z.enum(["full_access", "read_only"]),
});

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Authenticate caller.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized", success: false }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return jsonResponse({ error: "Unauthorized", success: false }, 401);

    // Parse + validate body.
    const body = await req.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Invalid input.", success: false, details: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const { accountId, email, role } = parsed.data;

    // Verify caller is the owner of the specified account.
    const { data: isOwner, error: ownerErr } = await supabaseAdmin.rpc("is_account_owner", {
      _user_id: user.id,
      _account_id: accountId,
    });
    if (ownerErr || !isOwner) {
      return jsonResponse(
        { error: "You must be the account owner to send invites.", success: false },
        403,
      );
    }

    // Server-side eligibility (account active + entitlement).
    const { data: canSend, error: eligErr } = await supabaseAdmin.rpc("can_send_au_invite", {
      _account_id: accountId,
    });
    if (eligErr || !canSend) {
      return jsonResponse(
        { error: "This account is not currently eligible to add Authorized Users.", success: false },
        403,
      );
    }

    // Generate secure token + SHA-256 hash.
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const rawToken = Array.from(tokenBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawToken));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");

    // Insert invite. Unique partial index blocks duplicate pending invites.
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("invites")
      .insert({
        account_id: accountId,
        email,
        role,
        token_hash: tokenHash,
        invited_by: user.id,
        delivery_status: "not_sent",
      })
      .select("id")
      .single();

    if (insertErr) {
      // Unique violation = pending invite already exists.
      if ((insertErr as any).code === "23505") {
        return jsonResponse(
          { error: "An invite is already pending for this email. Use Resend instead.", success: false },
          409,
        );
      }
      console.error("[SEND-INVITE] Insert error:", insertErr);
      return jsonResponse({ error: "Failed to create invitation.", success: false }, 500);
    }

    const inviteId = inserted!.id as string;

    // Build email content.
    const { data: ownerProfile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ""} ${ownerProfile.last_name || ""}`.trim()
      : "An Asset Safe user";
    const safeOwnerName = escapeHtml(ownerName || "An Asset Safe user");
    const roleLabel = role === "full_access" ? "Full Access" : "Read Only";
    const roleDescription = role === "full_access"
      ? "You'll be able to view, add, update, and manage information across the account."
      : "You'll be able to view important information, but not make changes.";
    const inviteUrl = `https://www.getassetsafe.com/invite?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // Attempt Resend delivery.
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let deliveryStatus: "sent" | "failed" = "failed";
    let deliveryError: string | null = null;

    if (!resendApiKey) {
      deliveryError = "Email service is not configured.";
      console.warn("[SEND-INVITE] No RESEND_API_KEY configured");
    } else {
      try {
        const resend = new Resend(resendApiKey);
        const { error: sendErr } = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [email],
          subject: "You've been invited to access an Asset Safe account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
              <div style="text-align: center; padding: 30px 20px 20px;">
                <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
              </div>
              <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
                <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Been Invited</h2>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
                  <strong>${safeOwnerName}</strong> has invited you to access their Asset Safe account as an authorized user.
                </p>
                <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
                  <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Your access level:</strong> ${roleLabel}</p>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">${roleDescription}</p>
                </div>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 25px;">
                  This allows you to securely access important records and information when it matters most.
                </p>
                <div style="text-align: center; margin: 0 0 20px;">
                  <a href="${inviteUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                    Accept Invitation
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
                  If the button doesn't work, copy and paste this link into your browser:<br/>
                  <a href="${inviteUrl}" style="color: #1e40af; word-break: break-all;">${inviteUrl}</a>
                </p>
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                  <p style="color: #374151; margin: 0; font-size: 14px;">
                    🔒 <strong>For your security,</strong> you'll create your own login — you'll never be given someone else's password.
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px;">
                  This invitation will expire in 7 days for security purposes.
                </p>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">
                  If you don't recognize the person who sent this invitation, you can safely ignore this email.
                </p>
              </div>
              <div style="padding: 25px 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0 0 6px;">What is Asset Safe?</p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                  Asset Safe helps people securely document and protect important information for their home, assets, and family.
                </p>
              </div>
            </div>
          `,
        });
        if (sendErr) {
          deliveryError = (sendErr as any)?.message || "Email provider rejected the message.";
          console.error("[SEND-INVITE] Resend error:", sendErr);
        } else {
          deliveryStatus = "sent";
        }
      } catch (e: any) {
        deliveryError = e?.message || "Failed to contact email provider.";
        console.error("[SEND-INVITE] Resend exception:", e);
      }
    }

    // Update the invite row with the actual delivery outcome.
    const nowIso = new Date().toISOString();
    const update: Record<string, unknown> =
      deliveryStatus === "sent"
        ? {
            delivery_status: "sent",
            delivered_at: nowIso,
            last_sent_at: nowIso,
            last_delivery_error: null,
          }
        : {
            delivery_status: "failed",
            last_delivery_error: deliveryError,
            last_sent_at: nowIso,
          };
    await supabaseAdmin.from("invites").update(update).eq("id", inviteId);

    // Non-fatal: activity log.
    try {
      await supabaseAdmin.from("user_activity_logs").insert({
        user_id: user.id,
        actor_user_id: user.id,
        action_type: "invite_sent",
        action_category: "authorized_users",
        resource_type: "invite",
        resource_name: email,
        details: { role, delivery_status: deliveryStatus, invite_id: inviteId },
      });
    } catch (e) {
      console.error("[SEND-INVITE] Activity log error:", e);
    }

    // Always 200 — the invite row exists; UI decides whether to surface the failure.
    return jsonResponse({
      success: true,
      inviteCreated: true,
      invite_id: inviteId,
      delivery_status: deliveryStatus,
      ...(deliveryStatus === "failed" ? { error: deliveryError } : {}),
    });
  } catch (error: any) {
    console.error("[SEND-INVITE] Unhandled error:", error);
    return jsonResponse({ error: "Failed to send invitation.", success: false }, 500);
  }
});
