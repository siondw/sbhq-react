import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';


const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const loginUser = (token) => {
        localStorage.setItem('jwtToken', token); // Store new token
        const decoded = jwtDecode(token);
        setUser(decoded);
    };

    const logoutUser = () => {
        localStorage.removeItem('jwtToken'); // Clear token from storage
        setUser(null); // Reset user state
    };

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            loginUser(token); // Decode and set user from token
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
