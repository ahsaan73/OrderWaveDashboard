'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { OrdersTable } from "@/components/orders-table";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { DollarSign, ShoppingCart, Users, Utensils } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useState, useEffect, useMemo } from "react";
import { TableCard } from "@/components/table-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Order, Table, MenuItem } from "@/lib/types";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { startOfToday, endOfToday, getHours } from 'date-fns';


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
} satisfies ChartConfig

export default function Home() {
  const firestore = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), orderBy("createdAt", "desc"), limit(50));
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

  const stats = useMemo(() => {
    if (!orders || !tables || !menuItems) return { 
        moneyMadeToday: 0, 
        totalOrders: 0, 
        activeOrders: 0, 
        seatedGuests: 0,
        salesByHour: [],
        salesByCategory: [],
    };
    
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const todaysOrders = orders.filter(o => o.createdAt >= todayStart.getTime() && o.createdAt <= todayEnd.getTime());
    const activeOrders = orders.filter(o => o.status === 'Cooking' || o.status === 'Waiting');
    const seatedGuests = tables?.filter(t => t.status !== 'Empty').reduce((acc, t) => acc + (t.guests || 0), 0) || 0;
    const moneyMadeToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);

    // Sales by hour
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0 }));
    todaysOrders.forEach(order => {
        const hour = getHours(new Date(order.createdAt));
        hourlySales[hour].sales += order.total;
    });

    const salesByHour = hourlySales.map((h, index) => ({
        hour: `${index % 12 === 0 ? 12 : index % 12} ${index < 12 ? 'AM' : 'PM'}`,
        sales: h.sales,
    })).slice(8, 22); // From 8am to 10pm for more coverage


    // Sales by category
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
      moneyMadeToday,
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
  
  const isLoading = isLoadingOrders || isLoadingTables || isLoadingMenuItems;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Money Made Today"
            value={`PKR ${stats.moneyMadeToday.toLocaleString()}`}
            icon={<DollarSign className="text-green-500" />}
          />
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

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Today</CardTitle>
                    <CardDescription>A wavy line graph showing sales from morning to night.</CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoading ? <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" /> : (
                    <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
                        <LineChart data={stats.salesByHour} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `PKR ${value}`} />
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
        
        <Card className="text-center p-8 bg-card">
            <CardTitle className="text-muted-foreground font-normal">Total Cash Today</CardTitle>
            <p className="text-6xl font-bold font-headline mt-2">PKR {stats.moneyMadeToday.toLocaleString()}</p>
        </Card>

      </div>
       <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && closeOrderModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order for {tables?.find(t => t.orderId === selectedOrder?.id)?.name}</DialogTitle>
            <DialogDescription>
              Details for the current table order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex flex-col gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-2 text-muted-foreground">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
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
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
