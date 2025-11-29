import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Checking for pending invitations for user:', user.email);

    // Check for pending invitations matching the user's email
    const { data: pendingInvitations, error: fetchError } = await supabase
      .from('contributors')
      .select('*')
      .eq('contributor_email', user.email)
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching invitations:', fetchError);
      throw fetchError;
    }

    console.log('Found pending invitations:', pendingInvitations?.length || 0);

    if (pendingInvitations && pendingInvitations.length > 0) {
      // Update all pending invitations for this user
      const { data: updatedInvitations, error: updateError } = await supabase
        .from('contributors')
        .update({
          status: 'accepted',
          contributor_user_id: user.id,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('contributor_email', user.email)
        .eq('status', 'pending')
        .select();

      if (updateError) {
        console.error('Error updating invitations:', updateError);
        throw updateError;
      }

      console.log('Successfully accepted invitations:', updatedInvitations);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully accepted ${updatedInvitations?.length || 0} invitation(s)`,
          invitations: updatedInvitations
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No pending invitations found',
        invitations: []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in accept-contributor-invitation:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
