'use client';
import {
  onSnapshot,
  type CollectionReference,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import type { FirebaseDocument } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T extends FirebaseDocument>(
  query: Query | CollectionReference | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to store the query to prevent re-subscribing on every render
  const queryRef = useRef(query);

  useEffect(() => {
    // Deep comparison of query objects to avoid re-fetching if the query itself hasn't changed
    if (JSON.stringify(queryRef.current) !== JSON.stringify(query)) {
      queryRef.current = query;
    }
  }, [query]);


  useEffect(() => {
    if (!queryRef.current) {
        setIsLoading(false);
        setData(null);
        return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      queryRef.current,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching collection:`, err);
        const permissionError = new FirestorePermissionError({
            path: (queryRef.current as CollectionReference).path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryRef]); // Dependency on the ref's value

  return { data, isLoading, error };
}
