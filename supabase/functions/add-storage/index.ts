import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ADD-STORAGE] Function started');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('[ADD-STORAGE] User authenticated:', user.id);

    // Get user profile to check current storage
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, storage_quota_gb')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new Error('No Stripe customer found');
    }

    console.log('[ADD-STORAGE] Creating checkout session for storage add-on');

    // Create Stripe checkout session for storage add-on
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Storage Add-on - 50GB',
              description: 'Additional 50GB of secure cloud storage',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'https://www.assetsafe.net'}/account?storage_added=true`,
      cancel_url: `${req.headers.get('origin') || 'https://www.assetsafe.net'}/account-settings?tab=subscription`,
      metadata: {
        user_id: user.id,
        type: 'storage_addon',
        storage_amount_gb: '50',
      },
    });

    console.log('[ADD-STORAGE] Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[ADD-STORAGE] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});