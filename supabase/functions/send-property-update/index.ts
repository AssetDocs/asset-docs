import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PropertyUpdateRequest {
  userId: string;
  email: string;
  updateType: 'created' | 'updated' | 'deleted' | 'file_added' | 'file_deleted';
  propertyName: string;
  propertyAddress?: string;
  details?: string;
}

const getUpdateTitle = (updateType: string): string => {
  switch (updateType) {
    case 'created': return 'New Property Added';
    case 'updated': return 'Property Updated';
    case 'deleted': return 'Property Removed';
    case 'file_added': return 'File Added to Property';
    case 'file_deleted': return 'File Removed from Property';
    default: return 'Property Update';
  }
};

const getUpdateMessage = (updateType: string, propertyName: string, details?: string): string => {
  switch (updateType) {
    case 'created':
      return `Your property "${propertyName}" has been successfully added to your AssetDocs account.`;
    case 'updated':
      return `Your property "${propertyName}" has been updated.${details ? ` Changes: ${details}` : ''}`;
    case 'deleted':
      return `Your property "${propertyName}" has been removed from your account.`;
    case 'file_added':
      return `A new file has been added to your property "${propertyName}".${details ? ` File: ${details}` : ''}`;
    case 'file_deleted':
      return `A file has been removed from your property "${propertyName}".${details ? ` File: ${details}` : ''}`;
    default:
      return `There has been an update to your property "${propertyName}".`;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, updateType, propertyName, propertyAddress, details }: PropertyUpdateRequest = await req.json();

    console.log(`Processing property update notification for user ${userId}, type: ${updateType}`);

    // Check notification preferences
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications, property_updates')
      .eq('user_id', userId)
      .single();

    // Check master email toggle first, then specific preference
    if (preferences?.email_notifications === false || preferences?.property_updates === false) {
      console.log(`Email or property updates disabled for user ${userId}, skipping email`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Notifications disabled' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const title = getUpdateTitle(updateType);
    const message = getUpdateMessage(updateType, propertyName, details);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <notifications@assetsafe.net>",
      to: [email],
      subject: `${title} - ${propertyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 150px; margin-bottom: 15px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333333; line-height: 1.6;">${message}</p>
              ${propertyAddress ? `<p style="font-size: 14px; color: #666666;"><strong>Address:</strong> ${propertyAddress}</p>` : ''}
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <a href="https://www.assetsafe.net/properties" style="display: inline-block; background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Properties</a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #888888; font-size: 12px;">
              <p>You're receiving this because you have property update notifications enabled.</p>
              <p>Manage your notification preferences in your <a href="https://www.assetsafe.net/account" style="color: #f97316;">account settings</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Property update email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending property update notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
