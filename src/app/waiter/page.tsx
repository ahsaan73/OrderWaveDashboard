'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableCard } from '@/components/table-card';
import { tables as initialTables, type Table } from '@/lib/data';
import { LogOut } from 'lucide-react';

const statuses: Table['status'][] = ['Empty', 'Seated', 'Eating', 'Needs Bill'];

export default function WaiterPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const handleTableStatusChange = (tableId: string) => {
    setTables(currentTables => {
      return currentTables.map(table => {
        if (table.id === tableId) {
          const currentStatusIndex = statuses.indexOf(table.status);
          const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
          const nextStatus = statuses[nextStatusIndex];
          
          // Reset guests if table becomes empty
          const newGuests = nextStatus === 'Empty' ? 0 : table.guests;
          // If table was empty, maybe seat some guests (for demo purposes)
          const updatedGuests = table.status === 'Empty' && nextStatus === 'Seated' ? (Math.floor(Math.random() * 5) + 1) : newGuests;


          return { ...table, status: nextStatus, guests: updatedGuests };
        }
        return table;
      });
    });
  };


  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">Waiter View - Table Status</h1>
        <Button variant="outline" asChild>
          <Link href="/login">
            <LogOut className="mr-2" /> Logout
          </Link>
        </Button>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <p className="text-center text-muted-foreground mb-6">Click on a table to cycle through its status.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <TableCard 
                key={table.id} 
                table={table} 
                onStatusChange={handleTableStatusChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
