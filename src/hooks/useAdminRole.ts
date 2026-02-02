import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AdminRole = 'owner' | 'admin' | 'dev_lead' | 'developer' | 'qa' | null;

interface AdminRoleState {
  role: AdminRole;
  loading: boolean;
  hasOwnerAccess: boolean;
  hasDevAccess: boolean;
  canSwitchWorkspace: boolean;
}

export const useAdminRole = (): AdminRoleState => {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_admin_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching admin role:', error);
          setRole(null);
        } else {
          setRole(data as AdminRole);
        }
      } catch (error) {
        console.error('Error in admin role check:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminRole();
  }, [user]);

  const hasOwnerAccess = role === 'owner' || role === 'admin';
  const hasDevAccess = ['owner', 'admin', 'dev_lead', 'developer', 'qa'].includes(role || '');
  const canSwitchWorkspace = role === 'owner' || role === 'admin';

  return {
    role,
    loading,
    hasOwnerAccess,
    hasDevAccess,
    canSwitchWorkspace,
  };
};
