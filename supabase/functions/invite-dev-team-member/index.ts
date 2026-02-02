import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InviteRequest {
  email: string;
  role: 'dev_lead' | 'developer' | 'qa';
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated and has owner/admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Check if user has owner workspace access
    const { data: hasAccess, error: accessError } = await supabase.rpc('has_owner_workspace_access', {
      _user_id: user.id
    });

    if (accessError || !hasAccess) {
      throw new Error("Only owners can invite dev team members");
    }

    const { email, role }: InviteRequest = await req.json();

    if (!email || !role) {
      throw new Error("Email and role are required");
    }

    // Generate a secure random token
    const token_array = new Uint8Array(32);
    crypto.getRandomValues(token_array);
    const invitation_token = Array.from(token_array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Check if invitation already exists for this email
    const { data: existingInvite } = await supabase
      .from('dev_team_invitations')
      .select('id')
      .eq('email', email.toLowerCase())
      .is('accepted_at', null)
      .single();

    if (existingInvite) {
      // Update existing invitation with new token
      await supabase
        .from('dev_team_invitations')
        .update({
          invitation_token,
          role,
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: user.id,
        })
        .eq('id', existingInvite.id);
    } else {
      // Create new invitation
      const { error: insertError } = await supabase
        .from('dev_team_invitations')
        .insert({
          email: email.toLowerCase(),
          role,
          invitation_token,
          invited_by: user.id,
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) {
        throw new Error(`Failed to create invitation: ${insertError.message}`);
      }
    }

    // Send invitation email if Resend is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const inviteUrl = `https://assetsafenet.lovable.app/admin/dev-invite?token=${invitation_token}`;
      
      const roleName = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

      await resend.emails.send({
        from: "Asset Safe <noreply@assetsafe.net>",
        to: [email],
        subject: "You've been invited to Asset Safe Development Dashboard",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="https://assetsafenet.lovable.app/images/asset-safe-logo.png" alt="Asset Safe" style="height: 50px; margin-bottom: 20px;" />
            
            <h1 style="color: #1a365d; margin-bottom: 16px;">You're Invited!</h1>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              You've been invited to join the Asset Safe development team as a <strong>${roleName}</strong>.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Click the button below to activate your account and access the Development workspace:
            </p>
            
            <a href="${inviteUrl}" style="display: inline-block; background-color: #1EAEDB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
              Activate Account
            </a>
            
            <p style="color: #718096; font-size: 14px;">
              This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="color: #a0aec0; font-size: 12px;">
              Asset Safe - Protect what matters most.
            </p>
          </div>
        `,
      });

      console.log(`Invitation email sent to ${email}`);
    } else {
      console.log(`Resend not configured, invitation created but email not sent`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in invite-dev-team-member:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
