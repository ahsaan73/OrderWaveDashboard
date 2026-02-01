'use client';
import type { User } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { useDoc } from '../firestore/use-doc';
import { useFirestore } from '../provider';
import { doc } from 'firebase/firestore';

export function useUser() {
    const [uid, setUid] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        // This code runs only on the client.
        let storedUid = localStorage.getItem('userUid');
        
        if (storedUid) {
            setUid(storedUid);
        } else {
            // Handle backwards compatibility with old role-based login
            const storedRole = localStorage.getItem('userRole') as string | null;
            if (storedRole) {
                // Map old role to a default UID for that role.
                const roleToUidMap: Record<string, string> = {
                    admin: 'demoadmin',
                    manager: 'demomanager',
                    cashier: 'cashier-1',
                    waiter: 'waiter-1',
                    kitchen: 'kitchen-1',
                };
                const newUid = roleToUidMap[storedRole];
                if (newUid) {
                    localStorage.setItem('userUid', newUid);
                    localStorage.removeItem('userRole');
                    setUid(newUid);
                }
            }
        }
        // If no UID is found by this point, we're done with initial loading.
        setLoading(false);
    }, []);

    const userRef = useMemo(() => {
        if (!firestore || !uid) return null;
        return doc(firestore, 'users', uid);
    }, [firestore, uid]);

    const { data: user, isLoading: isDocLoading, error } = useDoc<User>(userRef);

    // Final loading state depends on both finding a UID on mount and then fetching the doc.
    const isAuthLoading = loading || (!!uid && isDocLoading);

    return { user, loading: isAuthLoading, error };
}
