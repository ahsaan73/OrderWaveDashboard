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

      // 1. Check the "users" collection for this ID
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 2. Routing Logic based on your Hierarchy
      if (userSnap.exists() && userSnap.data().role === 'owner') {
        router.push("/owner-dashboard");
      } else {
        // If they aren't an owner, they are treated as staff or new users
        router.push("/staff-dashboard");
      }
    } catch (error: any) {
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
