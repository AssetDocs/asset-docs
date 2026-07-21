import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase service configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const normalizedEmail = String(customerEmail).trim().toLowerCase();
    const receiptKey = transactionId
      ? `payment_receipt:${transactionId}:${normalizedEmail}`
      : null;

    if (receiptKey) {
      const { data: existing, error: existingError } = await supabase
        .from("subscription_email_events")
        .select("id, status, resend_message_id")
        .eq("idempotency_key", receiptKey)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking receipt idempotency:", existingError);
        throw existingError;
      }

      if (existing?.status === "sent" || existing?.status === "pending") {
        console.log("Skipping duplicate payment receipt:", receiptKey);
        return new Response(
          JSON.stringify({
            success: true,
            skipped: true,
            reason: "duplicate_receipt",
            emailId: existing.resend_message_id,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const reserveQuery = existing
        ? supabase
            .from("subscription_email_events")
            .update({ status: "pending" })
            .eq("idempotency_key", receiptKey)
        : supabase
            .from("subscription_email_events")
            .insert({
              account_id: null,
              user_id: null,
              event_type: "payment_receipt",
              recipient_email: normalizedEmail,
              status: "pending",
              idempotency_key: receiptKey,
            });

      const { error: reserveError } = await reserveQuery;

      if (reserveError) {
        if (reserveError.code === "23505") {
          console.log("Skipping duplicate payment receipt after reservation race:", receiptKey);
          return new Response(
            JSON.stringify({
              success: true,
              skipped: true,
              reason: "duplicate_receipt",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("Error reserving receipt idempotency:", reserveError);
        throw reserveError;
      }
    }

    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const planName =
      planType === 'asset_safe_gift_annual' || planType === 'gift_annual'
        ? 'Asset Safe Gift Plan - 1 Year'
        : planType === 'premium'
          ? 'Premium Plan'
          : 'Standard Plan';

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
      from: 'Asset Safe <noreply@assetsafe.net>',
      to: [customerEmail],
      subject: `Payment Receipt - ${planName}`,
      html,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      if (receiptKey) {
        await supabase
          .from("subscription_email_events")
          .update({ status: "failed" })
          .eq("idempotency_key", receiptKey);
      }
      throw new Error(emailResponse.error.message);
    }

    console.log('Receipt email sent successfully:', emailResponse.data?.id);

    if (receiptKey) {
      await supabase
        .from("subscription_email_events")
        .update({
          status: "sent",
          resend_message_id: emailResponse.data?.id ?? null,
        })
        .eq("idempotency_key", receiptKey);
    }

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
