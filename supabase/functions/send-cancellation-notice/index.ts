import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationNoticeRequest {
  owner_user_id: string;
  owner_name: string;
  billing_end_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-CANCELLATION-NOTICE] Starting function");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { owner_user_id, owner_name, billing_end_date }: CancellationNoticeRequest = await req.json();

    if (!owner_user_id || !billing_end_date) {
      throw new Error("Missing required parameters: owner_user_id and billing_end_date");
    }

    console.log("[SEND-CANCELLATION-NOTICE] Fetching contributors for owner:", owner_user_id);

    // Fetch all contributors for this owner
    const { data: contributors, error: contributorsError } = await supabaseClient
      .from('contributors')
      .select('contributor_email, first_name, last_name, role')
      .eq('account_owner_id', owner_user_id)
      .eq('status', 'accepted');

    if (contributorsError) {
      throw new Error(`Error fetching contributors: ${contributorsError.message}`);
    }

    if (!contributors || contributors.length === 0) {
      console.log("[SEND-CANCELLATION-NOTICE] No contributors found for this owner");
      return new Response(
        JSON.stringify({ success: true, message: "No contributors to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SEND-CANCELLATION-NOTICE] Found ${contributors.length} contributors to notify`);

    // Format the billing end date
    const endDate = new Date(billing_end_date);
    const formattedEndDate = endDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailsSent = [];
    const emailsFailed = [];

    for (const contributor of contributors) {
      const contributorName = `${contributor.first_name || ''} ${contributor.last_name || ''}`.trim() || 'Contributor';
      const roleDisplay = contributor.role.charAt(0).toUpperCase() + contributor.role.slice(1);

      try {
        const emailResponse = await resend.emails.send({
          from: "Asset Safe <no-reply@assetsafe.net>",
          to: [contributor.contributor_email],
          subject: `Important: Account Subscription Cancellation Notice`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://leotcbfpqiekgkgumecn.supabase.co/storage/v1/object/public/photos/email-assets/asset-safe-logo.jpg" alt="Asset Safe" style="height: 60px;" />
              </div>
              
              <h1 style="color: #1a365d; margin-bottom: 20px;">Subscription Cancellation Notice</h1>
              
              <p>Hello ${contributorName},</p>
              
              <p>We are writing to inform you that the Asset Safe account you have ${roleDisplay} access to has been scheduled for cancellation.</p>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">⚠️ Important Information</h3>
                <p style="margin-bottom: 5px;"><strong>Account Owner:</strong> ${owner_name}</p>
                <p style="margin-bottom: 5px;"><strong>Your Access Level:</strong> ${roleDisplay}</p>
                <p style="margin-bottom: 0;"><strong>Access Available Until:</strong> ${formattedEndDate}</p>
              </div>
              
              <p>You will continue to have access to the account until <strong>${formattedEndDate}</strong>. After this date, your authorized user access will be deactivated and you will no longer be able to view or manage the account's data.</p>
              
              <h3 style="color: #1a365d;">What You Should Do</h3>
              <ul>
                <li>Download or export any personal records you may need</li>
                <li>Ensure you have saved any important information</li>
                <li>Contact the account owner if you have questions about this cancellation</li>
              </ul>
              
              <p style="margin-top: 30px;">If you believe this was done in error, please contact the account owner directly.</p>
              
              <p>Thank you for using Asset Safe.</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              
              <p style="font-size: 12px; color: #666;">
                This is an automated notification from Asset Safe. If you have any questions, please contact us at 
                <a href="mailto:support@assetsafe.net" style="color: #0066cc;">support@assetsafe.net</a>
              </p>
            </body>
            </html>
          `,
        });

        console.log(`[SEND-CANCELLATION-NOTICE] Email sent to ${contributor.contributor_email}:`, emailResponse);
        emailsSent.push(contributor.contributor_email);
      } catch (emailError: any) {
        console.error(`[SEND-CANCELLATION-NOTICE] Failed to send email to ${contributor.contributor_email}:`, emailError);
        emailsFailed.push({ email: contributor.contributor_email, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsSent.length,
        emailsFailed: emailsFailed.length,
        details: { sent: emailsSent, failed: emailsFailed }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[SEND-CANCELLATION-NOTICE] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
