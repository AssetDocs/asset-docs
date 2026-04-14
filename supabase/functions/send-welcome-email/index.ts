import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, first_name, last_name }: WelcomeEmailRequest = await req.json();
    console.log("Sending welcome email for:", { user_id, email, first_name });

    const fullName = first_name && last_name ? `${first_name} ${last_name}` : first_name || "there";
    const dashboardUrl = "https://www.getassetsafe.com/welcome";
    const baseUrl = "https://www.getassetsafe.com";

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Welcome to Asset Safe — Let's Get Started",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Welcome to Asset Safe!</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hi ${fullName}, we're glad you're here. You've taken an important step toward protecting what matters most.
            </p>

            <div style="background: #f0f9ff; padding: 16px 20px; border-radius: 6px; border-left: 4px solid #1e40af; margin: 0 0 20px;">
              <p style="color: #1e3a8a; margin: 0; font-size: 15px; font-weight: 600;">Your 30-day free trial is now active</p>
              <p style="color: #1e3a8a; margin: 6px 0 0; font-size: 14px;">No credit card required — explore all features during your trial.</p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What you can do right away:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Create property profiles for your home and assets</li>
              <li>Upload and organize photos securely</li>
              <li>Use AI-powered identification and valuation</li>
              <li>Invite trusted people as authorized users</li>
            </ul>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${dashboardUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Go to My Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${dashboardUrl}" style="color: #1e40af; word-break: break-all;">${dashboardUrl}</a>
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">Helpful resources:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li><a href="${baseUrl}/video-help" style="color: #1e40af;">Video Tutorials</a> — Step-by-step guides</li>
              <li><a href="${baseUrl}/resources" style="color: #1e40af;">Resources</a> — Best practices</li>
              <li><a href="${baseUrl}/qa" style="color: #1e40af;">Q&amp;A</a> — Common questions answered</li>
            </ul>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px;">
              Questions? Reach us anytime at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
            </p>

            <p style="color: #374151; margin: 20px 0 0;">
              – The Asset Safe Team
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${email}. If you didn't create an account with Asset Safe, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    // Internal notification
    await resend.emails.send({
      from: "Asset Safe Notifications <noreply@assetsafe.net>",
      to: ["support@assetsafe.net"],
      subject: `New User Registration: ${fullName}`,
      html: `
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${user_id}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Automated notification from Asset Safe.</p>
      `,
    });

    console.log("Welcome emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Welcome emails sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
