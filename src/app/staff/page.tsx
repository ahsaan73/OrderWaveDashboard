'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EditableStockCard } from '@/components/editable-stock-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { StockItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function StaffPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const stockQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'stockItems');
  }, [firestore]);

  const { data: stock, isLoading } = useCollection<StockItem>(stockQuery);

  const handleStockUpdate = async (id: string, newStockLevel: number) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'stockItems', id);
    try {
      await updateDoc(itemRef, { stockLevel: newStockLevel });
      toast({ title: 'Success', description: 'Stock level updated.'})
    } catch (error) {
      console.error('Error updating stock level', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update stock level.'});
    }
  };

  const renderContent = () => {
    // For now, only managers can see this page.
    // We could extend this with `user?.role` if roles are added to user profiles in Firestore.
    if (user) {
        return (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Manage Stock
              </h1>
            </div>
            <p className="text-muted-foreground">
              Click on a stock level number to update it. This is a manager-only view.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading && Array.from({length: 8}).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"/>)}
              {stock?.map(item => (
                <EditableStockCard key={item.id} item={item} onUpdate={handleStockUpdate} />
              ))}
            </div>
          </div>
        );
    }
    
    return (
        <Card>
        <CardHeader>
            <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">You must be logged in to manage staff functions.</p>
            <Button asChild>
            <Link href="/login">Go to Login</Link>
            </Button>
        </CardContent>
        </Card>
    );
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
