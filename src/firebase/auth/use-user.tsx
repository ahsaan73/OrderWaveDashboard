'use client';
import type { User } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { useDoc } from '../firestore/use-doc';
import { useFirestore } from '../provider';
import { doc } from 'firebase/firestore';

export function useUser() {
    const [uid, setUid] = useState<string | null>(null);
    const [initialAuthCheck, setInitialAuthCheck] = useState(false);
    const firestore = useFirestore();

    useEffect(() => {
        // This code runs only on the client.
        const storedUid = localStorage.getItem('userUid');
        if (storedUid) {
            setUid(storedUid);
        }
        setInitialAuthCheck(true);
    }, []);

    const userRef = useMemo(() => {
        if (!firestore || !uid) return null;
        return doc(firestore, 'users', uid);
    }, [firestore, uid]);

    const { data: user, isLoading: isDocLoading, error } = useDoc<User>(userRef);

    // The overall loading state is true until the initial check is done AND
    // if there's a UID, we are also waiting for the document to load.
    const loading = !initialAuthCheck || (!!uid && isDocLoading);

    return { user, loading, error };
}
