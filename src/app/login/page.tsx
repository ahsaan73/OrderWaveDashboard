'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, User, Shield, ConciergeBell } from 'lucide-react';
import { useEffect } from 'react';

type Role = 'manager' | 'cashier' | 'waiter' | 'admin' | 'kitchen';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any previous role on mount
    localStorage.removeItem('userRole');
  }, []);

  const handleLogin = (role: Role) => {
    localStorage.setItem('userRole', role);
    router.push('/');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-10 h-10 text-primary-foreground" />
            </div>
          <CardTitle className="text-3xl font-headline">Islamabad Bites</CardTitle>
          <CardDescription>Select a role to start your session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button size="lg" className="h-14 text-lg" onClick={() => handleLogin('admin')}>
                <Shield className="mr-3"/>
                Login as Admin
            </Button>
            <Button size="lg" className="h-14 text-lg" variant="secondary" onClick={() => handleLogin('manager')}>
                <User className="mr-3"/>
                Login as Manager
            </Button>
            <Button size="lg" className="h-14 text-lg" variant="secondary" onClick={() => handleLogin('cashier')}>
                <User className="mr-3"/>
                Login as Cashier
            </Button>
            <Button size="lg" className="h-14 text-lg" variant="secondary" onClick={() => handleLogin('waiter')}>
                <ConciergeBell className="mr-3"/>
                Login as Waiter
            </Button>
             <Button size="lg" className="h-14 text-lg" variant="secondary" onClick={() => handleLogin('kitchen')}>
                <ChefHat className="mr-3"/>
                Login as Kitchen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
