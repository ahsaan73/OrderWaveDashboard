import { DashboardLayout } from "@/components/dashboard-layout";
import { OrdersTable } from "@/components/orders-table";
import { StatCard } from "@/components/stat-card";
import { DollarSign, ShoppingCart } from "lucide-react";
import { orders, stats } from "@/lib/data";

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Live Orders</h2>
          <OrdersTable orders={orders} />
        </div>
      </div>
    </DashboardLayout>
  );
}
