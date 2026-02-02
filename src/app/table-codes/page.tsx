'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Plus } from 'lucide-react';
import { QrCodeModal } from '@/components/qr-code-modal';
import { collection, query, orderBy, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Table } from '@/lib/types';
import { AddEditTableModal } from '@/components/add-edit-table-modal';
import { useToast } from '@/hooks/use-toast';

export default function TableCodesPage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, loading: userLoading, authUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const allowedRoles = ['manager', 'admin'];

  useEffect(() => {
    if (!userLoading) {
      if (user && !allowedRoles.includes(user.role || '')) {
        router.replace('/');
      } else if (!user && !authUser) {
        router.replace('/login');
      }
    }
  }, [user, userLoading, authUser, router]);

  const firestore = useFirestore();
  const tablesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tables'), orderBy('name'));
  }, [firestore]);
  const { data: tables, isLoading: dataLoading } = useCollection<Table>(tablesQuery);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShowQrCode = (table: Table) => {
    setSelectedTable(table);
    setIsQrModalOpen(true);
  };
  
  const handleSaveTable = async (data: { name: string; shape: 'square' | 'circle' }) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'tables'), {
        ...data,
        status: 'Empty',
        guests: 0,
      });
      toast({ title: 'Success', description: 'New table added.' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error saving table:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save table.' });
    }
  };

  const isLoading = userLoading || dataLoading;

  if (userLoading || !user || !allowedRoles.includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Table Codes
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate and print QR codes for your tables. Customers can scan these to order directly.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
            <Plus className="mr-2" /> Add Table
          </Button>
        </div>
        
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
                    Show QR Code
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedTable && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          setIsOpen={setIsQrModalOpen}
          table={selectedTable}
          url={`${origin}/order?tableId=${selectedTable.id}`}
        />
      )}
      <AddEditTableModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        onSave={handleSaveTable}
      />
    </DashboardLayout>
  );
}
