import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const feedbackEmailSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  hearAboutUs: z.string().max(100),
  currentUser: z.enum(['yes', 'no']),
  npsScore: z.string(),
  improvement: z.string().trim().min(1).max(5000),
});

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validatedData = feedbackEmailSchema.parse(body);
    const { name, email, phone, hearAboutUs, currentUser, npsScore, improvement } = validatedData;

    const safeName = escapeHtml(name);
    const safeImprovement = escapeHtml(improvement);
    const safeHearAboutUs = escapeHtml(hearAboutUs);
    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const currentUserText = currentUser === 'yes' ? 'Yes' : 'No';

    // Internal notification
    const emailResponse = await resend.emails.send({
      from: "Asset Safe Feedback <noreply@assetsafe.net>",
      to: ["support@assetsafe.net"],
      subject: `New Feedback Submission from ${safeName}`,
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
        <p><strong>NPS Score:</strong> ${npsScore}/10</p>
        <p><strong>Suggestions:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${safeImprovement.replace(/\n/g, '<br>')}
        </div>
      `,
    });

    // User confirmation
    await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Thank you for your feedback — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Thank You, ${safeName}!</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              We've received your feedback and truly appreciate you taking the time to share your thoughts. Your input helps us improve Asset Safe for everyone.
            </p>

            <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0 0 8px; font-size: 14px; font-weight: 600;">What you shared:</p>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">${safeImprovement.replace(/\n/g, '<br>')}</p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0;">
              – The Asset Safe Team
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${email} because you submitted feedback on Asset Safe.
            </p>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: "Emails sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error("Error in send-feedback-email function:", { errorId, message: error.message });

    let userMessage = "Failed to send feedback email. Please try again.";
    if (error instanceof z.ZodError) {
      userMessage = "Invalid input data. Please check your information.";
    }

    return new Response(
      JSON.stringify({ error: userMessage, errorId }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
