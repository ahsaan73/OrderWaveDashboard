'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableCard } from '@/components/table-card';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Table } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const statuses: Table['status'][] = ['Empty', 'Seated', 'Eating', 'Needs Bill'];

export default function WaiterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const tablesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "tables"), orderBy("name"));
  }, [firestore]);

  const { data: tables, isLoading } = useCollection<Table>(tablesQuery);


  const handleTableStatusChange = async (tableId: string, currentStatus: Table['status']) => {
    if (!firestore) return;
    
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
        alert("Please enter a valid number of guests (1 or more).");
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


  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">Waiter View - Table Status</h1>
        <Button variant="outline" asChild onClick={() => auth?.signOut()}>
          <Link href="/login">
            <LogOut className="mr-2" /> Logout
          </Link>
        </Button>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <p className="text-center text-muted-foreground mb-6">Click on a table to cycle through its status. When seating an empty table, you'll be prompted for the number of guests.</p>
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
