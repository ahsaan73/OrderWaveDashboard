'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Shield } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';


export default function LoginPage() {
  const router = useRouter();
  const firestore = useFirestore();

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
  
  const adminUser = users?.find(u => u.role === 'admin');
  const staffUsers = users?.filter(u => u.role !== 'admin');

  const handleLogin = (uid: string) => {
    if (uid) {
      localStorage.setItem('userUid', uid);
      router.push('/');
    }
  };
  
  const getInitials = (name?: string | null) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl">
        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-headline text-center font-bold">Islamabad Bites</h1>
        <p className="text-muted-foreground text-center mb-6">Staff & Owner Login</p>
      
        <div className="grid gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Staff Login</CardTitle>
                    <CardDescription>Select your profile to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-2">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-24 mt-2" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {staffUsers && staffUsers.length > 0 ? (
                                staffUsers.map(user => (
                                    <Card key={user.uid} className="cursor-pointer hover:bg-muted/50 hover:shadow-lg transition-all" onClick={() => handleLogin(user.uid)}>
                                        <CardContent className="flex flex-col items-center text-center gap-2 p-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={user.photoURL || undefined} />
                                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.displayName}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{user.role || 'No role assigned'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-muted-foreground p-8">
                                    No staff profiles found. An admin can add users on the 'User Management' page.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isLoading ? <Skeleton className="h-36 w-full" /> : adminUser ? (
                <Card className="shadow-lg bg-card border-primary/20">
                     <CardHeader>
                        <CardTitle>Owner / Admin Login</CardTitle>
                        <CardDescription>Administrative access.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Button
                            variant="ghost"
                            className="w-full h-auto p-6 rounded-t-none rounded-b-lg justify-between hover:bg-primary/10"
                            onClick={() => handleLogin(adminUser.uid)}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={adminUser.photoURL || undefined} />
                                    <AvatarFallback>{getInitials(adminUser.displayName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg">{adminUser.displayName}</p>
                                    <p className="text-muted-foreground capitalize">{adminUser.role}</p>
                                </div>
                            </div>
                            <Shield className="h-8 w-8 text-primary"/>
                        </Button>
                    </CardContent>
                </Card>
            ) : !isLoading && (
                 <Card className="shadow-lg bg-card border-destructive/20">
                     <CardHeader>
                        <CardTitle>Owner / Admin Login</CardTitle>
                        <CardDescription>Administrative access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center p-4">
                            No admin profile found. The database may need to be seeded initially.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
