import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TOTPFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'unverified' | 'verified';
  created_at: string;
}

interface EnrollmentData {
  id: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export const useTOTP = () => {
  const { user } = useAuth();
  const [factors, setFactors] = useState<TOTPFactor[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);

  const fetchFactors = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      const totpFactors = data?.totp || [];
      setFactors(totpFactors);
      setIsEnrolled(totpFactors.some(f => f.status === 'verified'));
    } catch (error) {
      console.error('Error fetching MFA factors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  const startEnrollment = async (friendlyName?: string): Promise<EnrollmentData | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName || 'Asset Safe Authenticator',
      });

      if (error) throw error;

      setEnrollmentData(data);
      return data;
    } catch (error) {
      console.error('Error starting TOTP enrollment:', error);
      throw error;
    }
  };

  const verifyEnrollment = async (factorId: string, code: string): Promise<boolean> => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (error) throw error;

      await fetchFactors();
      setEnrollmentData(null);
      return true;
    } catch (error) {
      console.error('Error verifying TOTP enrollment:', error);
      throw error;
    }
  };

  const createChallenge = async (): Promise<{ factorId: string; challengeId: string } | null> => {
    try {
      const verifiedFactor = factors.find(f => f.status === 'verified');
      
      if (!verifiedFactor) {
        throw new Error('No verified TOTP factor found');
      }

      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });

      if (error) throw error;

      return {
        factorId: verifiedFactor.id,
        challengeId: data.id,
      };
    } catch (error) {
      console.error('Error creating TOTP challenge:', error);
      throw error;
    }
  };

  const verifyChallenge = async (
    factorId: string,
    challengeId: string,
    code: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error verifying TOTP challenge:', error);
      throw error;
    }
  };

  const unenroll = async (factorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      await fetchFactors();
      return true;
    } catch (error) {
      console.error('Error unenrolling TOTP factor:', error);
      throw error;
    }
  };

  return {
    factors,
    isEnrolled,
    isLoading,
    enrollmentData,
    startEnrollment,
    verifyEnrollment,
    createChallenge,
    verifyChallenge,
    unenroll,
    refetch: fetchFactors,
  };
};
