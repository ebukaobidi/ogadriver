// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create a context to hold authentication data
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// Provider component that wraps the app and manages user state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore malformed data
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Optional: expose a hook for convenience (not required for current imports)
export const useAuth = () => React.useContext(AuthContext);
