import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, getAuthToken, setAuthToken, clearAuthToken, api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken('');
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    // Verify token with backend
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          setCurrentUser(userData);
        })
        .catch(() => {
          clearAuthToken();
          setUser(null);
          setToken('');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [token]);

  const loginUser = (authResult) => {
    setAuthToken(authResult.access_token);
    setCurrentUser(authResult.user);
    setToken(authResult.access_token);
    setUser(authResult.user);
  };

  const logoutUser = () => {
    clearAuthToken();
    setUser(null);
    setToken('');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login: loginUser,
      logout: logoutUser,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
