'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { OrdersTable } from "@/components/orders-table";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { DollarSign, ShoppingCart, Users, Utensils, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useEffect, useMemo, useRef } from "react";
import { TableCard } from "@/components/table-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Order, Table, MenuItem } from "@/lib/types";
import { collection, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { startOfToday, getHours } from 'date-fns';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


const lineChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const pieChartConfig = {
  Burgers: { label: "Burgers", color: "hsl(var(--chart-1))" },
  Wraps: { label: "Wraps", color: "hsl(var(--chart-2))" },
  Pizzas: { label: "Pizzas", color: "hsl(var(--chart-3))" },
  Sides: { label: "Sides", color: "hsl(var(--chart-4))" },
  Drinks: { label: "Drinks", color: "hsl(var(--chart-5))" },
  Pasta: { label: "Pasta", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export default function Home() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
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

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        if (user.role === 'cashier') router.replace('/billing');
        else if (user.role === 'waiter') router.replace('/waiter');
        else if (user.role === 'kitchen') router.replace('/kitchen-display');
        else if (!['manager', 'admin'].includes(user.role || '')) {
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, userLoading, router]);

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    const last48Hours = Date.now() - 48 * 60 * 60 * 1000;
    return query(
      collection(firestore, "orders"),
      where("createdAt", ">=", last48Hours),
      orderBy("createdAt", "desc")
    );
  }, [firestore]);
  
  const tablesQuery = useMemo(() => {
    if(!firestore) return null;
    return query(collection(firestore, "tables"), orderBy("name"));
  }, [firestore]);

  const menuItemsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'menuItems');
  }, [firestore]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: tables, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection<MenuItem>(menuItemsQuery);
  
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


  const stats = useMemo(() => {
    if (!orders || !tables || !menuItems) return { 
        salesLast24h: 0,
        salesChangePercentage: 0,
        totalOrders: 0, 
        activeOrders: 0, 
        seatedGuests: 0,
        salesByHour: [],
        salesByCategory: [],
    };
    
    const now = Date.now();
    const todayStartTimestamp = startOfToday().getTime();
    const last24hTimestamp = now - 24 * 60 * 60 * 1000;

    const todaysOrders = orders.filter(o => o.createdAt >= todayStartTimestamp);
    const ordersLast24h = orders.filter(o => o.createdAt >= last24hTimestamp);
    const ordersPrevious24h = orders.filter(o => o.createdAt < last24hTimestamp);
    
    const salesLast24h = ordersLast24h.reduce((sum, o) => sum + o.total, 0);
    const salesPrevious24h = ordersPrevious24h.reduce((sum, o) => sum + o.total, 0);

    let salesChangePercentage = 0;
    if (salesPrevious24h > 0) {
        salesChangePercentage = ((salesLast24h - salesPrevious24h) / salesPrevious24h) * 100;
    } else if (salesLast24h > 0) {
        salesChangePercentage = 100;
    }
    
    const activeOrders = todaysOrders.filter(o => o.status === 'Cooking' || o.status === 'Waiting');
    const seatedGuests = tables?.filter(t => t.status !== 'Empty').reduce((acc, t) => acc + (t.guests || 0), 0) || 0;

    const hourlySales = Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0 }));
    todaysOrders.forEach(order => {
        const hour = getHours(new Date(order.createdAt));
        hourlySales[hour].sales += order.total;
    });

    const salesByHour = hourlySales.map((h, index) => ({
        hour: `${index % 12 === 0 ? 12 : index % 12} ${index < 12 ? 'AM' : 'PM'}`,
        sales: h.sales,
    })).slice(8, 22);


    const menuItemMap = new Map(menuItems.map(item => [item.name, item]));
    const categorySales: { [key: string]: number } = {};
    todaysOrders.forEach(order => {
        order.items.forEach(item => {
            const menuItemDetails = menuItemMap.get(item.name);
            if (menuItemDetails && menuItemDetails.category) {
                const category = menuItemDetails.category;
                categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
            }
        });
    });

    const salesByCategory = Object.keys(categorySales).map(category => ({
        category,
        sales: categorySales[category],
    }));

    return {
      salesLast24h,
      salesChangePercentage,
      totalOrders: todaysOrders.length,
      activeOrders: activeOrders.length,
      seatedGuests: seatedGuests,
      salesByHour,
      salesByCategory,
    }

  }, [orders, tables, menuItems]);

  const handleTableClick = (table: Table) => {
    if ((table.status === 'Eating' || table.status === 'Needs Bill') && table.orderId) {
      const order = orders?.find(o => o.id === table.orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
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
  
  const isLoading = isLoadingOrders || isLoadingTables || isLoadingMenuItems;
  const canManagePayment = user?.role === 'manager' || user?.role === 'admin';

  if (userLoading || !user || !['manager', 'admin'].includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Orders Today"
                    value={stats.totalOrders.toString()}
                    icon={<ShoppingCart className="text-blue-500" />}
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders.toString()}
                    icon={<Utensils className="text-yellow-500" />}
                />
                <StatCard
                    title="Guests Seated"
                    value={stats.seatedGuests.toString()}
                    icon={<Users className="text-purple-500" />}
                />
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                         <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Sales (Last 24h)</CardTitle>
                                <CardDescription>
                                    <span className={cn(
                                        "font-semibold",
                                        stats.salesChangePercentage >= 0 ? "text-green-600" : "text-destructive"
                                    )}>
                                      {stats.salesChangePercentage >= 0 ? '+' : ''}{stats.salesChangePercentage.toFixed(1)}%
                                    </span> vs previous 24h
                                </CardDescription>
                            </div>
                            <div className="text-4xl font-bold font-headline text-right">
                                PKR {stats.salesLast24h.toLocaleString()}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                    {isLoading ? <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" /> : (
                        <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
                            <LineChart data={stats.salesByHour} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis 
                                  tickLine={false} 
                                  axisLine={false} 
                                  tickMargin={8} 
                                  tickFormatter={(value) => {
                                      if (typeof value !== 'number' || value === 0) return 'PKR 0';
                                      if (value >= 1000) return `PKR ${value / 1000}k`;
                                      return `PKR ${value}`;
                                  }}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Categories</CardTitle>
                        <CardDescription>A circle chart showing what we sold most.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        {isLoading ? <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" /> : (
                        <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="sales" hideLabel />} />
                                <Pie data={stats.salesByCategory} dataKey="sales" nameKey="category" innerRadius={60} strokeWidth={5}>
                                    {stats.salesByCategory.map((entry) => (
                                        <Cell
                                        key={entry.category}
                                        fill={pieChartConfig[entry.category as keyof typeof pieChartConfig]?.color || 'hsl(var(--muted))'}
                                        />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                            </PieChart>
                        </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Restaurant Map</h2>
               <Card>
                <CardContent className="p-6">
                  {isLoadingTables ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {Array.from({length: 10}).map((_,i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"/>)} </div>: (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {tables?.map(table => (
                      <div key={table.id} onClick={() => handleTableClick(table)} className="cursor-pointer">
                        <TableCard 
                            table={table} 
                        />
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Live Orders</h2>
              {isLoadingOrders ? <Card><CardContent className="p-6"><div className="h-64 w-full bg-muted animate-pulse rounded-lg"/></CardContent></Card> : <OrdersTable orders={orders || []} />}
            </div>
        </>
      </div>
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
             {canManagePayment && selectedOrder && (
                <DialogFooter className="!justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2"/> Print Bill</Button>
                    {selectedOrder.tableId && <Button onClick={() => handleMarkAsPaid(selectedOrder)}>Mark as Paid (Cash)</Button>}
                </DialogFooter>
            )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
