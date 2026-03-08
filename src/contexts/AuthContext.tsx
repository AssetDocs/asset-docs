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
    const arr = Array.from(sessions);
    if (arr.length > 20) arr.splice(0, arr.length - 20);
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
  refreshProfile: () => Promise<void>;
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
  // Track the last SIGNED_IN session so we can fire side-effects once
  const lastSignedInTokenRef = useRef<string | null>(null);

  // ─── Step 1: onAuthStateChange — SYNCHRONOUS ONLY, no awaits ───────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here — no await, no Supabase calls.
        // Awaiting inside onAuthStateChange holds the auth lock and causes
        // profile fetches (which also need the client) to deadlock forever.
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (!session?.user) {
          setProfile(null);
          previousEmailRef.current = null;
        }

        // Store the event type and access token for the profile useEffect to react to
        if (event === 'SIGNED_IN' && session?.access_token) {
          lastSignedInTokenRef.current = session.access_token;
        }

        // Detect email change (USER_UPDATED event) — only needs previousEmailRef, no await
        if (event === 'USER_UPDATED' && previousEmailRef.current && session?.user?.email) {
          if (previousEmailRef.current !== session.user.email) {
            SecurityAlertService.notifyEmailChanged(
              session.user.id,
              previousEmailRef.current,
              session.user.email
            ).catch(console.error);
          }
        }
      }
    );

    // Bootstrap: read existing session without waiting for the event
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

  // ─── Step 2: Profile fetch — separate effect, runs after auth lock releases ─
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);

    const fetchProfile = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!cancelled) {
          setProfile(profileData);
          previousEmailRef.current = user.email || null;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }

      if (cancelled) return;

      // Fire-and-forget side effects — run after profile fetch so they never
      // block the UI, and outside the auth lock window.
      const currentSession = (await supabase.auth.getSession()).data.session;
      if (!currentSession) return;

      const sessionKey = `${user.id}-${currentSession.access_token.slice(-20)}`;

      // Only run SIGNED_IN side-effects once per unique token
      if (lastSignedInTokenRef.current === currentSession.access_token) {
        lastSignedInTokenRef.current = null; // consume

        supabase.functions.invoke('check-subscription').catch(console.error);

        supabase.functions.invoke('accept-contributor-invitation', {
          headers: { Authorization: `Bearer ${currentSession.access_token}` }
        }).catch((e) => console.error('Error checking contributor invitations:', e));

        if (!hasAlertedSession(sessionKey)) {
          addAlertedSession(sessionKey);
          SecurityAlertService.notifyNewLogin(user.id, user.email || '').catch(console.error);
        }
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [user?.id]); // re-run only when the user ID changes

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, giftCode?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { first_name: firstName || '', last_name: lastName || '' }
      }
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore errors — always clear local state
    }
    // Nuclear fallback: purge all Supabase auth tokens from localStorage
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') && (key.includes('-auth-token') || key.includes('-refresh-token') || key.includes('-provider-token'))
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem(`sb-leotcbfpqiekgkgumecn-auth-token`);
    } catch {
      // Ignore storage errors
    }
    // Force a full page reload regardless of current path.
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
      refreshProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
