import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

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
        targetAccountId = body.target_account_id;
        isAdminDeletion = true;
      }
    } catch {
      // No body provided, deleting own account
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

    // Delete user's data from all tables with user_id column
    // Order matters - delete from tables with foreign keys first
    // Order matters: tables with FK to auth.users must be deleted BEFORE profiles
    // contacts has FK to auth.users so must be early in the list
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
      'payment_events',
      'events',
      'user_roles',
      'audit_logs',
      'paint_codes',
      'financial_accounts',
      'source_websites',
      'document_folders',
      'video_folders',
      'photo_folders',
      'trust_information',
      'password_catalog',
      'storage_usage',
      'subscribers',
      'contacts',  // FK to auth.users - must be before user deletion
      'profiles',  // FK to auth.users - must be last before user deletion
      'entitlements',
      'account_verification',
      'vip_contacts',
      'vip_contact_attachments'
    ];

    // Delete from recovery_requests (uses owner_user_id and delegate_user_id)
    try {
      await supabaseAdmin
        .from('recovery_requests')
        .delete()
        .eq('owner_user_id', targetAccountId);
      
      await supabaseAdmin
        .from('recovery_requests')
        .delete()
        .eq('delegate_user_id', targetAccountId);
      
      console.log('[DELETE-ACCOUNT] Successfully deleted recovery requests');
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting recovery requests:', error);
    }

    // Delete from gift_subscriptions (uses multiple user ID columns)
    try {
      await supabaseAdmin
        .from('gift_subscriptions')
        .delete()
        .eq('purchaser_user_id', targetAccountId);
      
      await supabaseAdmin
        .from('gift_subscriptions')
        .delete()
        .eq('recipient_user_id', targetAccountId);
      
      await supabaseAdmin
        .from('gift_subscriptions')
        .delete()
        .eq('redeemed_by_user_id', targetAccountId);
      
      console.log('[DELETE-ACCOUNT] Successfully deleted gift subscriptions');
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting gift subscriptions:', error);
    }

    // Delete data from tables with user_id column
    for (const table of tablesWithUserId) {
      try {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', targetAccountId);
        
        if (deleteError) {
          console.log(`[DELETE-ACCOUNT] Error deleting from ${table}:`, deleteError);
        } else {
          console.log(`[DELETE-ACCOUNT] Successfully deleted data from ${table}`);
        }
      } catch (error) {
        console.log(`[DELETE-ACCOUNT] Error processing table ${table}:`, error);
      }
    }

    // Delete from contributors table (uses different column names)
    try {
      // Delete where user is a contributor
      await supabaseAdmin
        .from('contributors')
        .delete()
        .eq('contributor_user_id', targetAccountId);
      
      // Delete where user is account owner (their contributors)
      await supabaseAdmin
        .from('contributors')
        .delete()
        .eq('account_owner_id', targetAccountId);
      
      console.log('[DELETE-ACCOUNT] Successfully deleted contributor records');
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting contributors:', error);
    }

    // Delete from account_deletion_requests (uses different column names)
    try {
      await supabaseAdmin
        .from('account_deletion_requests')
        .delete()
        .eq('requester_user_id', targetAccountId);
      
      await supabaseAdmin
        .from('account_deletion_requests')
        .delete()
        .eq('account_owner_id', targetAccountId);
      
      console.log('[DELETE-ACCOUNT] Successfully deleted account deletion requests');
    } catch (error) {
      console.log('[DELETE-ACCOUNT] Error deleting account deletion requests:', error);
    }

    // Get the user's email before deletion to record in deleted_accounts
    const { data: targetUserData, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(targetAccountId);
    const targetUserEmail = targetUserData?.user?.email;
    
    if (targetUserEmail) {
      // Record the email in deleted_accounts to prevent re-login
      const { error: recordError } = await supabaseAdmin
        .from('deleted_accounts')
        .upsert(
          { 
            email: targetUserEmail.toLowerCase(), 
            original_user_id: targetAccountId,
            deleted_by: isAdminDeletion ? 'admin' : 'self'
          },
          { onConflict: 'email' }
        );
      
      if (recordError) {
        console.log('[DELETE-ACCOUNT] Error recording deleted account:', recordError);
      } else {
        console.log('[DELETE-ACCOUNT] Recorded deleted email:', targetUserEmail);
      }
    }

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
