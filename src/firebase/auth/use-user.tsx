'use client';
import type { User } from '@/lib/types';

export type UserProfile = User;

const demoUser: User = {
    id: 'demouser',
    uid: 'demouser',
    email: 'demo@example.com',
    displayName: 'Demo Admin',
    photoURL: 'https://picsum.photos/seed/demouser/100/100',
    role: 'manager'
};

export function useUser() {
  return { user: demoUser, loading: false, error: null };
}
