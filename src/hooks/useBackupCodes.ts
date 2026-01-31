import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BackupCodesStatus {
  remainingCodes: number;
  hasBackupCodes: boolean;
}

export const useBackupCodes = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<BackupCodesStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!session?.access_token) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-backup-codes', {
        body: { action: 'status' },
      });

      if (error) throw error;

      setStatus({
        remainingCodes: data.remainingCodes,
        hasBackupCodes: data.hasBackupCodes,
      });

      return data;
    } catch (error) {
      console.error('Error fetching backup codes status:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  const generateCodes = useCallback(async (): Promise<string[] | null> => {
    if (!session?.access_token) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-backup-codes', {
        body: { action: 'generate' },
      });

      if (error) throw error;

      // Refresh status after generating
      await fetchStatus();

      return data.codes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, fetchStatus]);

  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const { data, error } = await supabase.functions.invoke('manage-backup-codes', {
        body: { action: 'verify', code },
      });

      if (error) throw error;

      if (data.success) {
        // Refresh status after using a code
        await fetchStatus();
      }

      return data.success;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }, [session?.access_token, fetchStatus]);

  return {
    status,
    isLoading,
    fetchStatus,
    generateCodes,
    verifyCode,
  };
};
