import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableCard } from '@/components/table-card';
import { tables } from '@/lib/data';
import { LogOut } from 'lucide-react';

export default function WaiterPage() {
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </div>
  );
}
