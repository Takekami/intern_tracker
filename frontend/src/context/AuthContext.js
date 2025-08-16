import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (payload) => {
    setAuth(payload);
    localStorage.setItem('auth', JSON.stringify(payload));
    localStorage.setItem('token', payload.token);
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user: auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
