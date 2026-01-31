'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChefHat } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

// Mock SVG for Google Icon
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.2v2.6h5.3c-.2 1.5-1.2 3.1-3.1 3.1c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c1.1 0 2 .5 2.6 1.1l2.1-2.1C17.2 5.3 15 4 12.15 4C8.15 4 4.95 7.2 4.95 11.2s3.2 7.2 7.2 7.2c4.2 0 6.9-2.9 6.9-7.2c0-.6-.1-1.1-.3-1.7z"/></svg>
);


export default function LoginPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessingSignIn, setIsProcessingSignIn] = useState(true);

  // 1. If the user is already logged in, redirect them.
  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // 2. Handle the redirect result from Google Sign-In.
  useEffect(() => {
    if (!auth || !firestore) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User has successfully signed in.
          const user = result.user;
          const userRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (!docSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'waiter' // Default role
            }, { merge: true });
          }
          // The useUser hook will pick up the new user and trigger the redirect in the first effect.
        } else {
          // No redirect result, not in a sign-in flow.
          setIsProcessingSignIn(false);
        }
      })
      .catch((error) => {
        console.error('Error during sign-in redirect:', error);
        toast({
            variant: 'destructive',
            title: 'Sign-In Error',
            description: 'Could not complete sign-in. Please try again.'
        });
        setIsProcessingSignIn(false);
      });
  }, [auth, firestore, router, toast]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // Start the redirect flow. The logic in the useEffect above will handle the result.
    await signInWithRedirect(auth, provider);
  };
  
  // Show a loading state while checking auth status or processing a sign-in.
  if (userLoading || isProcessingSignIn) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  // If user exists after all checks, they will be redirected by the first effect.
  // This state is unlikely to be seen but is a good fallback.
  if (user) {
    return <div className="flex h-screen w-screen items-center justify-center">Redirecting...</div>;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-headline">Islamabad Bites</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">This is a managed system. Please sign in with your company-provided Google account.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
