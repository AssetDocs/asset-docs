import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VerificationCriteria {
  email_verified: boolean;
  account_age_met: boolean;
  upload_count_met: boolean;
  upload_count: number;
  profile_complete: boolean;
  has_property: boolean;
  has_2fa: boolean;
}

export interface VerificationStatus {
  is_verified: boolean;
  is_verified_plus: boolean;
  criteria: VerificationCriteria;
  verified_at: string | null;
  verified_plus_at: string | null;
  last_checked_at: string | null;
}

export const useVerification = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cached status from database
  const fetchCachedStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('account_verification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching verification status:', fetchError);
        setError('Failed to load verification status');
        setLoading(false);
        return;
      }

      if (data) {
        setStatus({
          is_verified: data.is_verified,
          is_verified_plus: data.is_verified_plus,
          criteria: {
            email_verified: data.email_verified,
            account_age_met: data.account_age_met,
            upload_count_met: data.upload_count_met,
            upload_count: data.upload_count,
            profile_complete: data.profile_complete,
            has_property: data.has_property,
            has_2fa: data.has_2fa
          },
          verified_at: data.verified_at,
          verified_plus_at: data.verified_plus_at,
          last_checked_at: data.last_checked_at
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error fetching verification:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }, [user]);

  // Refresh verification status by calling the edge function
  const refreshVerification = useCallback(async () => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('check-verification');

      if (invokeError) {
        console.error('Error refreshing verification:', invokeError);
        setError('Failed to refresh verification status');
        setLoading(false);
        return null;
      }

      const newStatus: VerificationStatus = {
        is_verified: data.is_verified,
        is_verified_plus: data.is_verified_plus,
        criteria: data.criteria,
        verified_at: data.verified_at,
        verified_plus_at: data.verified_plus_at,
        last_checked_at: data.last_checked_at
      };

      setStatus(newStatus);
      setLoading(false);
      return newStatus;
    } catch (err) {
      console.error('Unexpected error refreshing verification:', err);
      setError('An unexpected error occurred');
      setLoading(false);
      return null;
    }
  }, [user]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCachedStatus();
  }, [fetchCachedStatus]);

  // Calculate progress percentage (5 base criteria + 2FA bonus)
  const baseProgress = status ? 
    ([
      status.criteria.email_verified,
      status.criteria.account_age_met,
      status.criteria.upload_count_met,
      status.criteria.profile_complete,
      status.criteria.has_property
    ].filter(Boolean).length / 5) * 100 : 0;

  // Full progress includes 2FA as a 6th criterion for Verified+ (optional display)
  const progress = baseProgress;

  return {
    status,
    loading,
    error,
    progress,
    refreshVerification,
    fetchCachedStatus
  };
};
