import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Guard: only allow calls from Supabase scheduler (x-internal-secret header)
  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!internalSecret || internalSecret !== expectedSecret) {
    console.error('[CHECK-GIFT-REMINDERS] Unauthorized call — missing or invalid x-internal-secret');
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Starting gift reminder check...');

    // Calculate date 11 months ago (for gifts that should receive reminders now)
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
    
    console.log('Checking for gifts with first_login_at before:', elevenMonthsAgo.toISOString());

    // Find gift subscriptions that need reminder emails
    const { data: giftsNeedingReminders, error: queryError } = await supabase
      .from('gift_subscriptions')
      .select('*')
      .eq('redeemed', true)
      .eq('reminder_email_sent', false)
      .not('first_login_at', 'is', null)
      .lte('first_login_at', elevenMonthsAgo.toISOString());

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    console.log(`Found ${giftsNeedingReminders?.length || 0} gifts needing reminders`);

    if (!giftsNeedingReminders || giftsNeedingReminders.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No gift reminders needed at this time",
        processed: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const results = [];

    // Process each gift that needs a reminder
    for (const gift of giftsNeedingReminders) {
      try {
        console.log(`Processing reminder for gift ${gift.gift_code} to ${gift.recipient_email}`);

        // Send reminder email
        const { error: emailError } = await supabase.functions.invoke('send-reminder-email', {
          body: {
            recipient_email: gift.recipient_email,
            recipient_name: gift.recipient_name,
            plan_type: gift.plan_type,
            gift_code: gift.gift_code
          }
        });

        if (emailError) {
          console.error(`Failed to send reminder for gift ${gift.gift_code}:`, emailError);
          results.push({ 
            gift_code: gift.gift_code, 
            success: false, 
            error: emailError.message 
          });
          continue;
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('gift_subscriptions')
          .update({
            reminder_email_sent: true,
            reminder_email_sent_at: new Date().toISOString()
          })
          .eq('id', gift.id);

        if (updateError) {
          console.error(`Failed to update reminder status for gift ${gift.gift_code}:`, updateError);
          results.push({ 
            gift_code: gift.gift_code, 
            success: false, 
            error: updateError.message 
          });
          continue;
        }

        console.log(`Successfully sent reminder for gift ${gift.gift_code}`);
        results.push({ 
          gift_code: gift.gift_code, 
          success: true, 
          recipient_email: gift.recipient_email 
        });

      } catch (error: any) {
        console.error(`Error processing gift ${gift.gift_code}:`, error);
        results.push({ 
          gift_code: gift.gift_code, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Gift reminder check completed. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${results.length} gift reminders`,
      processed: results.length,
      successful: successCount,
      failed: failureCount,
      results 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in check-gift-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);