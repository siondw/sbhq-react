import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

type DecodedUser = Record<string, unknown> | null;

interface UserContextValue {
  user: DecodedUser;
  loginUser: (token: string) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DecodedUser>(() => {
    const token = localStorage.getItem('jwtToken');
    return token ? (jwtDecode(token) as DecodedUser) : null;
  });

  const loginUser = useCallback((token: string) => {
    localStorage.setItem('jwtToken', token);
    const decoded = jwtDecode(token) as DecodedUser;
    setUser(decoded);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};
