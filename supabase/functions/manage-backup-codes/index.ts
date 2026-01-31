import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for backup codes (SHA-256)
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random backup code (8 characters, alphanumeric)
function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0, O, I, 1
  let code = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (let i = 0; i < 8; i++) {
    code += chars[array[i] % chars.length];
  }
  // Format as XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate user token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { action, code } = await req.json();

    // ACTION: Generate new backup codes
    if (action === 'generate') {
      console.log(`Generating backup codes for user: ${userId}`);
      
      // Delete existing unused codes
      await serviceClient
        .from('backup_codes')
        .delete()
        .eq('user_id', userId);

      // Generate 10 new codes
      const plainCodes: string[] = [];
      const codeRecords: { user_id: string; code_hash: string }[] = [];

      for (let i = 0; i < 10; i++) {
        const plainCode = generateBackupCode();
        const hashedCode = await hashCode(plainCode);
        plainCodes.push(plainCode);
        codeRecords.push({
          user_id: userId,
          code_hash: hashedCode,
        });
      }

      // Insert hashed codes
      const { error: insertError } = await serviceClient
        .from('backup_codes')
        .insert(codeRecords);

      if (insertError) {
        console.error('Error inserting backup codes:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate backup codes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Generated ${plainCodes.length} backup codes for user ${userId}`);

      // Return plain codes (only shown once!)
      return new Response(
        JSON.stringify({ 
          success: true, 
          codes: plainCodes,
          message: 'Save these codes securely. They will not be shown again.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Verify a backup code
    if (action === 'verify') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Verifying backup code for user: ${userId}`);

      // Normalize code (remove dashes, uppercase)
      const normalizedCode = code.replace(/-/g, '').toUpperCase();
      const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;
      const hashedCode = await hashCode(formattedCode);

      // Find matching unused code
      const { data: matchingCode, error: findError } = await serviceClient
        .from('backup_codes')
        .select('id')
        .eq('user_id', userId)
        .eq('code_hash', hashedCode)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (findError || !matchingCode) {
        console.log('Invalid or already used backup code');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or already used backup code' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark code as used
      const { error: updateError } = await serviceClient
        .from('backup_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', matchingCode.id);

      if (updateError) {
        console.error('Error marking code as used:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Backup code verified and marked as used for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Backup code verified' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Get status (remaining codes count)
    if (action === 'status') {
      const { count, error: countError } = await serviceClient
        .from('backup_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString());

      if (countError) {
        console.error('Error counting backup codes:', countError);
        return new Response(
          JSON.stringify({ error: 'Failed to get status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          remainingCodes: count || 0,
          hasBackupCodes: (count || 0) > 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
