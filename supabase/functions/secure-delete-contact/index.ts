/**
 * secure-delete-contact — Owner-only deletion of a vip_contacts row.
 *
 * The parent vip_contacts row used to be removed via a direct client delete,
 * relying on ON DELETE CASCADE for vip_contact_attachments. That bypassed
 * secure-delete-file and orphaned storage objects in the contact-attachments
 * bucket (Phase 5 integrity patch).
 *
 * Flow:
 *  1. Authenticate caller via JWT.
 *  2. Fetch the contact; require Owner or Full Access for the owner workspace.
 *  3. List all attachments for the contact.
 *  4. For each attachment, delegate to secure-delete-file (which runs the
 *     same lease/retry storage-cleanup-then-row-delete flow used elsewhere).
 *     We use the stored file_path on each attachment; we never reconstruct
 *     paths here.
 *  5. Re-check that no attachments remain. If any still exist (storage
 *     failure, lease in-progress, etc.) abort with 409; the contact row is
 *     preserved so the user can retry.
 *  6. Delete the vip_contacts row.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const bodySchema = z.object({ id: z.string().uuid() });

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json(400, { error: "invalid_request" });
    const { id } = parsed.data;

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json(401, { error: "missing_auth" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "invalid_auth" });
    const callerId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    // --- Load + authorize ---------------------------------------------
    const { data: contact, error: cErr } = await admin
      .from("vip_contacts")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();
    if (cErr) {
      console.error("secure-delete-contact: contact lookup failed", cErr.message);
      return json(500, { error: "lookup_failed" });
    }
    if (!contact) return json(404, { error: "not_found" });
    if (contact.user_id !== callerId) {
      const { data: allowed, error: accessErr } = await admin.rpc(
        "has_account_access",
        {
          _user_id: callerId,
          _owner_user_id: contact.user_id,
          _min_role: "full_access",
        },
      );

      if (accessErr) {
        console.error("secure-delete-contact: access check failed", accessErr.message);
        return json(500, { error: "authz_failed" });
      }

      if (!allowed) return json(403, { error: "forbidden" });
    }

    // --- Enumerate attachments ----------------------------------------
    const { data: attachments, error: aErr } = await admin
      .from("vip_contact_attachments")
      .select("id")
      .eq("contact_id", id);
    if (aErr) {
      console.error("secure-delete-contact: attachment list failed", aErr.message);
      return json(500, { error: "lookup_failed" });
    }

    // --- Delegate each attachment to secure-delete-file ---------------
    const deleteFileUrl = `${supabaseUrl}/functions/v1/secure-delete-file`;
    const failures: Array<{ id: string; error: string }> = [];
    for (const att of attachments ?? []) {
      try {
        const r = await fetch(deleteFileUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
            apikey: anonKey,
          },
          body: JSON.stringify({
            resource: "contact_attachment",
            id: att.id,
          }),
        });
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          failures.push({ id: att.id, error: body?.error || `http_${r.status}` });
        }
      } catch (e) {
        failures.push({ id: att.id, error: (e as Error).message });
      }
    }

    // --- Verify no attachment rows remain -----------------------------
    const { count, error: cntErr } = await admin
      .from("vip_contact_attachments")
      .select("id", { count: "exact", head: true })
      .eq("contact_id", id);
    if (cntErr) {
      console.error("secure-delete-contact: recount failed", cntErr.message);
      return json(500, { error: "verify_failed" });
    }
    if ((count ?? 0) > 0) {
      console.warn("secure-delete-contact: attachments remain", {
        contactId: id,
        remaining: count,
        failures,
      });
      return json(409, {
        error: "attachment_cleanup_incomplete",
        remaining: count,
        retryable: true,
      });
    }

    // --- Delete the contact row ---------------------------------------
    const { error: delErr } = await admin
      .from("vip_contacts")
      .delete()
      .eq("id", id);
    if (delErr) {
      console.error("secure-delete-contact: contact delete failed", delErr.message);
      return json(500, { error: "delete_failed" });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error("secure-delete-contact: unhandled", e);
    return json(500, { error: "internal_error" });
  }
});
