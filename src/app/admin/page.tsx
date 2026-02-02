'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError, useAuth } from '@/firebase';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading, authUser } = useUser();
  const auth = useAuth();

  useEffect(() => {
    // While user state is loading, do nothing.
    if (userLoading) {
      return;
    }

    // If no authenticated user, redirect to login.
    if (!authUser) {
        router.replace('/login');
        return;
    }

    // If user profile is not yet loaded, wait.
    if (!user) {
      return;
    }

    // If user has a role, but it's not admin, redirect to dashboard.
    if (user.role && user.role !== 'admin') {
      router.replace('/');
    } else if (!user.role) {
      // No role is an invalid state. Log out.
      signOut(auth).then(() => router.replace('/login'));
    }
  }, [user, userLoading, authUser, router, auth]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.role !== 'admin') return null;
    return collection(firestore, 'users');
  }, [firestore, user]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const handleRoleChange = (uid: string, newRole: User['role']) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', uid);
    updateDoc(userRef, { role: newRole })
      .then(() => {
        toast({ title: 'Success', description: 'User role updated.' });
      })
      .catch((serverError) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update user role.',
        });
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { role: newRole },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const getInitials = (name?: string | null) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const isLoading = userLoading || usersLoading;

  if (userLoading || !user || user.role !== 'admin') {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            User Management
          </h1>
        </div>
        <p className="text-muted-foreground">
          Assign roles to different users in the system.
        </p>
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>A list of all users in your system.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <div className="h-64 bg-muted animate-pulse rounded-lg" /> : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[150px]">Role</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users?.map(u => (
                        <TableRow key={u.uid}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={u.photoURL || undefined} />
                                    <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{u.displayName}</span>
                            </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                            <Select 
                                defaultValue={u.role} 
                                onValueChange={(value: User['role']) => handleRoleChange(u.uid, value)}
                                disabled={u.uid === user?.uid || u.role === 'admin'} // Can't change your own role or other admins
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="waiter">Waiter</SelectItem>
                                    <SelectItem value="kitchen">Kitchen</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
