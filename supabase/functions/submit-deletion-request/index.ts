import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SUBMIT-DELETION-REQUEST] Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json();
    const { account_owner_id, reason, grace_period_days = 14 } = body;

    if (!account_owner_id) {
      return new Response(
        JSON.stringify({ error: 'Account owner ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the requester is an administrator contributor for this account
    const { data: contributorData, error: contributorError } = await supabaseAdmin
      .from('contributors')
      .select('role, status')
      .eq('contributor_user_id', user.id)
      .eq('account_owner_id', account_owner_id)
      .single();

    if (contributorError || !contributorData) {
      console.log('[SUBMIT-DELETION-REQUEST] User is not a contributor:', contributorError);
      return new Response(
        JSON.stringify({ error: 'You do not have contributor access to this account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (contributorData.role !== 'administrator' || contributorData.status !== 'accepted') {
      console.log('[SUBMIT-DELETION-REQUEST] User is not an administrator:', contributorData);
      return new Response(
        JSON.stringify({ error: 'Only administrator contributors can request account deletion' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('id, status')
      .eq('account_owner_id', account_owner_id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'There is already a pending deletion request for this account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate grace period end date
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + grace_period_days);

    // Create the deletion request
    const { data: request, error: insertError } = await supabaseAdmin
      .from('account_deletion_requests')
      .insert({
        account_owner_id,
        requester_user_id: user.id,
        reason,
        grace_period_days,
        grace_period_ends_at: gracePeriodEndsAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('[SUBMIT-DELETION-REQUEST] Error creating request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create deletion request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get owner's email for notification
    const { data: ownerData } = await supabaseAdmin.auth.admin.getUserById(account_owner_id);
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    // Send email notification to account owner
    if (ownerData?.user?.email) {
      try {
        const resend = new (await import('https://esm.sh/resend@2.0.0')).Resend(
          Deno.env.get('RESEND_API_KEY')
        );

        const requesterName = requesterProfile 
          ? `${requesterProfile.first_name || ''} ${requesterProfile.last_name || ''}`.trim() || 'An administrator'
          : 'An administrator';

        await resend.emails.send({
          from: 'Asset Safe <support@assetsafe.net>',
          to: ownerData.user.email,
          subject: 'Account Deletion Request - Action Required',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://leotcbfpqiekgkgumecn.supabase.co/storage/v1/object/public/documents/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; height: auto;">
              </div>
              
              <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Account Deletion Request</h1>
              
              <p><strong>${requesterName}</strong> has requested to delete your Asset Safe account.</p>
              
              ${reason ? `<p><strong>Reason provided:</strong> ${reason}</p>` : ''}
              
              <p>If you do not respond within <strong>${grace_period_days} days</strong> (by ${gracePeriodEndsAt.toLocaleDateString()}), the administrator will have the option to proceed with account deletion.</p>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> To prevent deletion, please log in to your Asset Safe account and reject this request.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.assetsafe.net/account" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Request</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">If you did not authorize this request or have concerns, please contact support immediately at support@assetsafe.net</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Asset Safe. All rights reserved.
              </p>
            </body>
            </html>
          `
        });
        console.log('[SUBMIT-DELETION-REQUEST] Email sent to owner');
      } catch (emailError) {
        console.error('[SUBMIT-DELETION-REQUEST] Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    console.log('[SUBMIT-DELETION-REQUEST] Request created successfully:', request.id);

    return new Response(
      JSON.stringify({ success: true, request }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SUBMIT-DELETION-REQUEST] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});
