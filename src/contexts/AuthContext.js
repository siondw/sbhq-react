import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

/**
 * Provides authentication context for the application.
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {ReactNode} - The component with authentication context.
 */
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null, // Tracks the authenticated user
    confirmationResult: null, // Tracks the phone verification result
  });

  // Listen for changes in the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setAuthState((currentState) => ({ ...currentState, user }));
      } else {
        // User is signed out
        setAuthState((currentState) => ({ ...currentState, user: null }));
      }
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  /**
   * Sets the phone verification result in the authentication state.
   * @param {Object} confirmationResult - The phone verification result.
   */
  const setConfirmationResult = (confirmationResult) => {
    setAuthState((current) => ({ ...current, confirmationResult }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, setConfirmationResult }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
