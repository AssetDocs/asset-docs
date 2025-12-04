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

    let acceptedInvitations: any[] = [];

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
      acceptedInvitations = updatedInvitations || [];
    }

    // Also check for already-accepted invitations (user might already be a contributor)
    const { data: existingAccepted, error: existingError } = await supabase
      .from('contributors')
      .select('*')
      .eq('contributor_user_id', user.id)
      .eq('status', 'accepted');

    if (existingError) {
      console.error('Error fetching existing accepted invitations:', existingError);
    }

    const allContributorRelationships = [
      ...acceptedInvitations,
      ...(existingAccepted || [])
    ];

    // Deduplicate by id
    const uniqueRelationships = allContributorRelationships.filter(
      (item, index, self) => index === self.findIndex(t => t.id === item.id)
    );

    const isContributor = uniqueRelationships.length > 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: acceptedInvitations.length > 0 
          ? `Successfully accepted ${acceptedInvitations.length} invitation(s)` 
          : (isContributor ? 'Already a contributor' : 'No pending invitations found'),
        invitations: acceptedInvitations,
        isContributor,
        contributorRelationships: uniqueRelationships
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
