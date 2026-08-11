import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/lib/token-storage';
import { setAuthHeader } from '@/api/client';
import { queryClient } from '@/app/query-client';
import { qk } from '@/constants/query-keys';
import type { User, UserRole } from '@/types/user';

type AuthStatus = 'idle' | 'bootstrapping' | 'ready';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  role: UserRole | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'bootstrapping',
  user: null,
  role: null,

  setUser: (user) => {
    set({ user, role: user?.role ?? null });
  },

  bootstrap: async () => {
    set({ status: 'bootstrapping' });
    const access = tokenStorage.getAccessToken();
    if (!access) {
      set({ status: 'ready', user: null, role: null });
      return;
    }
    setAuthHeader(access);
    try {
      const { user } = await authService.me();
      set({ user, role: user.role, status: 'ready' });
    } catch {
      queryClient.removeQueries({ queryKey: qk.profileScope });
      tokenStorage.clear();
      setAuthHeader(null);
      set({ user: null, role: null, status: 'ready' });
    }
  },

  login: async (login_identifier, password) => {
    const { tokens, user } = await authService.login({ login_identifier, password });
    if (!tokens?.access_token) throw new Error('Doğrulanmamış hesap veya eksik oturum.');
    queryClient.removeQueries({ queryKey: qk.profileScope });
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token ?? '');
    setAuthHeader(tokens.access_token);
    set({ user, role: user.role, status: 'ready' });
  },

  logout: async () => {
    await authService.logout();
    queryClient.removeQueries({ queryKey: qk.profileScope });
    set({ user: null, role: null, status: 'ready' });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('mentora:auth-expired', () => {
    void useAuthStore.getState().logout();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  });
}

export function roleHomePath(role: UserRole | null): string {
  switch (role) {
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'mentor':
      return '/mentor/dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/login';
  }
}
