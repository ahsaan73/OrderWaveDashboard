'use client';

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from "@/firebase";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function KitchenDisplayPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const allowedRoles = ['kitchen', 'manager', 'admin'];

  useEffect(() => {
    if (!userLoading && (!user || !allowedRoles.includes(user.role || ''))) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  const canUpdate = user?.role === 'kitchen';

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, "orders"), 
        where('status', 'in', ['Waiting', 'Cooking'])
    );
  }, [firestore]);
  
  const doneOrdersQuery = useMemo(() => {
      if (!firestore) return null;
      return query(
          collection(firestore, "orders"),
          where('status', '==', 'Done')
      )
  }, [firestore]);

  const { data: activeOrders, isLoading: isLoadingActive } = useCollection<Order>(ordersQuery);
  const { data: doneOrdersData, isLoading: isLoadingDone } = useCollection<Order>(doneOrdersQuery);


  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!firestore || !canUpdate) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
      const updatePayload: { status: Order['status'], cookingStartedAt?: number } = { status: newStatus };
      if (newStatus === 'Cooking') {
        updatePayload.cookingStartedAt = Date.now();
      }
      await updateDoc(orderRef, updatePayload);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update order status.'
      })
    }
  };

  const waitingOrders = useMemo(() => 
    activeOrders
      ?.filter(o => o.status === 'Waiting')
      .sort((a, b) => a.createdAt - b.createdAt)
  , [activeOrders]);

  const cookingOrders = useMemo(() =>
    activeOrders
      ?.filter(o => o.status === 'Cooking')
      .sort((a, b) => a.createdAt - b.createdAt)
  , [activeOrders]);
  
  const doneOrders = useMemo(() =>
    doneOrdersData
        ?.sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
  , [doneOrdersData]);


  const renderSkeleton = () => (
      <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 mx-auto bg-gray-700 rounded animate-pulse" />
          <div className="aspect-square bg-gray-800 rounded-lg animate-pulse" />
          <div className="aspect-square bg-gray-800 rounded-lg animate-pulse" />
      </div>
  );
  
  const isLoading = userLoading || isLoadingActive || isLoadingDone;

  if (userLoading || !user || !allowedRoles.includes(user.role || '')) {
      return (
          <div className="bg-gray-900 text-white min-h-screen p-4 flex items-center justify-center">
              <p>Loading...</p>
          </div>
      );
  }

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
          {isLoadingActive ? renderSkeleton() : waitingOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>
        
        {/* Cooking Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-yellow-400 text-center uppercase tracking-wider">Cooking</h2>
          {isLoadingActive ? null : cookingOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-green-400 text-center uppercase tracking-wider">Recently Done</h2>
          {isLoadingDone ? null : doneOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}
