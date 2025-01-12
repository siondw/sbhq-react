import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase"; // Your Supabase client

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null, // Tracks the authenticated user
    session: null, // Tracks the authentication session
  });
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state for authentication

  useEffect(() => {
    // Initialize authentication state on load
    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        setIsLoading(false);
        return;
      }

      setAuthState({
        user: session?.user || null,
        session: session || null,
      });
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for authentication state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session); // Debug log
      setAuthState({
        user: session?.user || null,
        session: session || null,
      });
    });

    // Clean up the subscription on unmount
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe(); // Correctly unsubscribe
      } else {
        console.warn("No unsubscribe method found on subscription");
      }
    };
  }, []);

  const setUser = (user) => {
    setAuthState((current) => ({ ...current, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, setUser }}>
      {isLoading ? <div>Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
