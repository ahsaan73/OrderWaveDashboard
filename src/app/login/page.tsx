'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  useEffect(() => {
    // Clear any previous user on mount to ensure a clean login.
    localStorage.removeItem('userUid');
  }, []);

  const handleLogin = async () => {
    if (!firestore || !users) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database. Please try again.' });
      return;
    }
    if (!email) {
        toast({ variant: 'destructive', title: 'Email required', description: 'Please enter an email address.' });
        return;
    }
    setIsLoading(true);

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      toast({ title: 'Login Successful', description: `Welcome, ${user.displayName}!` });
      localStorage.setItem('userUid', user.uid);
      router.push('/');
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'User with that email not found.' });
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
          <CardDescription>Please sign in to continue. (No password needed)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="manager@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
                    required
                />
            </div>
            <Button 
                onClick={handleLogin} 
                className="w-full mt-2 h-12 text-base" 
                disabled={isLoading || usersLoading}
            >
                {isLoading || usersLoading ? 'Please wait...' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
