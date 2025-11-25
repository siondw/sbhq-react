import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface UserContextValue {
  user: JwtPayload | null;
  loginUser: (token: string) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);

  const loginUser = useCallback((token: string) => {
    localStorage.setItem('jwtToken', token);
    const decoded = jwtDecode<JwtPayload>(token);
    setUser(decoded);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      loginUser(token);
    }
  }, [loginUser]);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
