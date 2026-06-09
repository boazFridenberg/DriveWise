import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { UserRole, IUser, RegisterRequest } from '../../../types';
import * as api from '../api/client';

export type AuthScreen = 'login' | 'register' | null;

interface AuthState {
  role: UserRole;
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  authScreen: AuthScreen;
  pendingPath: string | null;
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  openLogin: (returnPath?: string) => void;
  openRegister: (returnPath?: string) => void;
  closeAuth: () => void;
  clearPendingPath: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'drivewise_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    role: 'GUEST',
    user: null,
    token: null,
    isLoading: true,
    authScreen: null,
    pendingPath: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${saved}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((user: IUser) => {
        setState({
          role: user.role,
          user,
          token: saved,
          isLoading: false,
          authScreen: null,
          pendingPath: null,
        });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const { token, user } = await api.login(identifier, password);
    localStorage.setItem(TOKEN_KEY, token);
    setState((s) => ({
      role: user.role,
      user,
      token,
      isLoading: false,
      authScreen: null,
      pendingPath: s.pendingPath,
    }));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const { token, user } = await api.register(data);
    localStorage.setItem(TOKEN_KEY, token);
    setState((s) => ({
      role: user.role,
      user,
      token,
      isLoading: false,
      authScreen: null,
      pendingPath: s.pendingPath,
    }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      role: 'GUEST',
      user: null,
      token: null,
      isLoading: false,
      authScreen: null,
      pendingPath: null,
    });
  }, []);

  const openLogin = useCallback((returnPath?: string) => {
    setState((s) => ({ ...s, authScreen: 'login', pendingPath: returnPath ?? s.pendingPath }));
  }, []);

  const openRegister = useCallback((returnPath?: string) => {
    setState((s) => ({ ...s, authScreen: 'register', pendingPath: returnPath ?? s.pendingPath }));
  }, []);

  const closeAuth = useCallback(() => {
    setState((s) => ({ ...s, authScreen: null, pendingPath: null }));
  }, []);

  const clearPendingPath = useCallback(() => {
    setState((s) => ({ ...s, pendingPath: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        openLogin,
        openRegister,
        closeAuth,
        clearPendingPath,
        isAuthenticated: state.role !== 'GUEST' && !!state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
