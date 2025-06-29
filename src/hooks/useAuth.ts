
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Initial session error:', error);
        }

        if (isMounted) {
          console.log('Initial session:', !!initialSession);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event, !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the auth state
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Let the auth state change handler update the state
    } catch (error) {
      console.error('Sign out error:', error);
      // Force cleanup on error
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signOut
  };
};
