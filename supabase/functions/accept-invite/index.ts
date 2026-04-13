/**
 * accept-invite — Validates token, creates membership, marks invite accepted.
 * Replaces: complete-contributor-signup + accept-contributor-invitation
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({
  token: z.string().min(1).max(256),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { token } = bodySchema.parse(body);

    // Hash the raw token
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');

    // Look up invite by hash
    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('invites')
      .select('id, account_id, email, role, expires_at, status')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (inviteErr) {
      console.error('[ACCEPT-INVITE] DB error:', inviteErr);
      throw inviteErr;
    }

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid invitation token.', success: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.status === 'accepted') {
      return new Response(JSON.stringify({ error: 'This invitation has already been used.', success: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.status === 'expired' || new Date(invite.expires_at) < new Date()) {
      // Mark as expired if not already
      if (invite.status !== 'expired') {
        await supabaseAdmin.from('invites').update({ status: 'expired' }).eq('id', invite.id);
      }
      return new Response(JSON.stringify({ error: 'This invitation has expired. Please request a new one.', success: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check email match (case-insensitive)
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return new Response(JSON.stringify({
        error: `This invitation was sent to ${invite.email}. Please sign in with that email address.`,
        success: false,
      }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing membership
    const { data: existingMembership } = await supabaseAdmin
      .from('account_memberships')
      .select('id, status')
      .eq('account_id', invite.account_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        // Already a member, just mark invite accepted
        await supabaseAdmin.from('invites').update({ status: 'accepted' }).eq('id', invite.id);
        return new Response(JSON.stringify({
          success: true,
          message: 'You already have access to this account.',
          account_id: invite.account_id,
        }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Revoked — reactivate
      await supabaseAdmin.from('account_memberships').update({
        status: 'active',
        role: invite.role,
        accepted_at: new Date().toISOString(),
      }).eq('id', existingMembership.id);
    } else {
      // Create new membership
      const { error: memberErr } = await supabaseAdmin
        .from('account_memberships')
        .insert({
          account_id: invite.account_id,
          user_id: user.id,
          role: invite.role,
          status: 'active',
          invited_by: invite.invited_by,
          accepted_at: new Date().toISOString(),
        });

      if (memberErr) {
        console.error('[ACCEPT-INVITE] Membership insert error:', memberErr);
        throw memberErr;
      }
    }

    // Mark invite as accepted
    await supabaseAdmin.from('invites').update({ status: 'accepted' }).eq('id', invite.id);

    // Log activity
    try {
      const { data: account } = await supabaseAdmin
        .from('accounts')
        .select('owner_user_id')
        .eq('id', invite.account_id)
        .single();

      if (account) {
        await supabaseAdmin.from('user_activity_logs').insert({
          user_id: account.owner_user_id,
          actor_user_id: user.id,
          action_type: 'invite_accepted',
          action_category: 'authorized_users',
          resource_type: 'account',
          resource_name: user.email || 'Authorized User',
          details: { role: invite.role },
        });
      }
    } catch (e) {
      console.error('[ACCEPT-INVITE] Activity log error:', e);
    }

    console.log('[ACCEPT-INVITE] Success:', { userId: user.id, accountId: invite.account_id, role: invite.role });

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation accepted. Welcome to Asset Safe.',
      account_id: invite.account_id,
      role: invite.role,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('[ACCEPT-INVITE] Error:', error);
    let message = 'Failed to accept invitation.';
    let status = 500;
    if (error instanceof z.ZodError) { message = 'Invalid input.'; status = 400; }
    if (error.message === 'Unauthorized' || error.message === 'No authorization header') status = 401;
    return new Response(JSON.stringify({ error: message, success: false }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
