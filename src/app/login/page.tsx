'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

// SVG for Google Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.35 6.48C12.73 13.72 17.94 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.02C44.19 38.04 46.98 31.88 46.98 24.55z"/>
        <path fill="#FBBC05" d="M10.91 28.7a14.93 14.93 0 0 1 0-9.4l-8.35-6.48C.23 16.34 0 20.08 0 24s.23 7.66 2.56 11.18l8.35-6.48z"/>
        <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.02c-2.15 1.45-4.92 2.3-8.16 2.3-6.06 0-11.27-4.22-13.09-9.92L2.56 34.78C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userRef = doc(firestore, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user, create a document in Firestore with a default role
        const newUser: Omit<User, 'id' | 'ref'> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'waiter', // Assign a default, non-admin role
        };
        await setDoc(userRef, newUser);
        toast({ title: 'Welcome!', description: "Your account has been created. An admin can assign you a different role." });
      } else {
         toast({ title: 'Login Successful', description: 'Welcome back!' });
      }

      router.push('/');
    } catch (error: any) {
      console.error("Google sign-in error", error);
      toast({ variant: 'destructive', title: 'Sign-In Failed', description: error.message || 'An unknown error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-headline">Islamabad Bites</CardTitle>
          <CardDescription>Please sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full mt-2 h-12 text-base"
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Please wait...' : (
                <>
                  <GoogleIcon className="mr-2"/> 
                  Sign In with Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
