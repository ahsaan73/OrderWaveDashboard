'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

export type UserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'manager' | 'cashier' | 'waiter';
};

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If auth service is not available (disabled), we are in a public-only mode.
    if (auth === null) {
        setUser(null);
        setLoading(false);
        return;
    }
    
    // If auth is not null, but firestore isn't ready, we wait.
    if (!firestore) {
      setLoading(true);
      return;
    };
    
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser: User | null) => {
      if (authUser) {
        const userRef = doc(firestore, 'users', authUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              setUser({ uid: authUser.uid, ...snapshot.data() } as UserProfile);
            } else {
              // User is authenticated but no profile in DB.
              // This can happen if profile creation on signup failed.
              // We create a shell profile from auth data.
              setUser({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              });
            }
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching user profile:", err);
            setError(err);
            setLoading(false);
          }
        );
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    }, (err) => {
        console.error("Auth state error:", err);
        setError(err);
        setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, loading, error };
}
