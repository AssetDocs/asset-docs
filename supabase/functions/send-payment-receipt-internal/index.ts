import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PaymentReceiptEmail } from './_templates/payment-receipt.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      amount, 
      currency, 
      transactionId, 
      planType 
    } = await req.json();

    console.log('Sending payment receipt to:', customerEmail);

    if (!customerEmail) {
      console.error('No customer email provided');
      return new Response(
        JSON.stringify({ error: 'No customer email provided' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const planName = planType === 'premium' ? 'Premium Plan' : 'Standard Plan';

    // Render the email template
    const html = await renderAsync(
      React.createElement(PaymentReceiptEmail, {
        customerName: customerName || 'Customer',
        customerEmail,
        amount: amount || 0,
        currency: currency || 'usd',
        paymentDate,
        planName,
        transactionId: transactionId || '',
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'AssetSafe <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Payment Receipt - ${planName}`,
      html,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log('Receipt email sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-payment-receipt-internal:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
