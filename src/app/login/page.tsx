'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Chrome } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading, error } = useUser();

  const handleLogin = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create user document in Firestore on successful login
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'cashier', // Default role for new users
      }, { merge: true });

    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
         <p>Loading...</p>
       </div>
    )
  }

  if (user) {
    return null; // Or a redirect component
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-2xl font-headline">Islamabad Bites Login</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-center text-muted-foreground">
             This is a managed system. Please sign in with your company-provided Google account.
           </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            <Chrome className="mr-2" />
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
