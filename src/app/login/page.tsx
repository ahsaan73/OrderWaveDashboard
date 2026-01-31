'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChefHat } from 'lucide-react';

type Role = 'manager' | 'cashier' | 'waiter';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('manager');

  const handleLogin = () => {
    // In a real app, you'd handle authentication here.
    // For this demo, we'll just redirect based on the selected role.
    localStorage.setItem('userRole', role);
    switch (role) {
      case 'manager':
        router.push('/');
        break;
      case 'cashier':
        router.push('/cashier');
        break;
      case 'waiter':
        router.push('/waiter');
        break;
    }
  };

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
          <CardDescription>Select a role to see the custom dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required defaultValue="manager@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
