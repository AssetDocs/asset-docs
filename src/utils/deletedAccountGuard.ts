import { supabase } from '@/integrations/supabase/client';

type DeletedAccountRpc = (
  fn: 'is_deleted_account_email',
  args: { p_email: string }
) => Promise<{ data: boolean | null; error: { message?: string } | null }>;

export const DELETED_ACCOUNT_MESSAGE =
  'We could not create or access an account with this email. Please use a different email or contact support.';

export async function isDeletedAccountEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const { data, error } = await (supabase.rpc as unknown as DeletedAccountRpc)(
    'is_deleted_account_email',
    { p_email: normalizedEmail }
  );

  if (error) {
    console.error('Deleted account guard check failed:', error.message);
    return false;
  }

  return data === true;
}
