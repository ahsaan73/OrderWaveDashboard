'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear any previous user on mount to ensure a clean login.
    localStorage.removeItem('userUid');
  }, []);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Please enter both email and password.' });
      setIsLoading(false);
      return;
    }

    if (usersLoading) {
        toast({ variant: 'destructive', title: 'Please wait', description: 'User data is still loading.' });
        setIsLoading(false);
        return;
    }

    if (users) {
      const foundUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // This is a simulated login. In a real app, you'd verify the password.
        // For this demo, we just find the user by email.
        toast({ title: 'Login Successful', description: `Welcome back, ${foundUser.displayName}!`});
        localStorage.setItem('userUid', foundUser.uid);
        router.push('/');
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'No user found with that email address.' });
        setIsLoading(false);
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not verify user. Please try again.' });
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
          <CardDescription>Enter your email and password to login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || usersLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || usersLoading}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading || usersLoading}>
              {isLoading || usersLoading ? 'Please wait...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
