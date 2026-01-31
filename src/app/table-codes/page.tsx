'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import { QrCodeModal } from '@/components/qr-code-modal';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Table } from '@/lib/types';

export default function TableCodesPage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const firestore = useFirestore();
  const tablesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tables'), orderBy('name'));
  }, [firestore]);
  const { data: tables, isLoading } = useCollection<Table>(tablesQuery);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShowQrCode = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Table QR Codes
          </h1>
        </div>
        <p className="text-muted-foreground">
          Generate a unique QR code for each table. Customers can scan it to view the menu and place an order.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Loading tables...</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables?.map(table => (
                <div key={table.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-semibold">{table.name}</span>
                  <Button variant="outline" size="sm" onClick={() => handleShowQrCode(table)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Make QR Code
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedTable && (
        <QrCodeModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          table={selectedTable}
          url={`${origin}/order?tableId=${selectedTable.id}`}
        />
      )}
    </DashboardLayout>
  );
}
