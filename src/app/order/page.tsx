'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { menuItems as allMenuItems, tables, type MenuItem } from '@/lib/data';
import { Plus, Minus, ShoppingCart, ChefHat, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type OrderItem = {
  item: MenuItem;
  quantity: number;
};

const restaurantImage = PlaceHolderImages.find(p => p.id === 'restaurant-front');

function OrderPageContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');
  const tableName = tables.find(t => t.id === tableId)?.name;

  const [order, setOrder] = useState<OrderItem[]>([]);
  const { toast } = useToast();

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
  };

  const handleClearItem = (itemId: string) => {
     setOrder(currentOrder => currentOrder.filter(oi => oi.item.id !== itemId));
  }

  const calculateTotal = () => {
    return order.reduce((total, oi) => total + oi.item.price * oi.quantity, 0);
  };
  
  const totalItems = order.reduce((total, oi) => total + oi.quantity, 0);

  const handlePlaceOrder = () => {
    if (order.length === 0) {
      toast({ variant: "destructive", title: "Your Tummy List is empty!", description: "Add some items before ordering." });
      return;
    }
    // In a real app, this would send the order to the kitchen.
    console.log("Order placed:", { order, tableId });
    toast({ title: "Order Sent!", description: `Your order for ${tableName || 'your table'} has been sent to the kitchen. We'll bring it to your table shortly!` });
    setOrder([]);
  };

  const menuItems = allMenuItems.filter(item => item.isAvailable);

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-background shadow-sm sticky top-0 z-20">
        <div className="container mx-auto p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary font-headline">Islamabad Bites</h1>
            <p className="text-sm text-muted-foreground">{tableName ? `Ordering for ${tableName}` : 'Welcome! Order from your table.'}</p>
          </div>
        </div>
        <div className="relative h-32 md:h-48 w-full">
            <Image 
              src={restaurantImage?.imageUrl || "https://picsum.photos/seed/restaurant-front/1200/300"}
              alt="Restaurant dining area"
              fill
              className="object-cover"
              data-ai-hint={restaurantImage?.imageHint || 'restaurant interior'}
            />
             <div className="absolute inset-0 bg-black/30"/>
        </div>
      </header>

      <main className="container mx-auto p-4 pb-32">
        <h2 className="text-3xl font-bold tracking-tight font-headline mb-6">Our Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="bg-background rounded-lg shadow-md overflow-hidden flex items-center gap-4 p-4 transition-all hover:shadow-lg">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-md object-cover"
                    data-ai-hint={item.imageHint}
                />
                <div className="flex-grow">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">PKR {item.price.toFixed(2)}</p>
                </div>
                <Button size="icon" className="rounded-full h-12 w-12" onClick={() => handleAddItem(item)}>
                    <Plus/>
                    <span className="sr-only">Add {item.name} to order</span>
                </Button>
            </div>
          ))}
        </div>
      </main>

      {totalItems > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button className="fixed bottom-6 right-6 h-20 w-auto px-6 rounded-full shadow-lg text-lg flex items-center gap-4 animate-in fade-in zoom-in">
              <div className="relative">
                <ShoppingCart className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{totalItems}</span>
              </div>
              <span>View Tummy List</span>
              <Separator orientation="vertical" className="h-8 bg-primary-foreground/50"/>
              <span className="font-bold">PKR {calculateTotal().toFixed(2)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-2xl">Your Tummy List</SheetTitle>
              <SheetDescription>Review your items before sending to the kitchen.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-grow my-4">
              {order.length === 0 ? (
                <p className="text-muted-foreground text-center mt-8">Your list is empty.</p>
              ) : (
                <div className="space-y-4 pr-4">
                  {order.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-start">
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-md object-cover mr-4" />
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary font-semibold">PKR {item.price.toFixed(2)}</p>
                         <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item.id)}><Minus className="h-3 w-3" /></Button>
                            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleAddItem(item)}><Plus className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">PKR {(item.price * quantity).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 mt-1" onClick={() => handleClearItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <SheetFooter className="flex-col gap-2 !space-x-0">
                <Separator />
                <div className="w-full flex justify-between items-center text-xl font-bold my-2">
                    <span>Total:</span>
                    <span>PKR {calculateTotal().toFixed(2)}</span>
                </div>
              <Button size="lg" className="w-full h-16 text-xl shiny-button" onClick={handlePlaceOrder}>
                <ChefHat className="mr-2"/> Order Now!
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      <style jsx>{`
        .shiny-button {
            position: relative;
            overflow: hidden;
            background-image: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)));
            background-size: 200% auto;
            transition: background-position 0.5s;
        }
        .shiny-button:hover {
            background-position: right center;
        }
      `}</style>
    </div>
  );
}


export default function OrderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderPageContent />
        </Suspense>
    )
}
