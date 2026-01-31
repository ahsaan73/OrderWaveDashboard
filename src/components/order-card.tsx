"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "./ui/separator";

interface OrderCardProps {
  order: Order;
}

const statusStyles = {
  Done: "bg-green-500 text-white",
  Cooking: "bg-yellow-500 text-black",
  Waiting: "bg-red-500 text-white",
};

export function OrderCard({ order: initialOrder }: OrderCardProps) {
  const [order, setOrder] = useState(initialOrder);

  // Simulate status changes for demo purposes
  useEffect(() => {
    if (order.status === 'Waiting') {
      const timer = setTimeout(() => {
        setOrder(prev => ({...prev, status: 'Cooking'}));
      }, Math.random() * 5000 + 3000);
      return () => clearTimeout(timer);
    }
    if (order.status === 'Cooking') {
        const timer = setTimeout(() => {
          setOrder(prev => ({...prev, status: 'Done'}));
        }, Math.random() * 8000 + 5000);
        return () => clearTimeout(timer);
      }
  }, [order.status]);


  return (
    <Card className="bg-gray-800 border-gray-700 text-white transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{order.id}</CardTitle>
          <span
            className={cn(
              "px-4 py-1.5 text-lg font-bold rounded-md capitalize transition-colors duration-500",
              statusStyles[order.status]
            )}
          >
            {order.status}
          </span>
        </div>
        <p className="text-gray-400">{order.time} - {order.customerName}</p>
      </CardHeader>
      <Separator className="bg-gray-700" />
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-lg">
              <span className="font-semibold">{item.name}</span>
              <span className="font-bold text-xl">x{item.quantity}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
