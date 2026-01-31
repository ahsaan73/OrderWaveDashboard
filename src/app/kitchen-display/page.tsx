'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/order-card";
import { orders as initialOrders, type Order } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // To avoid hydration mismatch for timestamps, load orders on client
    setOrders(initialOrders);
    setIsClient(true);
  }, []);


  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ).sort((a,b) => a.createdAt - b.createdAt) // Keep orders sorted
    );
  };

  if (!isClient) {
    // You can return a loader here
    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-primary font-headline">Loading Kitchen...</h1>
        </div>
    );
  }

  const waitingOrders = orders.filter(o => o.status === 'Waiting');
  const cookingOrders = orders.filter(o => o.status === 'Cooking');
  // Show more done orders so it feels like things are moving
  const doneOrders = orders.filter(o => o.status === 'Done').slice(-5).reverse();

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-primary font-headline">Kitchen Orders</h1>
        <Button variant="ghost" asChild>
          <Link href="/" aria-label="Close KDS">
            <X className="w-8 h-8"/>
          </Link>
        </Button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {/* Waiting Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-red-400 text-center uppercase tracking-wider">Waiting</h2>
          {waitingOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
          ))}
        </div>
        
        {/* Cooking Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-yellow-400 text-center uppercase tracking-wider">Cooking</h2>
          {cookingOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
          ))}
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-green-400 text-center uppercase tracking-wider">Recently Done</h2>
          {doneOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
          ))}
        </div>
      </div>
    </div>
  );
}
