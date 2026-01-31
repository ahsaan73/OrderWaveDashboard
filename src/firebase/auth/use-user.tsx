'use client';

export type UserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'manager' | 'cashier' | 'waiter';
};

const demoUser: UserProfile = {
    uid: 'demouser',
    email: 'demo@example.com',
    displayName: 'Demo User',
    photoURL: 'https://picsum.photos/seed/demouser/100/100',
    role: 'manager'
};

export function useUser() {
  return { user: demoUser, loading: false, error: null };
}
