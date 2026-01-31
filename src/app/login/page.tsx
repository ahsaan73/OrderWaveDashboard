'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Chrome } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'cashier',
      }, { merge: true });
      toast({ title: "Signed in successfully!", description: "Welcome back." });

    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
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
    return null;
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
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2" />
              Sign in with Google
            </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-center text-muted-foreground w-full">
             This is a managed system. Please sign in with your company-provided Google account.
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
