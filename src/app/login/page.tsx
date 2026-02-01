'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';


export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [selectedUid, setSelectedUid] = useState<string>('');

  useEffect(() => {
    // Clear any previous user on mount
    localStorage.removeItem('userUid');
    localStorage.removeItem('userRole');
  }, []);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('displayName'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserType>(usersQuery);

  const handleLogin = () => {
    if (selectedUid) {
      localStorage.setItem('userUid', selectedUid);
      router.push('/');
    }
  };
  
  const getInitials = (name?: string | null) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const selectedUserDetails = users?.find(u => u.uid === selectedUid);

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
            <CardTitle>Select User</CardTitle>
            <CardDescription>Select your user profile to continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select value={selectedUid} onValueChange={setSelectedUid} disabled={isLoading}>
                    <SelectTrigger className="h-14">
                        <SelectValue placeholder="Select a user to login..." />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoading ? (
                            <div className="p-2">
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : (
                            users?.map(user => (
                                <SelectItem key={user.uid} value={user.uid}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || undefined} />
                                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.displayName}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                <Button size="lg" className="h-14 text-base w-full" onClick={handleLogin} disabled={!selectedUid || isLoading}>
                    <Shield className="mr-3"/>
                    Login as {selectedUserDetails?.displayName || '...'}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
