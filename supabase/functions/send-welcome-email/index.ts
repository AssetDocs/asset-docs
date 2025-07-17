import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();
    
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || "there";

    const emailResponse = await resend.emails.send({
      from: "MyInventory <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to MyInventory!",
      html: `
        <h1>Welcome to MyInventory, ${displayName}!</h1>
        <p>Thank you for creating your account. We're excited to help you manage your inventory with ease.</p>
        
        <h2>Getting Started:</h2>
        <ul>
          <li>📱 Complete your profile setup</li>
          <li>📋 Add your first property</li>
          <li>📸 Start uploading photos of your items</li>
          <li>🔍 Explore our AI-powered valuation features</li>
        </ul>
        
        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The MyInventory Team</p>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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