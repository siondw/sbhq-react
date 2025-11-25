import React, { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';


const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('jwtToken');
        return token ? jwtDecode(token) : null;
    });

    const loginUser = useCallback((token) => {
        localStorage.setItem('jwtToken', token); // Store new token
        const decoded = jwtDecode(token);
        setUser(decoded);
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.removeItem('jwtToken'); // Clear token from storage
        setUser(null); // Reset user state
    }, []);

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
