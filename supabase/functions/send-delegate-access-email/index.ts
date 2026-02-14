import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

// Internal secret for function-to-function calls
const INTERNAL_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface DelegateAccessEmailData {
  delegateEmail: string;
  delegateName: string;
  ownerName: string;
  ownerEmail: string;
  legacyLockerId: string;
  delegateUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate internal secret header - only allow calls from trusted internal sources
    const internalSecret = req.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== INTERNAL_SECRET) {
      console.error("Unauthorized: Missing or invalid internal secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      delegateEmail, 
      delegateName, 
      ownerName, 
      ownerEmail,
      legacyLockerId,
      delegateUserId 
    }: DelegateAccessEmailData = await req.json();

    // Input validation
    if (!delegateEmail || !legacyLockerId || !delegateUserId) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate that the locker exists and has this delegate assigned
    const { data: locker, error: lockerError } = await supabase
      .from('legacy_locker')
      .select('id, user_id, delegate_user_id, recovery_status')
      .eq('id', legacyLockerId)
      .single();

    if (lockerError || !locker) {
      console.error("Legacy locker not found:", legacyLockerId);
      return new Response(
        JSON.stringify({ error: "Legacy locker not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (locker.delegate_user_id !== delegateUserId) {
      console.error("Delegate mismatch: provided delegate does not match locker's delegate");
      return new Response(
        JSON.stringify({ error: "Invalid delegate for this locker" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only process if in grace_period_active status
    if (locker.recovery_status !== 'grace_period_active') {
      console.log("Locker not in grace_period_active status, skipping:", locker.recovery_status);
      return new Response(
        JSON.stringify({ message: "Locker not in active grace period" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending delegate access email to:", delegateEmail);

    // Generate a unique acknowledgment token
    const acknowledgmentToken = crypto.randomUUID();

    // Update the legacy_locker with the acknowledgment status
    const { error: updateError } = await supabase
      .from('legacy_locker')
      .update({ 
        recovery_status: 'awaiting_acknowledgment',
        updated_at: new Date().toISOString()
      })
      .eq('id', legacyLockerId);

    if (updateError) {
      console.error("Error updating legacy locker:", updateError);
      throw updateError;
    }

    // Store the acknowledgment token in recovery_requests table
    const { error: insertError } = await supabase
      .from('recovery_requests')
      .insert({
        legacy_locker_id: legacyLockerId,
        delegate_user_id: delegateUserId,
        owner_user_id: locker.user_id,
        status: 'grace_period_expired',
        grace_period_ends_at: new Date().toISOString(),
        reason: 'Grace period expired - awaiting delegate acknowledgment',
        relationship: 'Recovery Delegate'
      });

    if (insertError) {
      console.error("Error creating recovery request:", insertError);
      // Continue anyway - this is not critical
    }

    const acknowledgmentUrl = `https://www.getassetsafe.com/acknowledge-access?token=${acknowledgmentToken}&lockerId=${legacyLockerId}&delegateId=${delegateUserId}`;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [delegateEmail],
      subject: `Grace Period Expired - Access Granted to ${ownerName}'s Secure Vault`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-width: 150px; height: auto; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
              .button { display: inline-block; padding: 14px 28px; background: #eab308; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
              .important { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; }
              .checkbox-section { background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" class="logo" />
              </div>
              
              <div class="content">
                <h2>Grace Period Has Expired</h2>
                
                <p>Hello ${delegateName},</p>
                
                <div class="warning">
                  <strong>⏰ Grace Period Complete:</strong> The recovery grace period for <strong>${ownerName}'s</strong> encrypted Secure Vault has expired. You have been designated as their Recovery Delegate and now have access to their account.
                </div>
                
                <p><strong>Before you proceed, please acknowledge your responsibilities:</strong></p>
                
                <div class="checkbox-section">
                  <p style="margin-top: 0;"><strong>By clicking the button below, I acknowledge that:</strong></p>
                  <ul>
                    <li>I now have <strong>full access</strong> to ${ownerName}'s Secure Vault (Password Catalog & Legacy Locker)</li>
                    <li>I am <strong>responsible</strong> for their account, including:
                      <ul>
                        <li>Retrieving and managing files</li>
                        <li>Exporting reports and documents</li>
                        <li>Account management and potential deletion</li>
                      </ul>
                    </li>
                    <li>I will handle this sensitive information with <strong>care and discretion</strong></li>
                    <li>I understand this access is granted due to my role as Recovery Delegate</li>
                  </ul>
                </div>
                
                <center>
                  <a href="${acknowledgmentUrl}" class="button">
                    ✓ I Acknowledge - Grant Me Access
                  </a>
                </center>
                
                <div class="important">
                  <strong>⚠️ Important:</strong> You must click the acknowledgment button above to activate your access. This ensures you understand and accept your responsibilities as the Recovery Delegate.
                </div>
                
                <p><strong>What you can do after acknowledgment:</strong></p>
                <ul>
                  <li>Access all encrypted passwords and financial accounts</li>
                  <li>View Legacy Locker documents, photos, and voice notes</li>
                  <li>Review important contacts and instructions</li>
                  <li>Export data and generate reports</li>
                  <li>Manage account settings if necessary</li>
                </ul>
                
                <p style="color: #666; font-size: 14px;">Account Owner: ${ownerName} (${ownerEmail})</p>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Asset Safe.</p>
                <p>If you have questions, contact support@assetsafe.net</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Delegate access email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending delegate access email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
