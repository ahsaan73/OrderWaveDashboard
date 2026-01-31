'use client';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';

type Role = 'manager' | 'cashier' | 'waiter' | 'admin' | 'kitchen';

const demoUsers: Partial<Record<Role, User>> = {
    admin: {
        id: 'demoadmin',
        uid: 'demoadmin',
        email: 'admin@example.com',
        displayName: 'Demo Admin',
        photoURL: 'https://picsum.photos/seed/demoadmin/100/100',
        role: 'admin'
    },
    manager: {
        id: 'demomanager',
        uid: 'demomanager',
        email: 'manager@example.com',
        displayName: 'Demo Manager',
        photoURL: 'https://picsum.photos/seed/demomanager/100/100',
        role: 'manager'
    },
    cashier: {
        id: 'democashier',
        uid: 'democashier',
        email: 'cashier@example.com',
        displayName: 'Demo Cashier',
        photoURL: 'https://picsum.photos/seed/democashier/100/100',
        role: 'cashier'
    },
    waiter: {
        id: 'demowaiter',
        uid: 'demowaiter',
        email: 'waiter@example.com',
        displayName: 'Demo Waiter',
        photoURL: 'https://picsum.photos/seed/demowaiter/100/100',
        role: 'waiter'
    },
    kitchen: {
        id: 'demokitchen',
        uid: 'demokitchen',
        email: 'kitchen@example.com',
        displayName: 'Demo Kitchen',
        photoURL: 'https://picsum.photos/seed/demokitchen/100/100',
        role: 'kitchen'
    }
};

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This code runs only on the client.
        const storedRole = localStorage.getItem('userRole') as Role | null;
        if (storedRole && demoUsers[storedRole]) {
            setUser(demoUsers[storedRole] as User);
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    return { user, loading, error: null };
}
