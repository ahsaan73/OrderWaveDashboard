'use client';

import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useAuth, useFirestore } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

      // Special check for Admin email. Make it case-insensitive.
      const isAdminEmail = user.email?.toLowerCase() === 'orderwave1@gmail.com';

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        
        // Self-healing: If this IS the admin email but the role in DB is wrong, fix it.
        if (isAdminEmail && data.role !== 'admin') {
            await updateDoc(userRef, { role: 'admin' });
            toast({ title: "Admin role corrected!", description: "Your administrative access has been restored." });
            router.push('/'); // Redirect to main admin dashboard
            return;
        }

        // Standard routing for existing users
        if (data.role === 'admin' || data.role === 'manager') {
            router.push('/');
        } else if (data.role === 'cashier') {
            router.push('/billing');
        } else if (data.role === 'waiter') {
            router.push('/waiter');
        } else if (data.role === 'kitchen') {
            router.push('/kitchen-display');
        } else {
            // Fallback for users with no valid role yet (should be caught by useUser hook)
            // but as a safety, send to login with a message.
            toast({
                title: "Role Not Assigned",
                description: "An administrator must assign you a role before you can log in.",
                duration: 5000,
            });
            await auth.signOut();
            router.push('/login');
        }
      } else {
        // New User
        const roleToAssign = isAdminEmail ? 'admin' : 'waiter';

        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: roleToAssign,
        });
        
        if (isAdminEmail) {
            toast({
                title: "Admin Account Initialized!",
                description: "Welcome! You have full administrative access.",
                duration: 5000,
            });
            router.push('/');
        } else {
            toast({
                title: "Account Registered!",
                description: "An administrator must assign you a role before you can log in.",
                duration: 5000,
            });
            await auth.signOut();
        }
      }
    } catch (error: any) {
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
