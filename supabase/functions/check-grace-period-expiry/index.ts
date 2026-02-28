import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Guard: only allow calls from Supabase scheduler (x-internal-secret header)
  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!internalSecret || internalSecret !== expectedSecret) {
    console.error('[CHECK-GRACE-PERIOD-EXPIRY] Unauthorized call — missing or invalid x-internal-secret');
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for expired grace periods...");

    // Find all legacy lockers with active grace periods that have expired
    const { data: expiredLockers, error: fetchError } = await supabase
      .from('legacy_locker')
      .select(`
        id,
        user_id,
        delegate_user_id,
        recovery_grace_period_days,
        recovery_requested_at,
        recovery_status
      `)
      .eq('recovery_status', 'grace_period_active')
      .not('delegate_user_id', 'is', null)
      .not('recovery_requested_at', 'is', null);

    if (fetchError) {
      console.error("Error fetching lockers:", fetchError);
      throw fetchError;
    }

    if (!expiredLockers || expiredLockers.length === 0) {
      console.log("No active grace periods found");
      return new Response(
        JSON.stringify({ processed: 0, message: "No expired grace periods" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let processedCount = 0;

    for (const locker of expiredLockers) {
      const gracePeriodDays = locker.recovery_grace_period_days || 14;
      const requestedAt = new Date(locker.recovery_requested_at);
      const expiryDate = new Date(requestedAt.getTime() + (gracePeriodDays * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (now >= expiryDate) {
        console.log(`Grace period expired for locker ${locker.id}`);

        // Get owner info
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', locker.user_id)
          .single();

        const { data: ownerUser } = await supabase.auth.admin.getUserById(locker.user_id);

        // Get delegate info
        const { data: delegateProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', locker.delegate_user_id)
          .single();

        const { data: delegateUser } = await supabase.auth.admin.getUserById(locker.delegate_user_id);

        const ownerName = ownerProfile 
          ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() 
          : 'Account Owner';
        
        const ownerEmail = ownerUser?.user?.email || 'unknown';

        const delegateName = delegateProfile 
          ? `${delegateProfile.first_name || ''} ${delegateProfile.last_name || ''}`.trim() 
          : 'Recovery Delegate';
        
        const delegateEmail = delegateUser?.user?.email;

        if (delegateEmail) {
          // Send the access email to the delegate with internal secret header
          const response = await fetch(`${supabaseUrl}/functions/v1/send-delegate-access-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'x-internal-secret': supabaseServiceKey,
            },
            body: JSON.stringify({
              delegateEmail,
              delegateName,
              ownerName,
              ownerEmail,
              legacyLockerId: locker.id,
              delegateUserId: locker.delegate_user_id
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error sending access email for locker ${locker.id}:`, errorText);
          } else {
            console.log(`Access email sent to ${delegateEmail} for locker ${locker.id}`);
            processedCount++;
          }
        } else {
          console.error(`No email found for delegate ${locker.delegate_user_id}`);
        }
      }
    }

    console.log(`Processed ${processedCount} expired grace periods`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount, 
        message: `Processed ${processedCount} expired grace periods` 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error checking grace period expiry:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
