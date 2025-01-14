import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null, // Tracks the authenticated user
    session: null, // Tracks the authentication session
    role: null, // Tracks the user's role
  });
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state for authentication

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Fetching session data...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session data:", error);
          throw error;
        }

        console.log("Session fetched:", session);

        if (session?.user) {
          console.log("Fetching role for user ID:", session.user.id);
          const { data, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (roleError) {
            console.error("Error fetching user role:", roleError);
            throw new Error("Failed to fetch user role");
          }

          console.log("User role fetched:", data?.role);

          setAuthState({
            user: session.user,
            session: session,
            role: data?.role || null,
          });
        } else {
          resetAuthState();
        }
      } catch (err) {
        console.error("Error initializing authentication:", err.message);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (session?.user) {
        setAuthState((current) => ({
          ...current,
          user: session.user,
          session: session,
          role: current.role || null, // Preserve existing role
        }));
      } else {
        resetAuthState();
      }
    });

    return () => {
      console.log("Cleaning up auth state change listener...");
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const resetAuthState = () => {
    console.log("Resetting auth state...");
    setAuthState({
      user: null,
      session: null,
      role: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState }}>
      {isLoading ? <div>Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
