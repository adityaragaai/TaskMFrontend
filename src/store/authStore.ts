import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const getUserFromStorage = (): User | null => {
  const raw = localStorage.getItem('userInfo');
  if (raw) return JSON.parse(raw);
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromStorage(),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null });
  },
}));
