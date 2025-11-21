import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PaymentReceiptEmail } from './_templates/payment-receipt.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface StripeCheckoutSession extends Stripe.Checkout.Session {
  customer_details?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  payment_intent?: string | Stripe.PaymentIntent;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No signature found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log('Processing webhook event:', event.type);

    // Handle successful payment events
    if (event.type === 'checkout.session.completed' || 
        event.type === 'payment_intent.succeeded') {
      
      let session: StripeCheckoutSession | null = null;
      let paymentIntent: Stripe.PaymentIntent | null = null;
      
      if (event.type === 'checkout.session.completed') {
        session = event.data.object as StripeCheckoutSession;
        
        // Retrieve payment intent details if needed
        if (typeof session.payment_intent === 'string') {
          paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        }
      } else {
        paymentIntent = event.data.object as Stripe.PaymentIntent;
      }

      const customerEmail = session?.customer_details?.email || 
                           paymentIntent?.receipt_email || 
                           '';
      
      if (!customerEmail) {
        console.error('No customer email found in payment data');
        return new Response(
          JSON.stringify({ error: 'No customer email found' }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const customerName = session?.customer_details?.name || 'Customer';
      const amount = session?.amount_total || paymentIntent?.amount || 0;
      const currency = session?.currency || paymentIntent?.currency || 'usd';
      const transactionId = session?.id || paymentIntent?.id || '';
      const paymentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Get plan name from metadata or line items
      let planName = 'Subscription';
      if (session?.metadata?.plan_name) {
        planName = session.metadata.plan_name;
      } else if (session?.line_items) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (lineItems.data[0]?.description) {
          planName = lineItems.data[0].description;
        }
      }

      // Get payment method details
      let last4: string | undefined;
      if (paymentIntent?.charges?.data[0]?.payment_method_details?.card?.last4) {
        last4 = paymentIntent.charges.data[0].payment_method_details.card.last4;
      }

      const billingAddress = session?.customer_details?.address;

      console.log('Sending receipt email to:', customerEmail);

      // Render the email template
      const html = await renderAsync(
        React.createElement(PaymentReceiptEmail, {
          customerName,
          customerEmail,
          amount,
          currency,
          paymentDate,
          planName,
          transactionId,
          last4,
          billingAddress,
        })
      );

      // Send the email
      const emailResponse = await resend.emails.send({
        from: 'AssetSafe <onboarding@resend.dev>', // Update this to your verified domain
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
        JSON.stringify({ 
          success: true, 
          emailId: emailResponse.data?.id 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Return success for other event types
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-payment-receipt function:", error);
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
