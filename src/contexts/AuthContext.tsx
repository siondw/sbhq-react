import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type Role = "admin" | "user" | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<Omit<AuthContextValue, "isLoading">>({
    user: null,
    session: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(true);

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
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (roleError) {
            throw new Error("Failed to fetch user role");
          }

          setAuthState({
            user: session.user,
            session: session,
            role: (data?.role as Role) ?? null,
          });
        } else {
          resetAuthState();
        }
      } catch (err) {
        console.error("Error initializing authentication:", (err as Error)?.message || err);
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
          session: session,
          role: current.role || null,
        }));
      } else {
        resetAuthState();
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const resetAuthState = () => {
    setAuthState({
      user: null,
      session: null,
      role: null,
    });
  };

  const value: AuthContextValue = { ...authState, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <div>Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
