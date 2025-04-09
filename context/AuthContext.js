'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const AuthContext = createContext({
  session: null,
  user: null,
  isLoading: true, // Start with loading true
});

export const AuthProvider = ({ children }) => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Fetch initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event, newSession); // Log auth events
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // No need to set loading false here again unless needed for specific events
        // setIsLoading(false); // Usually initial load is enough
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Re-run effect if supabase client instance changes

  const value = {
    session,
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
