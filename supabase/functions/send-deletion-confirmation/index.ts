import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeletionConfirmationRequest {
  email: string;
  name: string;
  deletionDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, deletionDate }: DeletionConfirmationRequest = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Email and name are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending account deletion confirmation to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [email],
      subject: "Account Deletion Confirmation - Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            <h1 style="color: #1f2937; margin-bottom: 10px;">Account Deletion Confirmed</h1>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Hi ${name},
            </p>
            <p style="color: #374151; line-height: 1.6;">
              Your Asset Safe account has been successfully deleted as of ${new Date(deletionDate || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937;">What's been deleted:</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>All your uploaded photos, videos, and documents</li>
              <li>Your property profiles and asset inventory</li>
              <li>All personal information and account data</li>
              <li>Your subscription and billing history</li>
            </ul>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="color: #374151; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> This action is permanent and cannot be undone. All your data has been securely removed from our systems.
            </p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              We're sorry to see you go. If you deleted your account by mistake or would like to return in the future, you can always create a new account at:
            </p>
            <p style="margin: 0; text-align: center;">
              <a href="https://www.assetsafe.net/auth" style="color: #2563eb; font-weight: bold;">www.assetsafe.net</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions or feedback, please contact us at <a href="mailto:support@assetsafe.net" style="color: #2563eb;">support@assetsafe.net</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 15px;">
              Thank you for using Asset Safe. We hope to see you again in the future.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Account deletion confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Deletion confirmation email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending deletion confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
