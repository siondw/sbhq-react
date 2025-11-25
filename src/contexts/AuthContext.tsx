import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Role } from '../types/sbhq';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [authState, setAuthState] = useState<Omit<AuthContextValue, 'isLoading'>>({
    user: null,
    session: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const resetAuthState = () => {
    setAuthState({
      user: null,
      session: null,
      role: null,
    });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (session?.user) {
          const { data, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (roleError) {
            throw new Error('Failed to fetch user role');
          }

          setAuthState({
            user: session.user,
            session,
            role: (data?.role ?? null) as Role,
          });
        } else {
          resetAuthState();
        }
      } catch (err) {
        console.error('Error initializing authentication:', (err as Error).message);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState((current) => ({
          ...current,
          user: session.user,
          session,
          role: current.role ?? null,
        }));
      } else {
        resetAuthState();
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = { ...authState, isLoading };

  return <AuthContext.Provider value={value}>{isLoading ? <div>Loading authentication...</div> : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
