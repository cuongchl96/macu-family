import { createContext, useCallback, useContext, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'auth_token';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (pin: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      throw new Error('PIN không đúng');
    }
    const data: { access_token: string } = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: token !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
