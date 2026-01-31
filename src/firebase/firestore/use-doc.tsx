'use client';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import type { FirebaseDocument } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T extends FirebaseDocument>(
  docRef: DocumentReference<DocumentData> | null
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const docRefRef = useRef(docRef);

  useEffect(() => {
      if (docRefRef.current?.path !== docRef?.path) {
          docRefRef.current = docRef;
      }
  }, [docRef]);

  useEffect(() => {
    if (!docRefRef.current) {
      setIsLoading(false);
      setData(null);
      return;
    }
    
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      docRefRef.current,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document:`, err);
         const permissionError = new FirestorePermissionError({
            path: docRefRef.current?.path || 'unknown',
            operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRefRef]);

  return { data, isLoading, error };
}
