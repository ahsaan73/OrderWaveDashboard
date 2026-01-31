'use client';
import {
  onSnapshot,
  type CollectionReference,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { FirebaseDocument } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T extends FirebaseDocument>(
  query: Query | CollectionReference | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(query, 
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ ...doc.data(), id: doc.id } as T);
        });
        setData(result);
        setError(null);
        setIsLoading(false);
      },
      (err: any) => {
        console.error(`Error fetching collection:`, err);
        const permissionError = new FirestorePermissionError({
          path: (query as CollectionReference).path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [query]); // Use query object directly as dependency

  return { data, isLoading, error };
}
