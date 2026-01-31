'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EditableStockCard } from '@/components/editable-stock-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { StockItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function StaffPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !['manager', 'admin'].includes(user?.role || '')) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const stockQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'stockItems');
  }, [firestore]);

  const { data: stock, isLoading: dataLoading } = useCollection<StockItem>(stockQuery);

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
  
  const isLoading = userLoading || dataLoading;

  if (userLoading || !user || !['manager', 'admin'].includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}
