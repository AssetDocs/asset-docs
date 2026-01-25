import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // PRIMARY: Check entitlements table (single source of truth)
    const { data: entitlement, error: entitlementError } = await supabaseClient
      .from("entitlements")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entitlementError) {
      logStep("Error fetching entitlement", entitlementError);
    }

    // Get profile for property/storage limits (still needed for quotas)
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("property_limit, storage_quota_gb")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      logStep("Error fetching profile", profileError);
    }

    logStep("Entitlement fetched", { 
      plan: entitlement?.plan,
      status: entitlement?.status,
      currentPeriodEnd: entitlement?.current_period_end
    });

    let isSubscribed = false;
    let subscriptionTier = 'free';
    let planStatus = 'inactive';
    let currentPeriodEnd = null;
    let propertyLimit = profile?.property_limit || 1;
    let storageQuotaGb = profile?.storage_quota_gb || 5;

    if (entitlement) {
      // Use entitlements as source of truth
      isSubscribed = entitlement.status === 'active' || entitlement.status === 'trialing';
      subscriptionTier = entitlement.plan;
      planStatus = entitlement.status;
      currentPeriodEnd = entitlement.current_period_end;
      
      logStep("User entitlement found", { isSubscribed, tier: subscriptionTier, status: planStatus });
    }

    // If user doesn't have their own subscription, check contributor access
    if (!isSubscribed) {
      logStep("Checking contributor access");
      const { data: contributorAccess, error: contributorError } = await supabaseClient
        .from("contributors")
        .select(`
          account_owner_id,
          status,
          role
        `)
        .eq("contributor_user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();

      if (!contributorError && contributorAccess) {
        // Get owner's entitlement
        const { data: ownerEntitlement } = await supabaseClient
          .from("entitlements")
          .select("*")
          .eq("user_id", contributorAccess.account_owner_id)
          .maybeSingle();

        if (ownerEntitlement && (ownerEntitlement.status === 'active' || ownerEntitlement.status === 'trialing')) {
          logStep("User has contributor access to subscribed account", {
            role: contributorAccess.role,
            ownerPlan: ownerEntitlement.plan,
            ownerStatus: ownerEntitlement.status
          });
          
          isSubscribed = true;
          subscriptionTier = ownerEntitlement.plan;
          planStatus = ownerEntitlement.status;
          currentPeriodEnd = ownerEntitlement.current_period_end;

          // Get owner's profile for limits
          const { data: ownerProfile } = await supabaseClient
            .from("profiles")
            .select("property_limit, storage_quota_gb")
            .eq("user_id", contributorAccess.account_owner_id)
            .maybeSingle();

          if (ownerProfile) {
            propertyLimit = ownerProfile.property_limit || 1;
            storageQuotaGb = ownerProfile.storage_quota_gb || 5;
          }
        }
      }
    }

    const response = {
      subscribed: isSubscribed,
      subscription_tier: subscriptionTier,
      subscription_end: currentPeriodEnd,
      plan_status: planStatus,
      property_limit: propertyLimit,
      storage_quota_gb: storageQuotaGb,
      is_trial: planStatus === 'trialing',
      trial_end: planStatus === 'trialing' ? currentPeriodEnd : null
    };

    logStep("Returning subscription status", response);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      subscription_tier: 'free',
      plan_status: 'inactive',
      property_limit: 1,
      storage_quota_gb: 5
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with default values instead of 500
    });
  }
});
