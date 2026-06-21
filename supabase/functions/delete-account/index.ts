import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { requireStepUp, getClientIp } from '../_shared/mfa.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DELETE-ACCOUNT] Function started');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for getting current user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('[DELETE-ACCOUNT] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      console.log('[DELETE-ACCOUNT] Invalid token or no user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body for target account (for admin contributor deletions)
    let targetAccountId = user.id;
    let isAdminDeletion = false;
    
    try {
      const body = await req.json();
      if (body.target_account_id && body.target_account_id !== user.id) {
        // Validate UUID format before trusting client-supplied value
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(body.target_account_id)) {
          return new Response(
            JSON.stringify({ error: 'Invalid target_account_id format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        targetAccountId = body.target_account_id;
        isAdminDeletion = true;
      }
    } catch {
      // No body provided, deleting own account
    }

    // Account deletion is destructive — for self-deletion, require a FRESH
    // MFA step-up (last 60s) if the user has MFA enrolled. Admin/contributor
    // deletions skip this gate (governed by contributor-role check above).
    if (!isAdminDeletion) {
      const gate = await requireStepUp(supabaseAdmin, user.id, {
        fresh: true,
        kind: 'delete_account',
        ip: getClientIp(req),
        corsHeaders,
      });
      if (!gate.ok) {
        console.log('[DELETE-ACCOUNT] Blocked by step-up gate');
        return gate.response;
      }
    }


    console.log('[DELETE-ACCOUNT] Verifying user permissions for:', user.id, 'Target:', targetAccountId);

    // Check contributor status
    const { data: contributorData, error: contributorError } = await supabaseAdmin
      .from('contributors')
      .select('account_owner_id, role, status')
      .eq('contributor_user_id', user.id);

    if (contributorError) {
      console.log('[DELETE-ACCOUNT] Error checking contributor status:', contributorError);
    }

    // If this is an admin deletion (deleting someone else's account)
    if (isAdminDeletion) {
      // Find the contributor relationship for this specific account
      const relevantContributor = contributorData?.find(
        c => c.account_owner_id === targetAccountId
      );

      if (!relevantContributor) {
        console.log('[DELETE-ACCOUNT] User is not a contributor to target account');
        return new Response(
          JSON.stringify({ error: 'You do not have access to this account' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (relevantContributor.role !== 'administrator' || relevantContributor.status !== 'accepted') {
        console.log('[DELETE-ACCOUNT] User is not an administrator:', relevantContributor);
        return new Response(
          JSON.stringify({ error: 'Only administrator contributors can delete accounts' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check for approved deletion request or expired grace period
      const { data: deletionRequest, error: requestError } = await supabaseAdmin
        .from('account_deletion_requests')
        .select('*')
        .eq('account_owner_id', targetAccountId)
        .eq('requester_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (requestError || !deletionRequest) {
        console.log('[DELETE-ACCOUNT] No deletion request found');
        return new Response(
          JSON.stringify({ error: 'You must first submit a deletion request before deleting this account' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const gracePeriodEnded = new Date(deletionRequest.grace_period_ends_at) <= new Date();
      const isApproved = deletionRequest.status === 'approved';
      const isPending = deletionRequest.status === 'pending';

      if (deletionRequest.status === 'rejected') {
        console.log('[DELETE-ACCOUNT] Deletion request was rejected');
        return new Response(
          JSON.stringify({ error: 'The account owner has rejected the deletion request' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!isApproved && !(isPending && gracePeriodEnded)) {
        const daysRemaining = Math.ceil(
          (new Date(deletionRequest.grace_period_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        console.log('[DELETE-ACCOUNT] Grace period not yet ended, days remaining:', daysRemaining);
        return new Response(
          JSON.stringify({ 
            error: `Cannot delete yet. The account owner has ${daysRemaining} day(s) to respond to the deletion request.` 
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('[DELETE-ACCOUNT] Admin deletion authorized, proceeding with account:', targetAccountId);
    } else {
      // User is deleting their own account
      // Check if they're only a contributor (not the owner)
      const ownsAccount = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!ownsAccount.data) {
        console.log('[DELETE-ACCOUNT] User does not own an account');
        return new Response(
          JSON.stringify({ error: 'You cannot delete an account you do not own' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if user is a viewer/contributor (non-admin) trying to delete
      // They should only be able to delete their own account if they are the owner
      const isContributorToOthers = contributorData?.some(
        c => c.account_owner_id !== user.id && c.status === 'accepted'
      );

      // This is fine - they can still delete their own account even if they're a contributor elsewhere
      console.log('[DELETE-ACCOUNT] User owns account, proceeding with self-deletion');
    }

    console.log('[DELETE-ACCOUNT] Authorization verified, proceeding with deletion of:', targetAccountId);

    // Get the target user's Stripe customer ID to cancel subscriptions
    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', targetAccountId)
      .single();

    // Cancel all active Stripe subscriptions
    if (subscriber?.stripe_customer_id) {
      try {
        console.log('[DELETE-ACCOUNT] Canceling Stripe subscriptions for customer:', subscriber.stripe_customer_id);
        
        const subscriptions = await stripe.subscriptions.list({
          customer: subscriber.stripe_customer_id,
          status: 'active',
        });

        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
          console.log('[DELETE-ACCOUNT] Canceled subscription:', subscription.id);
        }
      } catch (stripeError) {
        console.log('[DELETE-ACCOUNT] Error canceling Stripe subscriptions:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // ====================================================================
    // RETENTION MATRIX EXECUTION
    // 1. Fetch email (needed for tombstone + email-based anonymization)
    // 2. Call anonymize_user_data RPC (handles all retain/anonymize tables)
    // 3. Purge user-content tables below
    // 4. Cancel Stripe + delete auth user (later in the function)
    // ====================================================================

    const { data: targetUserData } = await supabaseAdmin.auth.admin.getUserById(targetAccountId);
    const targetUserEmail = targetUserData?.user?.email ?? null;

    // --- Step A: anonymize via RPC ---------------------------------------
    let tombstoneId: string | null = null;
    {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('anonymize_user_data', {
        p_user_id: targetAccountId,
        p_email: targetUserEmail,
        p_deleted_by: isAdminDeletion ? 'admin' : 'self',
      });
      if (rpcError) {
        const errorId = crypto.randomUUID();
        console.log('[DELETE-ACCOUNT] anonymize_user_data RPC failed:', { errorId, rpcError });
        return new Response(
          JSON.stringify({ error: 'Account deletion failed (anonymize step).', errorId }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      tombstoneId = (rpcData as unknown as string) ?? null;
      console.log('[DELETE-ACCOUNT] Anonymized via RPC. Tombstone:', tombstoneId);
    }

    // --- Step B: purge user-content tables (matrix "purge" only) ---------
    // NOTE: payment_events, subscribers, audit_logs, gift_subscriptions,
    // entitlements, account_deletion_requests, account_closure_requests,
    // user_activity_logs, checkout_*, subscription_cancellations are NOT
    // listed here — they are handled by anonymize_user_data (or retained).
    const tablesWithUserId = [
      'voice_note_attachments',
      'receipts',
      'legacy_locker_voice_notes',
      'legacy_locker_files',
      'legacy_locker_folders',
      'legacy_locker',
      'property_files',
      'items',
      'properties',
      'damage_reports',
      'insurance_policies',
      'notification_preferences',
      'events',
      'user_roles',
      'paint_codes',
      'financial_accounts',
      'source_websites',
      'document_folders',
      'video_folders',
      'photo_folders',
      'trust_information',
      'password_catalog',
      'storage_usage',
      'contacts',
      'profiles',
      'account_verification',
      'vip_contact_attachments',
      'vip_contacts',
    ];

    // recovery_requests uses owner/delegate columns
    try {
      await supabaseAdmin.from('recovery_requests').delete().eq('owner_user_id', targetAccountId);
      await supabaseAdmin.from('recovery_requests').delete().eq('delegate_user_id', targetAccountId);
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting recovery requests:', error);
    }

    for (const table of tablesWithUserId) {
      try {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', targetAccountId);
        if (deleteError) {
          console.log(`[DELETE-ACCOUNT] Error deleting from ${table}:`, deleteError);
        }
      } catch (error) {
        console.log(`[DELETE-ACCOUNT] Error processing table ${table}:`, error);
      }
    }

    // contributors uses different column names
    try {
      await supabaseAdmin.from('contributors').delete().eq('contributor_user_id', targetAccountId);
      await supabaseAdmin.from('contributors').delete().eq('account_owner_id', targetAccountId);
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting contributors:', error);
    }

    // Tombstone already inserted by anonymize_user_data RPC above.



    // Delete the user account using admin client
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(targetAccountId);

    if (deleteUserError) {
      const errorId = crypto.randomUUID();
      console.log('[DELETE-ACCOUNT] Error deleting user:', { errorId, error: deleteUserError });
      return new Response(
        JSON.stringify({ 
          error: 'Account deletion failed. Please try again.',
          errorId 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('[DELETE-ACCOUNT] Successfully deleted user:', targetAccountId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error('[DELETE-ACCOUNT] ERROR in delete-account:', { errorId, error });
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred. Please try again.',
        errorId 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
});
