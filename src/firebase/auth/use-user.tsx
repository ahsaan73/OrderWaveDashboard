'use client';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore, useMemoFirebase } from '../provider';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { useDoc } from '../firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export function useUser() {
    const auth = useAuth();
    const firestore = useFirestore();
    const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setAuthLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [auth]);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !firebaseUser) return null;
        return doc(firestore, 'users', firebaseUser.uid);
    }, [firestore, firebaseUser]);

    const { data: userProfile, isLoading: profileLoading, error } = useDoc<AppUser>(userProfileRef);

    const isLoading = authLoading || (!!firebaseUser && profileLoading);

    // Combine the auth user and profile data once both are loaded
    const user = firebaseUser && userProfile ? {
        ...firebaseUser, // uid, email from auth
        ...userProfile,  // role, displayName, etc., from firestore
    } : null;

    // If there's an auth user but no profile yet, return a minimal user object
    if (firebaseUser && !userProfile && !profileLoading) {
      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          id: firebaseUser.uid,
        },
        loading: false,
        error: null,
      }
    }

    return { user, loading: isLoading, error };
}
