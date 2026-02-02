'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Order, Table } from '@/lib/types';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { startOfToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { OrdersTable } from '@/components/orders-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, ChefHat } from 'lucide-react';

export default function BillingPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading, authUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
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

  const allowedRoles = ['cashier', 'manager', 'admin'];

  useEffect(() => {
    if (!userLoading) {
      if (user && !allowedRoles.includes(user.role || '')) {
        router.replace('/');
      } else if (!user && !authUser) {
        router.replace('/login');
      }
    }
  }, [user, userLoading, authUser, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const todayStart = startOfToday();
    return query(
      collection(firestore, "orders"),
      where("createdAt", ">=", todayStart.getTime()),
      orderBy("createdAt", "desc")
    );
  }, [firestore, user]);
  
  const tablesQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, "tables"), orderBy("name"));
  }, [firestore]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: tables, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  }

  const handleMarkAsPaid = async (order: Order) => {
    if (!firestore || !order.tableId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process payment. Table not found.' });
        return;
    }

    const tableRef = doc(firestore, 'tables', order.tableId);
    try {
        await updateDoc(tableRef, {
            status: 'Empty',
            guests: 0,
            orderId: '',
        });
        toast({ title: 'Payment Confirmed', description: `Table ${tables?.find(t => t.id === order.tableId)?.name} is now empty.` });
        closeOrderModal();
    } catch (error) {
        console.error("Error marking table as paid:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update table status.' });
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Bill</title>');
            printWindow.document.write('<style> body { font-family: sans-serif; } .receipt { width: 300px; margin: auto; } h2, h3 { text-align: center; } table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; text-align: left; } .total { font-weight: bold; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    }
  };

  const isLoading = userLoading || isLoadingOrders || isLoadingTables;

  if (isLoading || !user || !allowedRoles.includes(user.role || '')) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-primary font-headline">Islamabad Bites</h1>
                <p className="text-sm text-muted-foreground">Billing & Live Orders</p>
            </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Live Orders</h1>
            <p className="text-muted-foreground mt-2">Click on an order to view its details and process payment.</p>
            <div className="mt-6">
            {isLoadingOrders ? <Card><CardContent className="p-6"><div className="h-64 w-full bg-muted animate-pulse rounded-lg"/></CardContent></Card> : <OrdersTable orders={orders || []} onOrderClick={handleOrderClick} />}
            </div>
        </div>
      </main>

       <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && closeOrderModal()}>
        <DialogContent>
            <div ref={receiptRef} className="receipt">
              <DialogHeader>
                <DialogTitle>Order: {tables?.find(t => t.orderId === selectedOrder?.id)?.name || selectedOrder?.customerName}</DialogTitle>
                <DialogDescription>
                  Date: {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString()} - {selectedOrder?.time}
                </DialogDescription>
              </DialogHeader>
              {selectedOrder && (
                <div className="flex flex-col gap-4 py-4">
                  {selectedOrder.orderType === 'Delivery' && (
                    <div className="text-sm border-b pb-4 mb-4">
                      <h3 className="font-semibold text-muted-foreground">Delivery Details</h3>
                      {selectedOrder.phoneNumber && <p><strong>Phone:</strong> {selectedOrder.phoneNumber}</p>}
                      {selectedOrder.address && <p className="mt-1"><strong>Address:</strong> {selectedOrder.address}</p>}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground border-b pb-1">Items</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                          <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Due:</span>
                    <span>PKR {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            {selectedOrder && (
                <DialogFooter className="!justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2"/> Print Bill</Button>
                    {selectedOrder.tableId && <Button onClick={() => handleMarkAsPaid(selectedOrder)}>Mark as Paid (Cash)</Button>}
                </DialogFooter>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
