import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ContributorWelcome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Invited contributors are pre-verified via the magic link — go straight to dashboard
      if (user?.email_confirmed_at) {
        navigate('/account', { replace: true });
        return;
      }
      // Edge case: not yet verified, poll until confirmed
      const interval = setInterval(async () => {
        const { data: { user: refreshed } } = await supabase.auth.getUser();
        if (refreshed?.email_confirmed_at) {
          clearInterval(interval);
          navigate('/account', { replace: true });
        }
      }, 3000);
      return () => clearInterval(interval);
    };
    init();
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
    </div>
  );
};

export default ContributorWelcome;
