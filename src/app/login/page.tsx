'use client';

import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useAuth, useFirestore } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // 1. Existing User: Send them to their dashboard
        const data = userSnap.data();
        if (data.role === 'admin' || data.role === 'manager') {
            router.push('/');
        } else if (data.role === 'cashier') {
            router.push('/billing');
        } else if (data.role === 'waiter') {
            router.push('/waiter');
        } else if (data.role === 'kitchen') {
            router.push('/kitchen-display');
        } else {
            // Fallback for any other roles
            router.push('/');
        }
      } else {
        // 2. New User: Inform them they need approval and sign them out.
        console.log("New user detected. Please assign role in Firebase Console.");
        toast({
            title: "Account Created!",
            description: "Please wait for an administrator to assign you a role.",
            duration: 5000,
        });
        await auth.signOut();
      }
    } catch (error: any) {
      // Don't treat closing the popup as a critical error.
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user.');
        return; 
      }
      
      console.error("Login Failed:", error.code, error.message);
       toast({
            variant: "destructive",
            title: "Login Error",
            description: error.message,
        });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 gap-8 p-4 text-center">
        <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary font-headline">Islamabad Bites</h1>
            <p className="text-muted-foreground max-w-sm">
                The all-in-one dashboard for modern restaurants. Please sign in to continue.
            </p>
        </div>
      <Button onClick={handleLogin} size="lg">Login with Google</Button>
    </div>
  );
}
