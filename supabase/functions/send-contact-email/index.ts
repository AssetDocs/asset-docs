import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validation schema for contact form
const contactEmailSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  telephone: z.string().max(20),
  message: z.string().trim().min(1).max(5000),
  hearAboutUs: z.string().max(100)
});

// Helper function to escape HTML
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input data
    const validatedData = contactEmailSchema.parse(body);
    const { name, email, telephone, message, hearAboutUs } = validatedData;
    
    // Escape HTML for safe email rendering
    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message);
    const safeHearAboutUs = escapeHtml(hearAboutUs);
    const safeTelephone = escapeHtml(telephone);

    console.log("Sending contact email for:", { email });

    // Send email to your business address
    const emailResponse = await resend.emails.send({
      from: "Asset Safe Contact <contact@assetsafe.net>",
      to: ["support@assetsafe.net"],
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
        </div>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${safeTelephone}</p>
        <p><strong>How they heard about us:</strong> ${safeHearAboutUs}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${safeMessage.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from the Asset Safe contact form.</p>
      `,
    });

    // Log the response for debugging
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Emails sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error("Error in send-contact-email function:", { errorId, message: error.message });
    
    let userMessage = "Failed to send contact email. Please try again.";
    if (error instanceof z.ZodError) {
      userMessage = "Invalid input data. Please check your information.";
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        errorId 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);