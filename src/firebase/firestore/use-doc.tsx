'use client';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';
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

    setIsLoading(true);
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ ...docSnap.data(), id: docSnap.id } as T);
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: any) => {
        console.error(`Error fetching document:`, err);
        const permissionError = new FirestorePermissionError({
          path: docRef?.path || 'unknown',
          operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef?.path]); // Re-run effect if document path changes

  return { data, isLoading, error };
}
