'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StockItemCard } from '@/components/stock-item-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { StockItem } from '@/lib/types';


export default function StockPage() {
  const firestore = useFirestore();
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

  const { data: stockItems, isLoading: dataLoading } = useCollection<StockItem>(stockQuery);

  const isLoading = userLoading || dataLoading;

  if (userLoading || !user || !['manager', 'admin'].includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Stock Levels
          </h1>
        </div>
        <p className="text-muted-foreground">
          Monitor your ingredient inventory at a glance. Low-stock items are highlighted.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && Array.from({length: 8}).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"/>)}
          {stockItems?.map(item => (
            <StockItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
