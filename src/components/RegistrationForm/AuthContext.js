import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ confirmationResult: null });

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
