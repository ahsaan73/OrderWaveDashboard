import Link from "next/link";
import { OrderCard } from "@/components/order-card";
import { orders as initialOrders } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const metadata = {
  title: "Kitchen Display - ZestyDash",
};

export default function KitchenDisplayPage() {
  const waitingOrders = initialOrders.filter(o => o.status === 'Waiting');
  const cookingOrders = initialOrders.filter(o => o.status === 'Cooking');
  const doneOrders = initialOrders.filter(o => o.status === 'Done').slice(0, 3); // Show only recent 3 completed

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Waiting Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-red-400 text-center">Waiting</h2>
          {waitingOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        
        {/* Cooking Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-yellow-400 text-center">Cooking</h2>
          {cookingOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {/* Done Column */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-green-400 text-center">Recently Done</h2>
          {doneOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
