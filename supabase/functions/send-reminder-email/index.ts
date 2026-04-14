import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  recipient_email: string;
  recipient_name: string;
  plan_type: string;
  gift_code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_email, recipient_name, plan_type, gift_code }: ReminderEmailRequest = await req.json();
    console.log('Sending reminder email to:', recipient_email);

    const planDisplayName = plan_type === 'basic' ? 'Basic' : plan_type === 'standard' ? 'Standard' : 'Premium';
    const billingUrl = "https://www.getassetsafe.com/login";

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [recipient_email],
      subject: "Your Asset Safe subscription expires soon — Update billing to continue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">⏰ Action Required</h2>

            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                Your ${planDisplayName} subscription from gift code <strong>${gift_code}</strong> expires in 1 month.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hi ${recipient_name}, we hope you've been enjoying Asset Safe! To continue protecting and documenting your assets, please update your billing information before your gifted subscription ends.
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">Why continue?</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Keep your asset documentation secure and accessible</li>
              <li>Continue using AI valuation features</li>
              <li>Maintain your organized photo and document galleries</li>
              <li>Export capabilities for insurance claims</li>
            </ul>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${billingUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Update Billing Information
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${billingUrl}" style="color: #1e40af; word-break: break-all;">${billingUrl}</a>
            </p>

            <p style="color: #374151; font-size: 14px; margin: 0;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Asset Safe. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Reminder email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
