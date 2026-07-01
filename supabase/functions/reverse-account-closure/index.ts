import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import {
  sendOwnerReversedEmail,
  sendContributorReversedEmail,
} from "../_shared/closure-emails.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[CLOSURE-REVERSE] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

const accountStatusFromEntitlement = (entitlement: any) => {
  if (entitlement?.cancel_at_period_end) return 'cancelled_billing_active';
  if (entitlement?.status === 'canceled' || entitlement?.status === 'inactive') return 'expired_read_only';
  return 'active';
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: u, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (error || !u.user) throw new Error("Invalid token");
    const user = u.user;
    const userId = user.id;

    const { data: pending } = await supabase
      .from('account_closure_requests')
      .select('id')
      .eq('owner_user_id', userId)
      .in('status', ['pending', 'scheduled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pending) throw new Error("No active closure request to reverse");

    const { error: updErr } = await supabase
      .from('account_closure_requests')
      .update({ status: 'reversed', reversed_at: new Date().toISOString() })
      .eq('id', pending.id);
    if (updErr) throw updErr;

    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('status, cancel_at_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    const nextAccountStatus = accountStatusFromEntitlement(entitlement);

    // Restore account status based on current billing projection.
    await supabase
      .from('profiles')
      .update({ account_status: nextAccountStatus, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // Reversal notification emails (non-blocking)
    try {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .maybeSingle();
      const ownerName = [ownerProfile?.first_name, ownerProfile?.last_name]
        .filter(Boolean).join(' ').trim() || (user.email ?? 'Account Owner');
      const ownerEmail = user.email ?? '';

      const tasks: Promise<any>[] = [];
      if (ownerEmail) {
        tasks.push(
          sendOwnerReversedEmail({ to: ownerEmail, ownerName })
            .catch((e) => log("owner email error", { message: e?.message }))
        );
      }
      const { data: contribs } = await supabase
        .from('contributors')
        .select('contributor_email, first_name, last_name, status')
        .eq('account_owner_id', userId)
        .eq('status', 'accepted');
      for (const c of contribs ?? []) {
        if (!c.contributor_email) continue;
        const cName = [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || null;
        tasks.push(
          sendContributorReversedEmail({
            to: c.contributor_email,
            contributorName: cName,
            ownerName,
            ownerEmail,
          }).catch((e) => log("contributor email error", { email: c.contributor_email, message: e?.message }))
        );
      }
      await Promise.allSettled(tasks);
      log("Reversal emails dispatched", { count: tasks.length });
    } catch (e: any) {
      log("email block error (non-fatal)", { message: e?.message });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
