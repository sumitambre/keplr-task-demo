import { useState, useEffect, useCallback } from 'react';

export type AuthUser = {
  username: string;
  role: 'admin' | 'user';
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

// In a real app, you'd use localStorage or secure cookie storage
const storage = {
  get: (): AuthState => {
    try {
      const token = sessionStorage.getItem('authToken');
      const user = JSON.parse(sessionStorage.getItem('authUser') || 'null');
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  },
  set: (state: AuthState) => {
    sessionStorage.setItem('authToken', state.token || '');
    sessionStorage.setItem('authUser', JSON.stringify(state.user));
  },
  clear: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
  },
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => storage.get());

  useEffect(() => {
    storage.set(authState);
  }, [authState]);

  const login = useCallback((newState: AuthState) => {
    setAuthState(newState);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setAuthState({ token: null, user: null });
  }, []);

  return { ...authState, login, logout };
};
