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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { recipient_email, recipient_name, plan_type, gift_code }: ReminderEmailRequest = await req.json();

    console.log('Sending reminder email to:', recipient_email);

    const planDisplayName = plan_type === 'basic' ? 'Basic' : 
                           plan_type === 'standard' ? 'Standard' : 'Premium';

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [recipient_email],
      subject: "⏰ Your Asset Safe subscription expires soon - Update billing to continue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
              <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Asset Safe</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Professional Asset Documentation</p>
            </div>
            
            <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
              <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px;">⏰ Action Required</h2>
              <p style="color: #92400e; margin: 0; font-size: 16px;">
                Your ${planDisplayName} subscription from gift code <strong>${gift_code}</strong> expires in 1 month.
              </p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937;">Hi ${recipient_name},</h3>
              <p style="color: #374151; line-height: 1.6;">
                We hope you've been enjoying Asset Safe! Your gifted ${planDisplayName} subscription is set to expire in one month. 
                To continue protecting and documenting your valuable assets, you'll need to update your billing information.
              </p>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Why continue with Asset Safe?</h3>
              <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Keep your asset documentation secure and accessible</li>
                <li>Continue using advanced AI valuation features</li>
                <li>Maintain your organized photo and document galleries</li>
                <li>Access premium customer support</li>
                <li>Export capabilities for insurance claims</li>
              </ul>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937;">What happens next?</h3>
              <ol style="color: #374151; line-height: 1.6;">
                <li>Click the button below to update your billing information</li>
                <li>Choose your preferred subscription plan</li>
                <li>Continue enjoying uninterrupted access to all features</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://www.getassetsafe.com/login" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Update Billing Information
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Questions? Reply to this email or contact us at <a href="mailto:support@assetsafe.net" style="color: #2563eb;">support@assetsafe.net</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                © 2024 Asset Safe. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Reminder email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending reminder email:", error);
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