import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_EXPIRY_KEY = 'admin_token_expiry';

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState(null);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const expiry = localStorage.getItem(ADMIN_EXPIRY_KEY);

    if (!token || !expiry) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Check if token is expired locally first
    if (Date.now() > parseInt(expiry)) {
      logout();
      setIsLoading(false);
      return;
    }

    // Verify token with server
    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'verify' })
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        setAdminEmail(data.email);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // Keep authenticated if server is unreachable but token exists and not expired
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  };

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'login', email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_EXPIRY_KEY, data.expiresAt.toString());

      setIsAuthenticated(true);
      setAdminEmail(data.email);
      setIsLoading(false);

      return { success: true };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EXPIRY_KEY);
    setIsAuthenticated(false);
    setAdminEmail(null);
  };

  const getToken = () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  };

  const value = {
    isAuthenticated,
    isLoading,
    adminEmail,
    error,
    login,
    logout,
    getToken,
    checkAuth
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;

