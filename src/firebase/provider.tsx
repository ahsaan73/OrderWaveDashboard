'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseContextValue>({
    app: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase();
    setServices({ app, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={services}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
export function useFirebaseApp() {
  return useContext(FirebaseContext).app;
}
export function useAuth() {
  return useContext(FirebaseContext).auth;
}
export function useFirestore() {
  return useContext(FirebaseContext).firestore;
}
