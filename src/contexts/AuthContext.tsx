// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityAlertService } from '@/services/SecurityAlertService';

// Helper to check if we've already alerted for this session (persisted in localStorage)
const ALERTED_SESSIONS_KEY = 'alerted_login_sessions';

const getAlertedSessions = (): Set<string> => {
  try {
    const stored = localStorage.getItem(ALERTED_SESSIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const addAlertedSession = (sessionKey: string) => {
  try {
    const sessions = getAlertedSessions();
    sessions.add(sessionKey);
    // Keep only last 20 sessions to prevent localStorage bloat
    const arr = Array.from(sessions);
    if (arr.length > 20) {
      arr.splice(0, arr.length - 20);
    }
    localStorage.setItem(ALERTED_SESSIONS_KEY, JSON.stringify(arr));
  } catch {
    // Ignore storage errors
  }
};

const hasAlertedSession = (sessionKey: string): boolean => {
  return getAlertedSessions().has(sessionKey);
};

interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  password_set?: boolean;
  onboarding_complete?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, giftCode?: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const previousEmailRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile — set profileLoading so ProtectedRoute waits for profile data.
          setProfileLoading(true);
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setProfile(profileData);

            // Track current email for change detection
            previousEmailRef.current = session.user.email || null;

          } catch (error) {
            console.error('Error fetching profile:', error);
          } finally {
            // Release the loading gate immediately after profile fetch —
            // do NOT await edge functions inside onAuthStateChange as that can
            // deadlock the Supabase auth lock (see: auth-concurrency-management).
            setProfileLoading(false);
          }

          // Fire-and-forget side effects — run OUTSIDE the profileLoading block
          // so they never block the dashboard from rendering.
          if (event === 'SIGNED_IN') {
            // Sync subscription state in the background
            supabase.functions.invoke('check-subscription').catch(console.error);

            // Check for pending contributor invitations
            supabase.functions.invoke('accept-contributor-invitation', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            }).catch((inviteError) => {
              console.error('Error checking contributor invitations:', inviteError);
            });

            // Send security alert for new login (only once per unique session)
            if (session.access_token) {
              const sessionKey = `${session.user.id}-${session.access_token.slice(-20)}`;
              if (!hasAlertedSession(sessionKey)) {
                addAlertedSession(sessionKey);
                SecurityAlertService.notifyNewLogin(
                  session.user.id,
                  session.user.email || ''
                ).catch(console.error);
              }
            }
          }

          // Detect email change (USER_UPDATED event)
          if (event === 'USER_UPDATED' && previousEmailRef.current && session.user.email) {
            if (previousEmailRef.current !== session.user.email) {
              SecurityAlertService.notifyEmailChanged(
                session.user.id,
                previousEmailRef.current,
                session.user.email
              ).catch(console.error);
            }
          }

        } else {
          setProfile(null);
          previousEmailRef.current = null;
        }
        
        // Detect password recovery completion
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset link - alert will be sent after they set new password
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        previousEmailRef.current = session.user.email;
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, giftCode?: string) => {
    // Use a clean callback URL — Supabase appends ?token_hash=xxx&type=signup automatically.
    // Including the full URL as a query param causes Supabase to append it as a path (double URL bug).
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName || '',
          last_name: lastName || ''
        }
      }
    });
    
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore errors (e.g. stale/invalid refresh token) — always clear local state
    }
    // Nuclear fallback: manually purge all Supabase auth tokens from localStorage
    // so that even if signOut() failed silently, the session is gone on reload.
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') && (key.includes('-auth-token') || key.includes('-refresh-token') || key.includes('-provider-token'))
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      // Also clear the full project-scoped token key
      localStorage.removeItem(`sb-leotcbfpqiekgkgumecn-auth-token`);
    } catch {
      // Ignore storage errors
    }
    // Force a full page reload regardless of current path.
    // window.location.href = '/' is a no-op when already on '/', so we
    // explicitly call reload() in that case to ensure the auth state clears.
    if (window.location.pathname === '/') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading,
      profileLoading,
      signUp, 
      signIn, 
      signOut, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
