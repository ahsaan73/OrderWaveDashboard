'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TableCard } from '@/components/table-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Table } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const statuses: Table['status'][] = ['Empty', 'Seated', 'Eating', 'Needs Bill'];

export default function WaiterPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const prevTablesRef = useRef<Table[]>();

  const playNotificationSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  };

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!['waiter', 'manager', 'admin'].includes(user.role || '')) {
        router.replace('/');
      }
    }
  }, [user, userLoading, router]);

  const tablesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "tables"), orderBy("name"));
  }, [firestore]);

  const { data: tables, isLoading: dataLoading } = useCollection<Table>(tablesQuery);

  useEffect(() => {
    if (tables && prevTablesRef.current) {
        const prevNeedsBill = new Set(prevTablesRef.current.filter(t => t.status === 'Needs Bill').map(t => t.id));
        
        let soundPlayed = false;
        tables.forEach(table => {
            if (table.status === 'Needs Bill' && !prevNeedsBill.has(table.id) && !soundPlayed) {
                playNotificationSound();
                toast({ title: "Bill Requested", description: `${table.name} is ready to pay.`})
                soundPlayed = true; 
            }
        });
    }
    prevTablesRef.current = tables;
  }, [tables, toast]);

  const handleTableStatusChange = async (tableId: string, currentStatus: Table['status']) => {
    if (!firestore) return;
    
    if (user?.role !== 'waiter') {
        toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: "Only waiters can change table status."
        });
        return;
    }

    const tableRef = doc(firestore, 'tables', tableId);
    const currentStatusIndex = statuses.indexOf(currentStatus);
    const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
    const nextStatus = statuses[nextStatusIndex];

    let updates: Partial<Table> = { status: nextStatus };

    if (currentStatus === 'Empty' && nextStatus === 'Seated') {
      const guestCountStr = window.prompt(`Enter number of guests for table:`, "2");
      if (guestCountStr === null) return;
      const guestCount = parseInt(guestCountStr, 10);
      if (isNaN(guestCount) || guestCount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a valid number of guests.'});
        return;
      }
      updates.guests = guestCount;
    }
    
    if (nextStatus === 'Empty') {
      updates.guests = 0;
      updates.orderId = '';
    }

    try {
        await updateDoc(tableRef, updates);
    } catch (error) {
        console.error("Error updating table status:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update table status.'});
    }
  };

  const isLoading = userLoading || dataLoading;
  
  if (isLoading || !user) {
      return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  const pageTitle = user?.role === 'waiter' ? "Waiter View - Table Status" : "Restaurant Map (View-Only)";

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">{pageTitle}</h1>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        {user?.role === 'waiter' && (
            <p className="text-center text-muted-foreground mb-6">Click on a table to cycle through its status. When seating an empty table, you'll be prompted for the number of guests.</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading && Array.from({length: 10}).map((_, i) => <div key={i} className="h-40 w-full bg-muted rounded-lg animate-pulse" />)}
          {tables?.map(table => (
            <TableCard 
                key={table.id} 
                table={table} 
                onStatusChange={() => handleTableStatusChange(table.id, table.status)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
