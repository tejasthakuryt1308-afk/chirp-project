import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chirp_token') || '');
  const [loading, setLoading] = useState(true);

  // ✅ FIX: set Authorization header ONLY when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Auth failed:', err);
        localStorage.removeItem('chirp_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // ✅ LOGIN
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('chirp_token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  // ✅ SIGNUP
  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);

    localStorage.setItem('chirp_token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('chirp_token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
