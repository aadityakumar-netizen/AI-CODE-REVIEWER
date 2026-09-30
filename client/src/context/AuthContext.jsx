import { createContext, useContext, useEffect, useState } from 'react';

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const response = await loginUser(email, password);

    localStorage.setItem('authToken', response.data.token);

    setUser({
      email: response.data.email,
      id: response.data.id,
    });

    return response;
  }

  async function register(email, password) {
    const response = await registerUser(email, password);

    localStorage.setItem('authToken', response.data.token);

    setUser({
      email: response.data.email,
      id: response.data.id,
    });

    return response;
  }

  function logout() {
    localStorage.removeItem('authToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}