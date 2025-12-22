import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityAlertService } from '@/services/SecurityAlertService';

interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; data?: any }>;
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
  const previousEmailRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and check subscription status
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              setProfile(profileData);
              
              // Check subscription status on login
              await supabase.functions.invoke('check-subscription');

              // Check for pending contributor invitations on login/signup
              if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                try {
                  await supabase.functions.invoke('accept-contributor-invitation', {
                    headers: {
                      Authorization: `Bearer ${session.access_token}`
                    }
                  });
                } catch (inviteError) {
                  console.error('Error checking contributor invitations:', inviteError);
                }
              }

              // Send security alert for new login
              if (event === 'SIGNED_IN') {
                SecurityAlertService.notifyNewLogin(
                  session.user.id,
                  session.user.email || ''
                ).catch(console.error);
              }

              // Detect email change
              if (event === 'USER_UPDATED' && previousEmailRef.current && session.user.email) {
                if (previousEmailRef.current !== session.user.email) {
                  SecurityAlertService.notifyEmailChanged(
                    session.user.id,
                    previousEmailRef.current,
                    session.user.email
                  ).catch(console.error);
                }
              }

              // Track current email for change detection
              previousEmailRef.current = session.user.email || null;

            } catch (error) {
              console.error('Error fetching profile or checking subscription:', error);
            }
          }, 0);
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

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback?type=signup&redirect_to=/welcome`;
    
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
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
