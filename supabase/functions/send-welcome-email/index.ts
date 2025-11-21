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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, first_name, last_name }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email for:", { user_id, email, first_name });

    const fullName = first_name && last_name ? `${first_name} ${last_name}` : first_name || "Valued Customer";

    // Send welcome email to the new user
    const emailResponse = await resend.emails.send({
      from: "Asset Safe <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Asset Safe - Let's Protect Your Valuable Assets!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Welcome to Asset Safe!</h1>
          </div>
          
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Hi ${fullName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're thrilled to have you join the Asset Safe community! You're now part of a growing network of homeowners, renters, and business owners who are taking control of their asset protection and documentation.
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #1e40af;">
            <h2 style="color: #1e40af; font-size: 20px; margin-top: 0;">🎉 Your 30-Day Free Trial Starts Now!</h2>
            <p style="color: #1e3a8a; margin: 0; font-size: 16px;">
              No credit card required - explore all these features during your trial period.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #10b981; font-size: 18px; margin-top: 0;">✅ What's Included in Your Free Trial:</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
              <li><strong>Account Settings:</strong> Personalize your profile and preferences</li>
              <li><strong>Property Profiles:</strong> Create detailed profiles for all your properties</li>
              <li><strong>Photo Upload & Management:</strong> Secure cloud storage for your asset photos</li>
              <li><strong>Asset Valuation:</strong> AI-powered identification and valuation of your items</li>
            </ul>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; font-size: 18px; margin-top: 0;">🔒 Premium Features (Available After Subscription):</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
              <li><strong>Video Upload & Management:</strong> Store and organize video documentation</li>
              <li><strong>Document Storage:</strong> Secure storage for receipts, warranties, and contracts</li>
              <li><strong>Insurance Information:</strong> Comprehensive insurance tracking and management</li>
              <li><strong>Export Assets:</strong> Download your data in various formats</li>
              <li><strong>Download Files:</strong> Access all your stored files offline</li>
              <li><strong>Post Damage Reporting:</strong> Document and report damage claims</li>
              <li><strong>Voice Notes:</strong> Audio recording and management features</li>
            </ul>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #1e40af; font-size: 18px; margin-top: 0;">📚 Helpful Resources:</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 15px 0;">
              <a href="${req.headers.get("origin") || 'https://www.assetsafe.net'}/video-help" style="color: #1e40af; text-decoration: none; padding: 8px 16px; background: #e0f2fe; border-radius: 5px; font-size: 14px;">📹 Video Help</a>
              <a href="${req.headers.get("origin") || 'https://www.assetsafe.net'}/resources" style="color: #1e40af; text-decoration: none; padding: 8px 16px; background: #e0f2fe; border-radius: 5px; font-size: 14px;">📖 Resources</a>
              <a href="${req.headers.get("origin") || 'https://www.assetsafe.net'}/social-impact" style="color: #1e40af; text-decoration: none; padding: 8px 16px; background: #e0f2fe; border-radius: 5px; font-size: 14px;">🌍 Social Impact</a>
              <a href="${req.headers.get("origin") || 'https://www.assetsafe.net'}/qa" style="color: #1e40af; text-decoration: none; padding: 8px 16px; background: #e0f2fe; border-radius: 5px; font-size: 14px;">❓ Q&A</a>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get("origin") || 'https://www.assetsafe.net'}/account" 
               style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
              Start Your Free Trial Now
            </a>
          </div>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 30px 0;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">💡 Getting Started Tip:</h3>
            <p style="color: #047857; margin: 0; font-size: 14px;">
              Begin by adding your most valuable items and take advantage of our AI-powered identification and valuation features!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Questions? Need help getting started? Our support team is here to help at 
            <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
          </p>
          
          <p style="color: #666; margin-bottom: 30px;">
            Welcome to your digital safety net!<br>
            <strong>The Asset Safe Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This email was sent to ${email}. If you didn't create an account with Asset Safe, please ignore this email.
          </p>
        </div>
      `,
    });

    // Also send notification to business email
    await resend.emails.send({
      from: "Asset Safe Notifications <onboarding@resend.dev>",
      to: ["support@assetsafe.net"],
      subject: `New User Registration: ${fullName}`,
      html: `
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${user_id}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated notification from the Asset Safe registration system.</p>
      `,
    });

    console.log("Welcome emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Welcome emails sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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