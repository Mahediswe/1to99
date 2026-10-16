import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('lxc_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await client.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('lxc_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('lxc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await client.post('/auth/register', { name, email, password });
    localStorage.setItem('lxc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('lxc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
