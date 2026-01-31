'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { OrdersTable } from "@/components/orders-table";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { orders, stats, salesByHour, salesByCategory } from "@/lib/data";
import { DollarSign, ShoppingCart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart"

const lineChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const pieChartConfig = {
  Pizza: {
    label: "Pizza",
    color: "hsl(var(--chart-1))",
  },
  Pasta: {
    label: "Pasta",
    color: "hsl(var(--chart-2))",
  },
  Drinks: {
    label: "Drinks",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Money Made Today"
            value={`$${stats.moneyMadeToday.toLocaleString()}`}
            icon={<DollarSign className="text-green-500" />}
            change="+12.5%"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            icon={<ShoppingCart className="text-blue-500" />}
            change="+5.2%"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Today</CardTitle>
                    <CardDescription>A wavy line graph showing sales from morning to night.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
                        <LineChart data={salesByHour} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>A circle chart showing what we sold most.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                     <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[250px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="sales" hideLabel />} />
                            <Pie data={salesByCategory} dataKey="sales" nameKey="category" innerRadius={60} strokeWidth={5}>
                                 {salesByCategory.map((entry) => (
                                    <Cell
                                      key={entry.category}
                                      fill={pieChartConfig[entry.category as keyof typeof pieChartConfig]?.color}
                                    />
                                 ))}
                            </Pie>
                             <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                        </PieChart>
                     </ChartContainer>
                </CardContent>
            </Card>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Live Orders</h2>
          <OrdersTable orders={orders} />
        </div>
        
        <Card className="text-center p-8 bg-card">
            <CardTitle className="text-muted-foreground font-normal">Total Cash Today</CardTitle>
            <p className="text-6xl font-bold font-headline mt-2">${stats.moneyMadeToday.toLocaleString()}</p>
        </Card>

      </div>
    </DashboardLayout>
  );
}
