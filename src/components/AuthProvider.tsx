import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithToken: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      adminApiService.setAuthToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await adminApiService.login(email, password);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithToken = (token: string) => {
    console.log('AuthProvider: Setting up OAuth login with token');
    localStorage.setItem('adminToken', token);
    adminApiService.setAuthToken(token);
    setIsAuthenticated(true);
    console.log('AuthProvider: isAuthenticated set to true');
  };

  const logout = () => {
    adminApiService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;