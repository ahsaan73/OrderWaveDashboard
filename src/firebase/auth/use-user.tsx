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

        // If we are still fetching auth or profile, we aren't done yet.
        if (authLoading || profileLoading) return null;

        // If the profile exists, combine it with the auth data.
        if (userProfile) {
            return {
                id: authUser.uid,
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                ...userProfile 
            } as AppUser;
        }
        
        // If auth is done, but there's no profile (e.g., first login or awaiting approval),
        // we should not consider them a valid app user.
        return null;

    }, [authUser, userProfile, authLoading, profileLoading]);

    return {
        user,
        loading: authLoading || profileLoading,
        error: authError || profileError,
    };
}
