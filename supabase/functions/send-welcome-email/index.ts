import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
      from: "Asset Docs <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Asset Docs - Let's Protect Your Valuable Assets!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Welcome to Asset Docs!</h1>
          </div>
          
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Hi ${fullName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Asset Docs! We're excited to help you protect and organize your valuable assets with our secure digital documentation platform.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #1e40af; font-size: 20px; margin-top: 0;">🚀 Get Started with These Steps:</h2>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Complete your profile:</strong> Add your personal information and preferences</li>
              <li><strong>Add your first property:</strong> Start documenting your home or business assets</li>
              <li><strong>Upload photos & documents:</strong> Secure your important files in the cloud</li>
              <li><strong>Explore AI features:</strong> Let our AI help identify and value your items</li>
              <li><strong>Set up storage preferences:</strong> Organize your assets with custom folders</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get("origin") || 'https://assetdocs.net'}/account" 
               style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 30px 0;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">💡 Pro Tip:</h3>
            <p style="color: #047857; margin: 0; font-size: 14px;">
              Start by documenting your most valuable items first. Our AI can help identify and estimate values automatically!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance getting started, don't hesitate to reach out to our support team at 
            <a href="mailto:info@assetdocs.net" style="color: #1e40af;">info@assetdocs.net</a>.
          </p>
          
          <p style="color: #666; margin-bottom: 30px;">
            Welcome aboard!<br>
            <strong>The Asset Docs Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This email was sent to ${email}. If you didn't create an account with Asset Docs, please ignore this email.
          </p>
        </div>
      `,
    });

    // Also send notification to business email
    await resend.emails.send({
      from: "Asset Docs Notifications <onboarding@resend.dev>",
      to: ["info@assetdocs.net"],
      subject: `New User Registration: ${fullName}`,
      html: `
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${user_id}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated notification from the Asset Docs registration system.</p>
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