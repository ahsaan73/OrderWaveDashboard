'use client';

import { useMemo } from 'react';
import { useFirebase, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export function useUser() {
    const { user: authUser, isUserLoading: authLoading, userError: authError } = useFirebase();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const { data: userProfile, isLoading: profileLoading, error: profileError } = useDoc<Omit<AppUser, 'id' | 'uid' | 'email' | 'displayName' | 'photoURL'>>(userDocRef);

    const user: AppUser | null = useMemo(() => {
        if (!authUser) return null;

        // Base user from auth
        const baseUser: Partial<AppUser> = {
            id: authUser.uid,
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
        };

        // If profile exists, merge it.
        if (userProfile) {
            return { ...baseUser, ...userProfile } as AppUser;
        }

        // If still loading profile but auth is done, return null to wait for profile
        if (authLoading || profileLoading) return null;
        
        // If auth is done, but there's no profile yet (e.g., first login), return a user without a role
        return baseUser as AppUser;

    }, [authUser, userProfile, authLoading, profileLoading]);

    return {
        user,
        loading: authLoading || profileLoading,
        error: authError || profileError,
    };
}
