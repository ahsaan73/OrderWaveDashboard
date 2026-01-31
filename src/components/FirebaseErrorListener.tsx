'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Caught Firestore Permission Error:', error);
      
      // In a development environment, we can throw the error to show Next.js overlay
      if (process.env.NODE_ENV === 'development') {
        // We throw it in a timeout to break out of the current React lifecycle
        setTimeout(() => {
            throw error;
        }, 0);
      } else {
        // In production, show a user-friendly toast notification
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: "You don't have permission to perform this action.",
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null; // This component doesn't render anything
}
