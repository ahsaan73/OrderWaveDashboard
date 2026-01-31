'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '../provider';

export type UserProfile = User & {
    role?: 'manager' | 'cashier' | 'waiter';
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase services might not be initialized yet
      if (!loading) setLoading(true);
      return;
    };

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            
            // Check for user profile in Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUser({ ...user, ...userDoc.data() } as UserProfile);
            } else {
                // Handle case where user is authenticated but has no profile document
                // This could be a new user. The login page now handles creating this.
                setUser(user);
            }
          } else {
            // User is signed out
            setUser(null);
          }
        } catch (e) {
          setError(e as Error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading, error };
}
