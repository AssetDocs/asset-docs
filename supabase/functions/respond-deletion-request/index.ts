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
    console.log('[RESPOND-DELETION-REQUEST] Function started');

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
    const { request_id, action } = body;

    if (!request_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Request ID and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the deletion request
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) {
      return new Response(
        JSON.stringify({ error: 'Deletion request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is the account owner
    if (request.account_owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the account owner can respond to this request' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'This request has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the request status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await supabaseAdmin
      .from('account_deletion_requests')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) {
      console.error('[RESPOND-DELETION-REQUEST] Error updating request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get requester info for email notification
    const { data: requesterData } = await supabaseAdmin.auth.admin.getUserById(request.requester_user_id);
    
    if (requesterData?.user?.email) {
      try {
        const resend = new (await import('https://esm.sh/resend@2.0.0')).Resend(
          Deno.env.get('RESEND_API_KEY')
        );

        const subject = action === 'approve' 
          ? 'Account Deletion Request Approved'
          : 'Account Deletion Request Rejected';

        const message = action === 'approve'
          ? 'The account owner has approved your deletion request. You may now proceed with account deletion.'
          : 'The account owner has rejected your deletion request. The account will not be deleted.';

        await resend.emails.send({
          from: 'Asset Safe <support@assetsafe.net>',
          to: requesterData.user.email,
          subject,
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
              
              <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">${subject}</h1>
              
              <p>${message}</p>
              
              ${action === 'approve' ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.assetsafe.net/account" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Proceed with Deletion</a>
                </div>
              ` : ''}
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Asset Safe. All rights reserved.
              </p>
            </body>
            </html>
          `
        });
        console.log('[RESPOND-DELETION-REQUEST] Email sent to requester');
      } catch (emailError) {
        console.error('[RESPOND-DELETION-REQUEST] Failed to send email:', emailError);
      }
    }

    console.log('[RESPOND-DELETION-REQUEST] Request updated:', newStatus);

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[RESPOND-DELETION-REQUEST] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});
