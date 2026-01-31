'use client';
import {
  getDocs,
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

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(query);
        if (isMounted) {
          const result: T[] = [];
          snapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() } as T);
          });
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Error fetching collection:`, err);
          const permissionError = new FirestorePermissionError({
            path: (query as CollectionReference).path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(query)]); // Use JSON.stringify to deep compare query object

  return { data, isLoading, error };
}
