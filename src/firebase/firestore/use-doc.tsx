'use client';
import { getDoc, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { FirebaseDocument } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T extends FirebaseDocument>(
  docRef: DocumentReference<DocumentData> | null
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const docSnap = await getDoc(docRef);
        if (isMounted) {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            setData(null);
          }
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Error fetching document:`, err);
          const permissionError = new FirestorePermissionError({
            path: docRef?.path || 'unknown',
            operation: 'get'
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
  }, [docRef?.path]); // Re-run effect if document path changes

  return { data, isLoading, error };
}
