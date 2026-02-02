'use client';

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { collection, query, where, doc, updateDoc, getDoc, runTransaction, addDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import type { Order, MenuItem, StockItem, MenuItemRecipe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function KitchenDisplayPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading, authUser } = useUser();
  const router = useRouter();

  const allowedRoles = ['kitchen', 'manager', 'admin'];

  useEffect(() => {
    if (!userLoading) {
      if (user && !allowedRoles.includes(user.role || '')) {
        router.replace('/');
      } else if (!user && !authUser) {
        router.replace('/login');
      }
    }
  }, [user, userLoading, authUser, router]);

  const canUpdate = user?.role === 'kitchen' || user?.role === 'manager' || user?.role === 'admin';

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, "orders"), 
        where('status', 'in', ['Waiting', 'Cooking'])
    );
  }, [firestore, user]);
  
  const doneOrdersQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(
          collection(firestore, "orders"),
          where('status', '==', 'Done')
      )
  }, [firestore, user]);
  
  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'menuItems');
  }, [firestore]);

  const stockItemsQuery = useMemoFirebase(() => {
      if(!firestore) return null;
      return collection(firestore, 'stockItems');
  }, [firestore]);

  const recipesQuery = useMemoFirebase(() => {
    if(!firestore || !canUpdate) return null;
    return collection(firestore, 'menuItemRecipes');
  }, [firestore, canUpdate]);

  const { data: activeOrders, isLoading: isLoadingActive } = useCollection<Order>(ordersQuery);
  const { data: doneOrdersData, isLoading: isLoadingDone } = useCollection<Order>(doneOrdersQuery);
  const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsQuery);
  const { data: stockItems, isLoading: isLoadingStock } = useCollection<StockItem>(stockItemsQuery);
  const { data: recipes, isLoading: isLoadingRecipes } = useCollection<MenuItemRecipe>(recipesQuery);


  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!firestore || !canUpdate) return;
    const orderRef = doc(firestore, 'orders', orderId);

    // --- Stock Deduction Logic ---
    if (newStatus === 'Cooking' && menuItems && stockItems && recipes) {
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists() && !orderSnap.data().stockDeducted) {
            const orderData = orderSnap.data() as Order;
            try {
                const deductions = new Map<string, { item: StockItem, change: number }>();
                
                for (const orderItem of orderData.items) {
                    const menuItem = menuItems.find(mi => mi.name === orderItem.name);
                    if (menuItem) {
                        const recipe = recipes.find(r => r.id === menuItem.id);
                        if (recipe?.recipe) {
                            for (const recipeIngredient of recipe.recipe) {
                                const stockItem = stockItems.find(si => si.id === recipeIngredient.stockItemId);
                                if (stockItem) {
                                    const totalDeduction = recipeIngredient.quantity * orderItem.quantity;
                                    const current = deductions.get(stockItem.id) || { item: stockItem, change: 0 };
                                    deductions.set(stockItem.id, { ...current, change: current.change + totalDeduction });
                                }
                            }
                        }
                    }
                }

                const logData = [];
                for (const [stockItemId, deduction] of deductions.entries()) {
                    const stockItemRef = doc(firestore, 'stockItems', stockItemId);
                    const { oldStockLevel, newStockLevel } = await runTransaction(firestore, async (transaction) => {
                        const stockDoc = await transaction.get(stockItemRef);
                        if (!stockDoc.exists()) throw `Stock item ${deduction.item.name} not found!`;
                        
                        const oldStock = stockDoc.data().currentStock;
                        const newStock = oldStock - deduction.change;
                        transaction.update(stockItemRef, { currentStock: newStock });
                        return { oldStockLevel: oldStock, newStockLevel: newStock };
                    });

                    logData.push({
                        itemId: stockItemId,
                        itemName: deduction.item.name,
                        userId: user?.uid || 'system',
                        userName: user?.displayName || 'System (Kitchen)',
                        change: -deduction.change,
                        oldStockLevel,
                        newStockLevel,
                        reason: 'Order Fulfillment',
                        timestamp: Date.now(),
                    });
                }
                
                const logCollection = collection(firestore, 'inventoryLogs');
                await Promise.all(logData.map(log => addDoc(logCollection, log)));

                await updateDoc(orderRef, { stockDeducted: true });
                toast({ title: "Stock Deducted", description: `Ingredients for order ${orderData.orderNumber} deducted.` });

            } catch (e) {
                console.error("Stock deduction failed:", e);
                toast({ variant: 'destructive', title: 'Stock Deduction Failed', description: (e as Error).message });
                // We don't block the status update if stock deduction fails.
            }
        }
    }


    // --- Original Status Update Logic ---
    try {
      const updatePayload: { status: Order['status'], cookingStartedAt?: number, stockDeducted?: boolean } = { status: newStatus };
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
      .sort((a, b) => (a.cookingStartedAt || a.createdAt) - (b.cookingStartedAt || b.createdAt))
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
  
  const isLoading = userLoading || isLoadingActive || isLoadingDone || isLoadingMenu || isLoadingStock || isLoadingRecipes;

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
          {isLoading ? renderSkeleton() : waitingOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>
        
        {/* Cooking Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-yellow-400 text-center uppercase tracking-wider">Cooking</h2>
          {isLoading ? null : cookingOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-green-400 text-center uppercase tracking-wider">Recently Done</h2>
          {isLoading ? null : doneOrders?.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} canUpdate={canUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}
