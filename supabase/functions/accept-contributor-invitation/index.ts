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
    // Use SERVICE_ROLE_KEY to bypass RLS - we validate the user manually via JWT
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create a separate client for user auth verification
    const supabaseAuth = createClient(
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
      console.error('[ACCEPT-CONTRIBUTOR] No authorization header');
      throw new Error('No authorization header');
    }

    // Verify the user's session using the anon client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[ACCEPT-CONTRIBUTOR] Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('[ACCEPT-CONTRIBUTOR] User authenticated:', { userId: user.id, email: user.email });

    // Use admin client to bypass RLS and find pending invitations
    const { data: pendingInvitations, error: fetchError } = await supabaseAdmin
      .from('contributors')
      .select('*')
      .eq('contributor_email', user.email)
      .eq('status', 'pending');

    if (fetchError) {
      console.error('[ACCEPT-CONTRIBUTOR] Error fetching invitations:', fetchError);
      throw fetchError;
    }

    console.log('[ACCEPT-CONTRIBUTOR] Found pending invitations:', pendingInvitations?.length || 0);

    let acceptedInvitations: any[] = [];

    if (pendingInvitations && pendingInvitations.length > 0) {
      // Update all pending invitations for this user using admin client
      const { data: updatedInvitations, error: updateError } = await supabaseAdmin
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
        console.error('[ACCEPT-CONTRIBUTOR] Error updating invitations:', updateError);
        throw updateError;
      }

      console.log('[ACCEPT-CONTRIBUTOR] Successfully accepted invitations:', updatedInvitations?.length || 0);
      acceptedInvitations = updatedInvitations || [];
    }

    // Also check for already-accepted invitations using admin client
    const { data: existingAccepted, error: existingError } = await supabaseAdmin
      .from('contributors')
      .select('*')
      .eq('contributor_user_id', user.id)
      .eq('status', 'accepted');

    if (existingError) {
      console.error('[ACCEPT-CONTRIBUTOR] Error fetching existing accepted:', existingError);
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

    console.log('[ACCEPT-CONTRIBUTOR] Final result:', {
      acceptedCount: acceptedInvitations.length,
      existingCount: existingAccepted?.length || 0,
      isContributor,
      relationships: uniqueRelationships.map(r => ({ id: r.id, role: r.role, owner: r.account_owner_id }))
    });

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
    console.error('[ACCEPT-CONTRIBUTOR] Error:', error);
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
