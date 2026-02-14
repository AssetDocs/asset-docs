import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validation schema for feedback form
const feedbackEmailSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  hearAboutUs: z.string().max(100),
  currentUser: z.enum(['yes', 'no']),
  npsScore: z.string(),
  improvement: z.string().trim().min(1).max(5000),
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
    const validatedData = feedbackEmailSchema.parse(body);
    const { name, email, phone, hearAboutUs, currentUser, npsScore, improvement } = validatedData;
    
    // Escape HTML for safe email rendering
    const safeName = escapeHtml(name);
    const safeImprovement = escapeHtml(improvement);
    const safeHearAboutUs = escapeHtml(hearAboutUs);
    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const currentUserText = currentUser === 'yes' ? 'Yes' : 'No';

    console.log("Sending feedback email for:", { email });

    // Send email to your business address
    const emailResponse = await resend.emails.send({
      from: "Asset Safe Feedback <onboarding@resend.dev>",
      to: ["support@assetsafe.net"],
      subject: `New Feedback Submission from ${name}`,
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
        </div>
        <h2>New Feedback Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>How they heard about us:</strong> ${safeHearAboutUs}</p>
        <p><strong>Current User:</strong> ${currentUserText}</p>
        <p><strong>NPS Score (Likelihood to Recommend):</strong> ${npsScore}/10</p>
        <p><strong>Improvement Suggestions:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${safeImprovement.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from the Asset Safe feedback form.</p>
      `,
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: "Asset Safe <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for your feedback",
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
        </div>
        <h2>Thank you for your feedback, ${safeName}!</h2>
        <p>We have received your feedback and truly appreciate you taking the time to share your thoughts with us.</p>
        <p>Your input helps us improve AssetSafe and better serve our community.</p>
        <p>Here's a copy of what you shared:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Improvement Suggestions:</strong></p>
          ${safeImprovement.replace(/\n/g, '<br>')}
        </div>
        <p>Best regards,<br>The Asset Safe Team</p>
      `,
    });

    console.log("Feedback emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Emails sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error("Error in send-feedback-email function:", { errorId, message: error.message });
    
    let userMessage = "Failed to send feedback email. Please try again.";
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
