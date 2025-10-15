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
      from: "Asset Docs Contact <onboarding@resend.dev>",
      to: ["info@assetdocs.net"],
      subject: `New Contact Form Submission from ${name}`,
      html: `
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
        <p style="color: #666; font-size: 12px;">This email was sent from the Asset Docs contact form.</p>
      `,
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: "Asset Docs <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting Asset Docs",
      html: `
        <h2>Thank you for contacting us, ${safeName}!</h2>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of what you sent:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Message:</strong></p>
          ${safeMessage.replace(/\n/g, '<br>')}
        </div>
        <p>Best regards,<br>The Asset Docs Team</p>
      `,
    });

    console.log("Contact emails sent successfully:", emailResponse);

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