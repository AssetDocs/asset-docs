import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const INTERNAL_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface DelegateAccessEmailData {
  delegateEmail: string;
  delegateName: string;
  ownerName: string;
  ownerEmail: string;
  legacyLockerId: string;
  delegateUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const internalSecret = req.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== INTERNAL_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { delegateEmail, delegateName, ownerName, ownerEmail, legacyLockerId, delegateUserId }: DelegateAccessEmailData = await req.json();

    if (!delegateEmail || !legacyLockerId || !delegateUserId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: locker, error: lockerError } = await supabase
      .from('legacy_locker')
      .select('id, user_id, delegate_user_id, recovery_status')
      .eq('id', legacyLockerId)
      .single();

    if (lockerError || !locker) {
      return new Response(JSON.stringify({ error: "Legacy locker not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (locker.delegate_user_id !== delegateUserId) {
      return new Response(JSON.stringify({ error: "Invalid delegate for this locker" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (locker.recovery_status !== 'grace_period_active') {
      return new Response(JSON.stringify({ message: "Locker not in active grace period" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const acknowledgmentToken = crypto.randomUUID();

    await supabase.from('legacy_locker')
      .update({ recovery_status: 'awaiting_acknowledgment', updated_at: new Date().toISOString() })
      .eq('id', legacyLockerId);

    await supabase.from('recovery_requests').insert({
      legacy_locker_id: legacyLockerId,
      delegate_user_id: delegateUserId,
      owner_user_id: locker.user_id,
      status: 'grace_period_expired',
      grace_period_ends_at: new Date().toISOString(),
      reason: 'Grace period expired - awaiting delegate acknowledgment',
      relationship: 'Recovery Delegate',
    });

    const acknowledgmentUrl = `https://www.getassetsafe.com/acknowledge-access?token=${acknowledgmentToken}&lockerId=${legacyLockerId}&delegateId=${delegateUserId}`;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [delegateEmail],
      subject: `Grace Period Expired — Access Granted to ${ownerName}'s Secure Vault`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Grace Period Has Expired</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hello ${delegateName},</p>

            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                The recovery grace period for <strong>${ownerName}'s</strong> encrypted Secure Vault has expired. You have been designated as their Recovery Delegate and now have access.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">By proceeding, you acknowledge that:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>You now have full access to ${ownerName}'s Secure Vault</li>
              <li>You are responsible for managing files, reports, and account decisions</li>
              <li>You will handle this sensitive information with care and discretion</li>
            </ul>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${acknowledgmentUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                ✓ I Acknowledge — Grant Me Access
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${acknowledgmentUrl}" style="color: #1e40af; word-break: break-all;">${acknowledgmentUrl}</a>
            </p>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> You must click the acknowledgment button above to activate your access.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">Account Owner: ${ownerName} (${ownerEmail})</p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Questions? Contact <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Delegate access email sent:", emailResponse);
    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending delegate access email:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
