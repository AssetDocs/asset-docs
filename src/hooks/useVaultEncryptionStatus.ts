import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useVaultEncryptionStatus() {
  const { user } = useAuth();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from('legacy_locker')
        .select('is_encrypted')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsEncrypted(data?.is_encrypted ?? false);
      setLoading(false);
    };

    fetch();
  }, [user]);

  return { isEncrypted, loading };
}
