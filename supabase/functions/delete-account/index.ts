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

    // Set the auth header for the client
    supabaseClient.auth.setSession = () => Promise.resolve({ data: { user: null, session: null }, error: null })
    
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

    console.log('[DELETE-ACCOUNT] Verifying user permissions for:', user.id);

    // Check if user is trying to delete an account they only have contributor access to
    const { data: contributorCheck, error: contributorError } = await supabaseAdmin
      .from('contributors')
      .select('account_owner_id, role')
      .eq('contributor_user_id', user.id)
      .neq('account_owner_id', user.id);

    if (contributorError) {
      console.log('[DELETE-ACCOUNT] Error checking contributor status:', contributorError);
    }

    // If user is a contributor to other accounts but trying to delete this account,
    // they can only delete if this is their own account (they are the owner)
    if (contributorCheck && contributorCheck.length > 0) {
      console.log('[DELETE-ACCOUNT] User is a contributor to other accounts, verifying ownership');
      
      // Double-check that this user actually owns this account by checking if they have any data
      const { data: profileCheck } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!profileCheck) {
        console.log('[DELETE-ACCOUNT] User does not own this account');
        return new Response(
          JSON.stringify({ error: 'Access denied. Insufficient permissions.' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    console.log('[DELETE-ACCOUNT] User verified as account owner, proceeding with deletion');

    // Get the user's Stripe customer ID to cancel subscriptions
    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
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

    // Delete user's data from all tables
    const tablesToClean = [
      'subscribers',
      'contacts',
      'contributors',
      'profiles',
      'properties', 
      'property_photos',
      'property_videos',
      'property_documents',
      'items',
      'item_photos',
      'damage_reports',
      'gift_purchases',
      'visitor_accesses',
      'receipts',
      'storage_usage'
    ];

    // Delete data from each table
    for (const table of tablesToClean) {
      try {
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.log(`[DELETE-ACCOUNT] Error deleting from ${table}:`, deleteError);
        } else {
          console.log(`[DELETE-ACCOUNT] Successfully deleted data from ${table}`);
        }
      } catch (error) {
        console.log(`[DELETE-ACCOUNT] Error processing table ${table}:`, error);
      }
    }

    // Delete the user account using admin client
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

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

    console.log('[DELETE-ACCOUNT] Successfully deleted user:', user.id);

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
