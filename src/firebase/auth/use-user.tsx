'use client';

import type { User as AppUser } from '@/lib/types';

// This is a mock user hook for the demo version of the app.
// It simulates a logged-in admin user.
export function useUser() {
    const adminUser: AppUser = {
        id: 'demoadmin',
        uid: 'demoadmin',
        email: 'admin@example.com',
        displayName: 'Demo Admin',
        photoURL: 'https://picsum.photos/seed/demoadmin/100/100',
        role: 'admin',
    };

    return { user: adminUser, loading: false, error: null };
}
