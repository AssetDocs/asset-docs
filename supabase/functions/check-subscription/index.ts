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

    // Get profile with subscription data
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      logStep("Error fetching profile", profileError);
      throw new Error("Failed to fetch user profile");
    }

    logStep("Profile fetched", { 
      planStatus: profile?.plan_status,
      planId: profile?.plan_id,
      propertyLimit: profile?.property_limit,
      storageQuotaGb: profile?.storage_quota_gb
    });

    // Check if user has an active subscription
    let isSubscribed = profile?.plan_status === 'active' || profile?.plan_status === 'trialing';
    let subscriptionTier = 'basic';
    let propertyLimit = profile?.property_limit || 1;
    let storageQuotaGb = profile?.storage_quota_gb || 5;
    let currentPeriodEnd = profile?.current_period_end;
    let planStatus = profile?.plan_status || 'inactive';
    
    // Check trial status for users without active subscription
    let isInTrial = false;
    let trialEndDate = null;
    
    if (!isSubscribed) {
      // Check if user is a contributor with accepted access
      logStep("Checking contributor access");
      const { data: contributorAccess, error: contributorError } = await supabaseClient
        .from("contributors")
        .select(`
          account_owner_id,
          status,
          role,
          profiles!contributors_account_owner_id_fkey (
            plan_status,
            plan_id,
            property_limit,
            storage_quota_gb,
            current_period_end
          )
        `)
        .eq("contributor_user_id", user.id)
        .eq("status", "accepted")
        .single();

      if (!contributorError && contributorAccess?.profiles) {
        const ownerProfile = contributorAccess.profiles as any;
        const ownerIsSubscribed = ownerProfile.plan_status === 'active' || ownerProfile.plan_status === 'trialing';
        
        if (ownerIsSubscribed) {
          logStep("User has contributor access to subscribed account", {
            role: contributorAccess.role,
            ownerPlanStatus: ownerProfile.plan_status
          });
          
          isSubscribed = true;
          planStatus = ownerProfile.plan_status;
          propertyLimit = ownerProfile.property_limit || 1;
          storageQuotaGb = ownerProfile.storage_quota_gb || 5;
          currentPeriodEnd = ownerProfile.current_period_end;
          
          // Determine tier from owner's plan
          if (ownerProfile.plan_id) {
            const planLower = ownerProfile.plan_id.toLowerCase();
            if (planLower.includes('premium') || planLower.includes('professional')) {
              subscriptionTier = 'premium';
            } else if (planLower.includes('standard') || planLower.includes('homeowner')) {
              subscriptionTier = 'standard';
            }
          }
        }
      }
      
      // If still not subscribed, check trial status
      if (!isSubscribed) {
        const now = new Date();
        const trialEnd = new Date(profile?.created_at || user.created_at);
        trialEnd.setDate(trialEnd.getDate() + 30);
        isInTrial = now < trialEnd;
        trialEndDate = isInTrial ? trialEnd.toISOString() : null;
        
        logStep("Trial status calculated", { 
          createdAt: profile?.created_at || user.created_at, 
          trialEnd: trialEnd.toISOString(), 
          isInTrial 
        });
      }
    } else {
      // User has their own subscription - determine tier
      if (profile?.plan_id) {
        const planLower = profile.plan_id.toLowerCase();
        if (planLower.includes('premium') || planLower.includes('professional')) {
          subscriptionTier = 'premium';
        } else if (planLower.includes('standard') || planLower.includes('homeowner')) {
          subscriptionTier = 'standard';
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
      is_trial: isInTrial,
      trial_end: trialEndDate
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
      subscription_tier: 'basic',
      plan_status: 'inactive',
      property_limit: 1,
      storage_quota_gb: 5
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with default values instead of 500
    });
  }
});
