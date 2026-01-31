'use client';

import { useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const handleRoleChange = async (uid: string, newRole: User['role']) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', uid);
    try {
      await updateDoc(userRef, { role: newRole });
      toast({ title: 'Success', description: 'User role updated.' });
    } catch (error) {
      console.error('Error updating user role', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update user role.' });
    }
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
                                disabled={u.uid === user?.uid} // Can't change your own role
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
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
