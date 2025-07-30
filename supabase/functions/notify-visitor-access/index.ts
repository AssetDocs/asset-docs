import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VisitorAccessRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email }: VisitorAccessRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Send notification email to info@assetdocs.net
    const emailResponse = await resend.emails.send({
      from: "AssetDocs Notifications <onboarding@resend.dev>",
      to: ["info@assetdocs.net"],
      subject: "New Visitor Access - AssetDocs Website",
      html: `
        <h2>New Visitor Access Notification</h2>
        <p>A new visitor has requested access to the AssetDocs website:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>This visitor has now been granted access to browse the website.</p>
        <hr>
        <p><em>This is an automated notification from AssetDocs.</em></p>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Access granted and notification sent" 
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
    console.error("Error in notify-visitor-access function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);