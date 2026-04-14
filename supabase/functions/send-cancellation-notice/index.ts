import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

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
    console.log("[SEND-CANCELLATION-NOTICE] Starting");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { owner_user_id, owner_name, billing_end_date }: CancellationNoticeRequest = await req.json();
    if (!owner_user_id || !billing_end_date) throw new Error("Missing required parameters");

    // Get the owner's account
    const { data: account } = await supabaseClient
      .from('accounts')
      .select('id')
      .eq('owner_user_id', owner_user_id)
      .single();

    if (!account) {
      console.log("[SEND-CANCELLATION-NOTICE] No account found for owner");
      return new Response(JSON.stringify({ success: true, message: "No account found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch active memberships (non-owner) for this account
    const { data: memberships, error: membershipsError } = await supabaseClient
      .from('account_memberships')
      .select('user_id, role')
      .eq('account_id', account.id)
      .eq('status', 'active')
      .neq('role', 'owner');

    if (membershipsError || !memberships || memberships.length === 0) {
      console.log("[SEND-CANCELLATION-NOTICE] No authorized users to notify");
      return new Response(JSON.stringify({ success: true, message: "No authorized users to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const endDate = new Date(billing_end_date);
    const formattedEndDate = endDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const emailsSent = [];
    const emailsFailed = [];

    for (const membership of memberships) {
      try {
        // Get user email and profile
        const { data: authUser } = await supabaseClient.auth.admin.getUserById(membership.user_id);
        if (!authUser?.user?.email) continue;

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', membership.user_id)
          .single();

        const memberName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'there'
          : 'there';
        const roleLabel = membership.role === 'full_access' ? 'Full Access' : 'Read Only';

        await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [authUser.user.email],
          subject: "Important: Account Subscription Cancellation Notice — Asset Safe",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
              <div style="text-align: center; padding: 30px 20px 20px;">
                <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
              </div>

              <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
                <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Subscription Cancellation Notice</h2>

                <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hi ${memberName},</p>

                <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
                  The Asset Safe account you have access to has been scheduled for cancellation by its owner.
                </p>

                <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                  <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Account Owner:</strong> ${owner_name}</p>
                  <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Your Access Level:</strong> ${roleLabel}</p>
                  <p style="color: #374151; margin: 0; font-size: 14px;"><strong>Access Available Until:</strong> ${formattedEndDate}</p>
                </div>

                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What you should do:</p>
                <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
                  <li>Download or export any records you may need</li>
                  <li>Save any important information</li>
                  <li>Contact the account owner if you have questions</li>
                </ul>

                <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 14px;">
                  If you believe this was done in error, please contact the account owner directly or reach us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
                </p>
              </div>

              <div style="padding: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from Asset Safe.</p>
              </div>
            </div>
          `,
        });

        emailsSent.push(authUser.user.email);
      } catch (emailError: any) {
        emailsFailed.push({ userId: membership.user_id, error: emailError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent: emailsSent.length, emailsFailed: emailsFailed.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("[SEND-CANCELLATION-NOTICE] Error:", error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
