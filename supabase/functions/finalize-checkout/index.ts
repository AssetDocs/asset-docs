import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FINALIZE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session with subscription expanded
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription", "subscription.items.data.price"],
    });

    logStep("Stripe session retrieved", {
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      customer: session.customer,
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", payment_status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
      );
    }

    // Extract customer details
    const customerEmail = session.customer_details?.email || session.customer_email;
    if (!customerEmail) throw new Error("No customer email found in Stripe session");

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscription = session.subscription as Stripe.Subscription | null;
    const subscriptionId = subscription?.id ?? null;
    const planPriceId = subscription?.items?.data?.[0]?.price?.id ?? null;
    const planLookupKey = subscription?.items?.data?.[0]?.price?.lookup_key ?? 
      (session.metadata?.plan_lookup_key ?? null);

    logStep("Extracted billing details", { customerEmail, customerId, subscriptionId, planPriceId, planLookupKey });

    // Lookup or create the Supabase user
    let userId: string;
    let userCreated = false;

    const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(customerEmail);

    if (lookupError || !existingUser?.user) {
      logStep("User not found, creating new user", { customerEmail });
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
      });
      if (createError || !newUser?.user) {
        throw new Error(`Failed to create user: ${createError?.message}`);
      }
      userId = newUser.user.id;
      userCreated = true;
      logStep("New user created", { userId });
    } else {
      userId = existingUser.user.id;
      logStep("Existing user found", { userId });
    }

    // Upsert entitlement — all Stripe IDs required by DB trigger
    const { error: entitlementError } = await supabaseAdmin
      .from("entitlements")
      .upsert(
        {
          user_id: userId,
          plan: "standard",
          status: "active",
          entitlement_source: "stripe",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_plan_price_id: planPriceId,
          plan_lookup_key: planLookupKey,
          base_storage_gb: 25,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (entitlementError) {
      logStep("Entitlement upsert error", { error: entitlementError.message });
      throw new Error(`Failed to upsert entitlement: ${entitlementError.message}`);
    }
    logStep("Entitlement upserted successfully");

    // Log consent (payment confirmed = user agreed to terms)
    try {
      await supabaseAdmin.from("user_consents").insert({
        user_email: customerEmail.toLowerCase().trim(),
        consent_type: "subscription_checkout_post_payment",
        terms_version: "v1.0",
        ip_address: null,
      });
      logStep("Consent logged post-payment");
    } catch (consentErr) {
      logStep("Consent logging failed (non-fatal)", { error: String(consentErr) });
    }

    // Generate magic link so user can sign in
    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
      options: {
        redirectTo: `${origin}/account`,
      },
    });

    if (linkError) {
      logStep("Magic link generation failed (non-fatal)", { error: linkError.message });
    } else {
      logStep("Magic link generated successfully");

      // Send the magic link via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey && linkData?.properties?.action_link) {
        const magicLinkUrl = linkData.properties.action_link;
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Asset Safe <noreply@getassetsafe.com>",
            to: [customerEmail],
            subject: "Your payment is confirmed — sign in to Asset Safe",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a1a;">Payment Confirmed! 🎉</h2>
                <p>Your Asset Safe subscription is now active.</p>
                <p>Click the button below to sign in and start protecting your assets:</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${magicLinkUrl}" 
                     style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Sign In to Asset Safe
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't expect this email, you can safely ignore it.</p>
              </div>
            `,
          }),
        });
        if (!emailRes.ok) {
          const errText = await emailRes.text();
          logStep("Magic link email send failed (non-fatal)", { status: emailRes.status, body: errText });
        } else {
          logStep("Magic link email sent successfully");
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, email: customerEmail, user_created: userCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorId = crypto.randomUUID();
    logStep("ERROR in finalize-checkout", { errorId, message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Failed to finalize checkout. Please contact support.", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
