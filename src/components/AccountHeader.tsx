// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Copy, Check, Users, Settings, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContributorInfo {
  first_name: string | null;
  last_name: string | null;
  role: string;
}

const AccountHeader: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [contributorInfo, setContributorInfo] = useState<ContributorInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccountInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's own profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_number, first_name, last_name')
        .eq('user_id', user.id as any)
        .single() as any;
      
      const profileData = profile as any;
      if (profileData?.account_number) {
        setAccountNumber(profileData.account_number);
      }

      // Check if user is a contributor to another account
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, first_name, last_name, role')
        .eq('contributor_user_id', user.id as any)
        .eq('status', 'accepted' as any)
        .maybeSingle() as any;

      const contribData = contributorData as any;
      if (contribData) {
        // User is a contributor - get owner's profile
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, account_number')
          .eq('user_id', contribData.account_owner_id)
          .single() as any;

        const ownerData = ownerProfile as any;
        if (ownerData) {
          setOwnerName(`${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim());
          if (ownerData.account_number) {
            setAccountNumber(ownerData.account_number);
          }
        }

        setContributorInfo({
          first_name: contribData.first_name,
          last_name: contribData.last_name,
          role: contribData.role
        });
      } else {
        // User is the owner - set their name
        if (profileData) {
          setOwnerName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
        }
      }
    };

    fetchAccountInfo();
  }, []);

  const copyAccountNumber = async () => {
    if (accountNumber) {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({
        title: "Account number copied",
        description: "Your account number has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contributorName = contributorInfo 
    ? `${contributorInfo.first_name || ''} ${contributorInfo.last_name || ''}`.trim()
    : '';

  return (
    <div className="mb-8">
      {/* This component is kept for potential future use but buttons moved to WelcomeMessage */}
    </div>
  );
};

export default AccountHeader;