import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting trial reminder check...');

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0); // Start of day

    const threeDaysFromNowEnd = new Date(threeDaysFromNow);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999); // End of day

    console.log('Checking for trials ending on:', threeDaysFromNow.toISOString());

    // Find users whose trial ends in 3 days and haven't received reminder
    const { data: usersNeedingReminder, error: queryError } = await supabase
      .from('subscribers')
      .select('email, subscription_tier, trial_end, user_id')
      .gte('trial_end', threeDaysFromNow.toISOString())
      .lte('trial_end', threeDaysFromNowEnd.toISOString())
      .eq('subscribed', false) // Still in trial
      .eq('trial_reminder_sent', false)
      .not('trial_end', 'is', null);

    if (queryError) {
      console.error('Error querying subscribers:', queryError);
      throw queryError;
    }

    console.log(`Found ${usersNeedingReminder?.length || 0} users needing trial reminder`);

    if (!usersNeedingReminder || usersNeedingReminder.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No users need trial reminders today',
        count: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send reminder emails
    const results = [];
    for (const user of usersNeedingReminder) {
      try {
        console.log(`Sending trial reminder to: ${user.email}`);

        // Call the send-trial-reminder function
        const { data: emailResult, error: emailError } = await supabase.functions.invoke(
          'send-trial-reminder',
          {
            body: {
              email: user.email,
              subscription_tier: user.subscription_tier || 'premium',
              trial_end: user.trial_end,
            },
          }
        );

        if (emailError) {
          console.error(`Failed to send reminder to ${user.email}:`, emailError);
          results.push({ email: user.email, status: 'failed', error: emailError.message });
          continue;
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({
            trial_reminder_sent: true,
            trial_reminder_sent_at: new Date().toISOString(),
          })
          .eq('user_id', user.user_id);

        if (updateError) {
          console.error(`Failed to update reminder status for ${user.email}:`, updateError);
          results.push({ email: user.email, status: 'email_sent_but_update_failed', error: updateError.message });
        } else {
          console.log(`Successfully sent reminder to ${user.email}`);
          results.push({ email: user.email, status: 'success' });
        }

      } catch (error: any) {
        console.error(`Error processing ${user.email}:`, error);
        results.push({ email: user.email, status: 'failed', error: error.message });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`Trial reminder check completed. Sent: ${successCount}, Failed: ${failedCount}`);

    return new Response(JSON.stringify({
      message: 'Trial reminder check completed',
      total: usersNeedingReminder.length,
      sent: successCount,
      failed: failedCount,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in check-trial-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);