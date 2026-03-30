/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CANONICAL CONTRIBUTOR SIGNUP FLOW — DO NOT REVERT                ║
 * ║                                                                    ║
 * ║  Validates invite_token from contributors table, sets password,    ║
 * ║  updates profile, and accepts the invitation atomically.          ║
 * ║  DO NOT reintroduce Supabase magic links, generate_link, or OTP. ║
 * ║  User lookup uses create-first + listUsers email filter fallback. ║
 * ║  Paired with: invite-contributor, AuthLegacy.tsx                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  invite_token: z.string().uuid(),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Validate invite token against contributors table
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('contributors')
      .select('id, account_owner_id, role, first_name, last_name')
      .eq('contributor_email', validated.email)
      .eq('invite_token', validated.invite_token)
      .eq('status', 'pending')
      .maybeSingle();

    if (inviteError) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] DB error:', inviteError);
      throw inviteError;
    }

    if (!invitation) {
      console.warn('[COMPLETE-CONTRIBUTOR-SIGNUP] Invalid token for:', validated.email);
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired invitation token. Please ask the account holder to resend your invitation.',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('[COMPLETE-CONTRIBUTOR-SIGNUP] Valid token found for:', validated.email, 'invitation:', invitation.id);

    // 2. Get or create auth user — direct REST lookup (no listUsers pagination limit)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    let existingUser: any = null;
    try {
      const lookupRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(validated.email)}`,
        { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
      );
      if (lookupRes.ok) {
        const lookupData = await lookupRes.json();
        existingUser = lookupData?.users?.[0] || null;
      }
    } catch (lookupErr) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] User lookup failed:', lookupErr);
    }
    
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log('[COMPLETE-CONTRIBUTOR-SIGNUP] Found existing auth user:', userId);
    } else {
      // Create user if somehow doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        email_confirm: true,
        password: validated.password,
        user_metadata: {
          first_name: validated.first_name,
          last_name: validated.last_name,
          invited_as_contributor: true,
        },
      });
      if (createError || !newUser?.user) {
        console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error creating user:', createError);
        throw createError || new Error('Failed to create user');
      }
      userId = newUser.user.id;
      console.log('[COMPLETE-CONTRIBUTOR-SIGNUP] Created new auth user:', userId);
    }

    // 3. Set password + update metadata via admin API
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        first_name: validated.first_name,
        last_name: validated.last_name,
        invited_as_contributor: true,
      },
    });

    if (updateAuthError) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error updating auth user:', updateAuthError);
      throw updateAuthError;
    }

    // 4. Update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: validated.first_name,
        last_name: validated.last_name,
        password_set: true,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error updating profile:', profileError);
      // Non-fatal — profile trigger may not have fired yet
    }

    // 5. Accept invitation: update contributors record
    const { error: acceptError } = await supabaseAdmin
      .from('contributors')
      .update({
        status: 'accepted',
        contributor_user_id: userId,
        accepted_at: new Date().toISOString(),
        invite_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (acceptError) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error accepting invitation:', acceptError);
      throw acceptError;
    }

    // 6. Log activity
    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: invitation.account_owner_id,
          actor_user_id: userId,
          action_type: 'contributor_access',
          action_category: 'contributor',
          resource_type: 'account',
          resource_name: `${validated.first_name} ${validated.last_name}`.trim(),
          details: { role: invitation.role, accepted: true },
        });
    } catch (logError) {
      console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error logging activity:', logError);
    }

    console.log('[COMPLETE-CONTRIBUTOR-SIGNUP] Successfully completed signup for:', validated.email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Account setup complete. You can now sign in.',
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error('[COMPLETE-CONTRIBUTOR-SIGNUP] Error:', { errorId, message: error.message });

    let userMessage = 'Failed to complete account setup. Please try again.';
    let status = 500;

    if (error instanceof z.ZodError) {
      userMessage = 'Invalid input data. Please check your information.';
      status = 400;
    }

    return new Response(JSON.stringify({ error: userMessage, errorId, success: false }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
