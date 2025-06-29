
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

let authInitialized = false;
let globalUser: User | null = null;
let globalSession: Session | null = null;
let globalLoading = true;
let subscribers: Array<(user: User | null, session: Session | null, loading: boolean) => void> = [];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [session, setSession] = useState<Session | null>(globalSession);
  const [loading, setLoading] = useState(globalLoading);

  useEffect(() => {
    // Subscribe to global auth state
    const updateState = (newUser: User | null, newSession: Session | null, newLoading: boolean) => {
      setUser(newUser);
      setSession(newSession);
      setLoading(newLoading);
    };

    subscribers.push(updateState);

    // Initialize auth only once globally
    if (!authInitialized) {
      authInitialized = true;
      console.log('useAuth: Initializing global auth state');

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state change:', event, !!session);
          
          globalSession = session;
          globalUser = session?.user ?? null;
          globalLoading = false;

          // Notify all subscribers
          subscribers.forEach(callback => {
            callback(globalUser, globalSession, globalLoading);
          });
        }
      );

      // Get initial session
      const getInitialSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting initial session:', error);
          }

          console.log('Initial session check:', !!session);
          globalSession = session;
          globalUser = session?.user ?? null;
          globalLoading = false;

          // Notify all subscribers
          subscribers.forEach(callback => {
            callback(globalUser, globalSession, globalLoading);
          });
        } catch (error) {
          console.error('Failed to get initial session:', error);
          globalLoading = false;
          
          // Notify all subscribers
          subscribers.forEach(callback => {
            callback(globalUser, globalSession, globalLoading);
          });
        }
      };

      getInitialSession();

      // Cleanup function for the subscription
      window.addEventListener('beforeunload', () => {
        subscription.unsubscribe();
      });
    }

    // Cleanup: remove subscriber when component unmounts
    return () => {
      const index = subscribers.indexOf(updateState);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      globalLoading = true;
      
      // Notify all subscribers of loading state
      subscribers.forEach(callback => {
        callback(globalUser, globalSession, globalLoading);
      });

      await supabase.auth.signOut();
      // Loading will be set to false by the auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
      globalLoading = false;
      
      // Notify all subscribers
      subscribers.forEach(callback => {
        callback(globalUser, globalSession, globalLoading);
      });
    }
  };

  return {
    user,
    session,
    loading,
    signOut
  };
};
