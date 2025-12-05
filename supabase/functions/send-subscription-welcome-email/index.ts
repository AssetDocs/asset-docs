import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  subscription_tier: string;
  trial_end?: string | null;
  current_period_end: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subscription_tier, trial_end, current_period_end }: WelcomeEmailRequest = await req.json();

    console.log('Sending subscription welcome email to:', email);

    // Initialize Supabase client to get user profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile to extract first name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', '(SELECT id FROM auth.users WHERE email = $1)')
      .single();

    // Get user from auth.users table
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);
    
    let firstName = 'there';
    if (user) {
      // Try to get from profiles table first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .single();
      
      firstName = profileData?.first_name || 
                 user.user_metadata?.first_name || 
                 'there';
    }

    // Format plan name
    const planNames: { [key: string]: string } = {
      'basic': 'Basic',
      'standard': 'Standard', 
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    const planName = planNames[subscription_tier] || subscription_tier;

    // Calculate billing date
    const billingDate = trial_end ? 
      new Date(trial_end).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) :
      new Date(current_period_end).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

    const trialText = trial_end ? 'with a 30-day free trial' : '';
    const billingText = trial_end ? 
      `Your first billing date will be ${billingDate}, unless you cancel before then.` :
      `Your next billing date is ${billingDate}.`;

    const dashboardUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/welcome`;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <info@assetsafe.net>",
      to: [email],
      subject: `Welcome to Asset Safe — Your ${planName} Plan is Active!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>
          <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Asset Safe!</h1>
          
          <p>Hi ${firstName},</p>
          
          <p>Your account is now active! You're on the <strong>${planName} Plan</strong> ${trialText}.</p>
          
          <p><strong>You'll have access to:</strong></p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Secure cloud storage for your property records</li>
            <li>Photo &amp; video uploads</li>
            <li>Verified documentation features</li>
            <li>Sharing with trusted contacts</li>
          </ul>
          
          <p>${billingText}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              👉 Go to My Dashboard
            </a>
          </div>
          
          <h3 style="color: #2563eb; margin-top: 30px;">Get Started with These Resources:</h3>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li><a href="${dashboardUrl.replace('/welcome', '/video-help')}" style="color: #2563eb;">Video Tutorials</a> - Step-by-step guides</li>
            <li><a href="${dashboardUrl.replace('/welcome', '/resources')}" style="color: #2563eb;">Resources &amp; Security</a> - Best practices</li>
            <li><a href="${dashboardUrl.replace('/welcome', '/awareness-guide')}" style="color: #2563eb;">Awareness Guide</a> - Important tips</li>
            <li><a href="${dashboardUrl.replace('/welcome', '/qa')}" style="color: #2563eb;">Q&amp;A</a> - Common questions answered</li>
          </ul>
          
          <p style="margin-top: 30px;">We're excited to protect what matters most to you.</p>
          
          <p style="margin-bottom: 0;">– The Asset Safe Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            If you have any questions, reply to this email or visit our support center.
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);