'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Chrome, Mail, Key } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  const handleEmailPasswordSubmit: SubmitHandler<LoginFormData> = async (data) => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not ready.'});
      return;
    };
    
    const { email, password } = data;

    try {
      let userCredential: UserCredential;
      if (isSignUp) {
        // Sign Up
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.email?.split('@')[0] || 'New User', // Default display name
            photoURL: '',
            role: 'cashier',
        }, { merge: true });
        toast({ title: 'Account Created!', description: 'You have been signed in.' });
      } else {
        // Sign In
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Signed in successfully!", description: "Welcome back." });
      }
    } catch (error: any) {
      console.error(`Error with email/password ${isSignUp ? 'sign up' : 'sign in'}`, error);
      toast({ variant: 'destructive', title: `Authentication Failed`, description: error.message });
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
          <CardDescription>Sign in or create an account to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleSubmit(handleEmailPasswordSubmit)} className="space-y-4">
               <div className="space-y-1">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input id="email" type="email" placeholder="m@example.com" {...register('email')} className="pl-9"/>
                 </div>
                 {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
               </div>
               <div className="space-y-1">
                 <Label htmlFor="password">Password</Label>
                 <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="pl-9"/>
                 </div>
                 {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
               </div>
               <Button type="submit" className="w-full">
                 {isSignUp ? 'Sign Up' : 'Sign In'}
               </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2" />
              Sign in with Google
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground">
             {isSignUp ? 'Already have an account?' : "Don't have an account?"}
             <Button variant="link" className="px-1 h-auto" onClick={() => setIsSignUp(!isSignUp)}>
               {isSignUp ? 'Sign In' : 'Sign Up'}
             </Button>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
