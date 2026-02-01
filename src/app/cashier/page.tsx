'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PosItemCard } from '@/components/pos-item-card';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { MenuItem, Order } from '@/lib/types';

type OrderItem = {
  item: MenuItem;
  quantity: number;
};

export default function CashierPage() {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!['manager', 'admin', 'cashier'].includes(user.role || '')) {
        router.replace('/');
      }
    }
  }, [user, userLoading, router]);
  
  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'menuItems');
  }, [firestore]);

  const { data: menuItems, isLoading: dataLoading } = useCollection<MenuItem>(menuItemsQuery);

  const handleAddItem = (item: MenuItem) => {
    setOrder(currentOrder => {
      const existingItem = currentOrder.find(oi => oi.item.id === item.id);
      if (existingItem) {
        return currentOrder.map(oi =>
          oi.item.id === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...currentOrder, { item, quantity: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setOrder(currentOrder => {
        const existingItem = currentOrder.find(oi => oi.item.id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            return currentOrder.map(oi => oi.item.id === itemId ? {...oi, quantity: oi.quantity - 1} : oi)
        }
        return currentOrder.filter(oi => oi.item.id !== itemId)
    });
  }

  const calculateTotal = () => {
    return order.reduce((total, oi) => total + oi.item.price * oi.quantity, 0);
  };

  const handlePayment = async (method: 'Cash' | 'Card') => {
    if (order.length === 0) {
        toast({ variant: "destructive", title: "Cannot process payment", description: "The order is empty." });
        return;
    }
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Could not connect to the database."});
        return;
    }
    
    const total = calculateTotal();

    const newOrder: Omit<Order, 'id'| 'ref'> = {
        orderNumber: `#${Math.floor(Math.random() * 90000) + 10000}`,
        customerName: 'Walk-in Customer',
        items: order.map(oi => ({ name: oi.item.name, quantity: oi.quantity, price: oi.item.price })),
        status: 'Waiting',
        total: total,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'}),
        createdAt: Date.now(),
        paymentMethod: method,
        orderType: 'Pickup',
    };
    
    try {
        await addDoc(collection(firestore, 'orders'), newOrder);
        toast({ title: "Payment Successful", description: `${method} payment of PKR ${total.toFixed(2)} processed. Order sent to kitchen.` });
        setOrder([]);
    } catch (e) {
        console.error("Could not save order", e);
        toast({ variant: "destructive", title: "Error", description: "Could not save the order."});
    }
  };
  
  const isLoading = userLoading || dataLoading;

  if (isLoading || !user) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-muted/30">
        {/* Left Side: Menu Items */}
        <div className="flex-grow flex flex-col">
             <header className="bg-background shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary font-headline">Point of Sale</h1>
            </header>
            <ScrollArea className="flex-grow">
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {isLoading && Array.from({length: 12}).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
                    {menuItems?.map(item => (
                        <PosItemCard key={item.id} item={item} onSelect={handleAddItem} />
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* Right Side: Current Order */}
        <aside className="w-full lg:max-w-sm border-l bg-background flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Current Order</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-grow">
                <CardContent>
                    {order.length === 0 ? (
                        <p className="text-muted-foreground text-center mt-8">Tap an item to start an order.</p>
                    ) : (
                        <div className="space-y-4">
                            {order.map(({ item, quantity }) => (
                                <div key={item.id} className="flex items-center">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">PKR {item.price.toFixed(2)} x {quantity}</p>
                                    </div>
                                    <p className="font-bold">PKR {(item.price * quantity).toFixed(2)}</p>
                                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </ScrollArea>
            <CardFooter className="flex-col !p-4 border-t">
                 <div className="w-full flex justify-between items-center text-xl font-bold mb-4">
                    <span>Total:</span>
                    <span>PKR {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button size="lg" className="h-16 text-lg" onClick={() => handlePayment('Cash')}>Cash</Button>
                    <Button size="lg" className="h-16 text-lg" onClick={() => handlePayment('Card')}>Card</Button>
                </div>
            </CardFooter>
        </aside>
    </div>
  );
}
