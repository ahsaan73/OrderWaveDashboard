'use client';

import type { User } from 'firebase/auth';

// This is a mock user profile.
// Since login has been removed, we can define a static user type.
export type UserProfile = User & {
    role?: 'manager' | 'cashier' | 'waiter';
}

// This hook now returns a static value as there is no authentication.
export function useUser() {
  return { user: null, loading: false, error: null };
}
