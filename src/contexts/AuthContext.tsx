import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      console.log('[AuthContext] Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error loading profile:', error);
        throw error;
      }

      console.log('[AuthContext] Profile loaded:', {
        email: data?.email,
        role: data?.role,
        account_status: data?.account_status
      });

      // Check if user should be auto-upgraded to admin
      if (data && data.role !== 'admin') {
        await checkAndUpgradeToAdmin(data);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('[AuthContext] Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAndUpgradeToAdmin(currentProfile: Profile) {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

      // Only attempt upgrade if admin email is configured and matches current user
      if (adminEmail && currentProfile.email === adminEmail) {
        console.log('[AuthContext] Admin email matched, attempting secure upgrade...');

        // Call the secure RPC function that validates against database settings
        const { data: upgradeResult, error: upgradeError } = await supabase
          .rpc('upgrade_to_admin_if_authorized');

        if (upgradeError) {
          console.error('[AuthContext] Error during admin upgrade:', upgradeError);
          setProfile(currentProfile);
          return;
        }

        console.log('[AuthContext] Upgrade result:', upgradeResult);

        // If upgrade was successful, reload the profile to get updated data
        if (upgradeResult?.upgraded) {
          const { data: updatedProfile, error: reloadError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentProfile.id)
            .maybeSingle();

          if (!reloadError && updatedProfile) {
            console.log('[AuthContext] Profile upgraded to admin successfully:', {
              email: updatedProfile.email,
              role: updatedProfile.role
            });
            setProfile(updatedProfile);
            return;
          }
        }
      }

      // If no upgrade needed or upgrade failed, use current profile
      setProfile(currentProfile);
    } catch (error) {
      console.error('[AuthContext] Error in checkAndUpgradeToAdmin:', error);
      setProfile(currentProfile);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'manager',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
