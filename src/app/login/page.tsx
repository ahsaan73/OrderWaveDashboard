'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, User, Shield, ConciergeBell } from 'lucide-react';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

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
    <div className="flex h-screen w-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-headline text-center font-bold">Islamabad Bites</h1>
        <p className="text-muted-foreground text-center mb-6">Staff & Owner Login</p>
      
        <Card className="shadow-xl">
            <CardHeader>
            <CardTitle>Staff Login</CardTitle>
            <CardDescription>Select your role to begin your shift.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="h-20 flex-col" variant="secondary" onClick={() => handleLogin('manager')}>
                    <User className="mb-1"/>
                    Manager
                </Button>
                <Button size="lg" className="h-20 flex-col" variant="secondary" onClick={() => handleLogin('cashier')}>
                    <User className="mb-1"/>
                    Cashier
                </Button>
                <Button size="lg" className="h-20 flex-col" variant="secondary" onClick={() => handleLogin('waiter')}>
                    <ConciergeBell className="mb-1"/>
                    Waiter
                </Button>
                <Button size="lg" className="h-20 flex-col" variant="secondary" onClick={() => handleLogin('kitchen')}>
                    <ChefHat className="mb-1"/>
                    Kitchen
                </Button>
            </div>
            </CardContent>
        </Card>

        <div className="mt-6 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-4 text-xs font-semibold uppercase text-muted-foreground">Or</span>
            <Separator className="flex-grow" />
        </div>

        <Button size="lg" className="h-14 text-base w-full mt-6" onClick={() => handleLogin('admin')}>
            <Shield className="mr-3"/>
            Owner / Admin Login
        </Button>
      </div>
    </div>
  );
}
