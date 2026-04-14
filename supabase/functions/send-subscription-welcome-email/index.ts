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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subscription_tier, trial_end, current_period_end }: WelcomeEmailRequest = await req.json();
    console.log('Sending subscription welcome email to:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    let firstName = 'there';
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .single();
      firstName = profileData?.first_name || user.user_metadata?.first_name || 'there';
    }

    const planNames: { [key: string]: string } = {
      'basic': 'Basic', 'standard': 'Standard', 'premium': 'Premium', 'enterprise': 'Enterprise',
    };
    const planName = planNames[subscription_tier] || subscription_tier;
    const billingDate = new Date(current_period_end).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const dashboardUrl = 'https://www.getassetsafe.com/welcome';
    const baseUrl = 'https://www.getassetsafe.com';

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: `Welcome to Asset Safe — Your ${planName} Plan is Active!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Welcome to Asset Safe!</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hi ${firstName}, your account is now active! You're on the <strong>${planName} Plan</strong>.
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">You now have access to:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li>Secure cloud storage for your property records</li>
              <li>Photo &amp; video uploads</li>
              <li>Verified documentation features</li>
              <li>Sharing with trusted authorized users</li>
            </ul>

            <p style="color: #6b7280; font-size: 14px; margin: 0 0 25px;">Your next billing date is <strong>${billingDate}</strong>.</p>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${dashboardUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Go to My Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${dashboardUrl}" style="color: #1e40af; word-break: break-all;">${dashboardUrl}</a>
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">Get started:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li><a href="${baseUrl}/video-help" style="color: #1e40af;">Video Tutorials</a></li>
              <li><a href="${baseUrl}/resources" style="color: #1e40af;">Resources &amp; Security</a></li>
              <li><a href="${baseUrl}/qa" style="color: #1e40af;">Q&amp;A</a></li>
            </ul>

            <p style="color: #374151; margin: 20px 0 0;">– The Asset Safe Team</p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If you have any questions, contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
