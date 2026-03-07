import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * /onboarding is no longer an active destination for new users.
 * The full setup wizard now lives at /welcome/create-password.
 *
 * This stub redirects:
 *  - Users who haven't finished setup → /welcome/create-password
 *  - Users who are fully set up       → /account (dashboard)
 */
const Onboarding = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (profile?.onboarding_complete) {
      navigate('/account', { replace: true });
    } else {
      navigate('/welcome/create-password', { replace: true });
    }
  }, [loading, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
    </div>
  );
};

export default Onboarding;
