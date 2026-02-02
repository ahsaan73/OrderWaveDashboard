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

    // The user is considered "loading" if auth is loading, or if we have an authUser but are still waiting for their profile.
    const isLoading = authLoading || (!!authUser && profileLoading);

    const user: AppUser | null = useMemo(() => {
        // We can only construct a full user if we have both the auth info and the firestore profile.
        if (!authUser || !userProfile) return null;

        return {
            id: authUser.uid,
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            ...userProfile 
        } as AppUser;

    }, [authUser, userProfile]);

    return {
        user,
        loading: isLoading,
        error: authError || profileError,
        authUser,
    };
}
