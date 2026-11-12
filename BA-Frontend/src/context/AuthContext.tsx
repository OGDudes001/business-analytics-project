import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router';
import Loading from '@/components/common/Loading';
import api from '@/lib/axios';
import { useToast } from '@/context/ToastContext';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  business?: {
    business_name: string;
    business_image?: string | null;
    business_image_url?: string | null;
    business_type?: string;
    business_address?: string;
    date_started?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  updateUser: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      return;
    }

    api().get('/api/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        showToast('info', 'Your session could not be restored. Please sign in again.');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const login = useCallback((userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('token')) {
        await api().post('/api/logout');
      }
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, updateUser, logout }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- Keep the auth hook beside its provider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Security Guard: Requires user to be logged in
export function ProtectedRoute({ allowedRole }: { allowedRole?: 'admin' | 'user' }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/" replace />;

  const isAdmin = user.role === 'admin';

  if (allowedRole === 'admin' && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (allowedRole === 'user' && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

// Security Guard: Prevents logged-in users from seeing the login page again
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (user) {
    const isAdmin = user.role === 'admin';
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/home'} replace />;
  }

  return <Outlet />;
}