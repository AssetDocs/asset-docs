import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StorageWarningRequest {
  email: string;
  name: string;
  usedGB: number;
  totalGB: number;
  percentUsed: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, usedGB, totalGB, percentUsed }: StorageWarningRequest = await req.json();

    if (!email || !name || usedGB === undefined || totalGB === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending storage warning to: ${email} (${usedGB}GB / ${totalGB}GB)`);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [email],
      subject: "⚠️ Storage Quota Warning - Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            <h1 style="color: #dc2626; margin-bottom: 10px;">⚠️ Storage Quota Warning</h1>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <p style="font-size: 18px; color: #374151; margin: 0;">
              Hi ${name}, you're using <strong>${usedGB}GB</strong> of your <strong>${totalGB}GB</strong> storage limit (<strong>${percentUsed}%</strong>).
            </p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937;">What happens when storage is full?</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>You won't be able to upload new photos, videos, or documents</li>
              <li>Your existing files remain safe and accessible</li>
              <li>You can still manage and organize your current content</li>
            </ul>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin-top: 0;">What you can do:</h3>
            <ol style="color: #374151; line-height: 1.6; margin: 0;">
              <li><strong>Upgrade your plan</strong> for more storage</li>
              <li><strong>Delete unwanted files</strong> to free up space</li>
              <li><strong>Review and organize</strong> your current content</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.assetsafe.net/account-settings?tab=subscription" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Upgrade Storage
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #2563eb;">support@assetsafe.net</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Storage warning email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage warning email sent successfully",
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
    console.error("Error sending storage warning email:", error);
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
