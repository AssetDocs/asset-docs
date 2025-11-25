import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrialReminderRequest {
  email: string;
  subscription_tier: string;
  trial_end: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subscription_tier, trial_end }: TrialReminderRequest = await req.json();

    console.log('Processing trial reminder for:', email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile data by email from subscribers table
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('user_id')
      .eq('email', email)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', subscriber?.user_id)
      .single();

    const firstName = profile?.first_name || 'there';

    // Format subscription tier name
    const planName = subscription_tier ? 
      subscription_tier.charAt(0).toUpperCase() + subscription_tier.slice(1) : 
      'Premium';

    // Format trial end date
    const trialEndDate = new Date(trial_end).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get monthly pricing based on plan
    const monthlyPrice = subscription_tier === 'basic' ? '9.99' : 
                        subscription_tier === 'standard' ? '19.99' : '29.99';

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailResponse = await resend.emails.send({
      from: 'Asset Safe <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Asset Safe trial ends in 3 days',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Your Asset Safe trial ends in 3 days</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            We hope you've enjoyed using Asset Safe. Your 30-day trial will end on <strong>${trialEndDate}</strong>.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            No action is needed — your subscription will continue automatically at <strong>$${monthlyPrice}/month</strong>.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            If you'd like to cancel before your trial ends, you can manage your plan anytime:
          </p>
          
          <div style="margin: 30px 0;">
            <a href="https://billing.stripe.com/p/login/test_00000000000000" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              👉 Manage My Subscription
            </a>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Thanks for trusting us to safeguard your home and property.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            – The Asset Safe Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Asset Safe - Protecting what matters most to you
          </p>
        </div>
      `,
    });

    console.log('Trial reminder email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-trial-reminder function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);