'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

// Mock SVG for Google Icon
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.2v2.6h5.3c-.2 1.5-1.2 3.1-3.1 3.1c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c1.1 0 2 .5 2.6 1.1l2.1-2.1C17.2 5.3 15 4 12.15 4C8.15 4 4.95 7.2 4.95 11.2s3.2 7.2 7.2 7.2c4.2 0 6.9-2.9 6.9-7.2c0-.6-.1-1.1-.3-1.7z"/></svg>
);


export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore if it doesn't exist
      if (user) {
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
      }
      router.push('/');
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  if (loading || user) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
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
