"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import type { Order } from "@/lib/types";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  canUpdate?: boolean;
}

// Thresholds in minutes
const WAITING_THRESHOLD = 5;
const COOKING_THRESHOLD = 10;

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function OrderCard({ order, onUpdateStatus, canUpdate = false }: OrderCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (order.status === 'Done') {
        setElapsedTime(0);
        return;
    }

    const startTime = order.status === 'Cooking' && order.cookingStartedAt 
        ? order.cookingStartedAt 
        : order.createdAt;

    const updateTimer = () => {
      const seconds = (Date.now() - startTime) / 1000;
      setElapsedTime(seconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt, order.status, order.cookingStartedAt]);
  
  const isOverdue = 
    (order.status === 'Waiting' && elapsedTime > WAITING_THRESHOLD * 60) ||
    (order.status === 'Cooking' && elapsedTime > COOKING_THRESHOLD * 60);

  const handleStartCooking = () => {
    onUpdateStatus(order.id, 'Cooking');
  }

  const handleDone = () => {
    onUpdateStatus(order.id, 'Done');
  }

  return (
    <Card className={cn(
        "bg-gray-800 border-gray-700 text-white flex flex-col justify-between aspect-square transition-all",
        isOverdue && "bg-red-900/50 border-red-500",
        order.status === 'Done' && "opacity-50"
      )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold">{order.orderNumber}</CardTitle>
          {order.status !== 'Done' && (
            <div className={cn(
                "text-2xl font-bold font-mono px-2 py-1 rounded-md",
                isOverdue ? "bg-red-500 text-white" : "bg-gray-700"
              )}>
                {formatDuration(elapsedTime)}
            </div>
          )}
        </div>
        <p className="text-gray-400">{order.customerName}</p>
      </CardHeader>
      
      <CardContent className="flex-grow flex items-center justify-center py-0">
        <ul className="space-y-2 text-center">
          {order.items.map((item, index) => (
            <li key={index} className="flex flex-col">
              <span className="text-4xl font-bold leading-tight">{item.name}</span>
              <span className="text-2xl font-bold text-yellow-400">x{item.quantity}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-2">
        {order.status === 'Waiting' && (
          <Button onClick={handleStartCooking} disabled={!canUpdate} className="w-full h-16 text-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold disabled:opacity-70 disabled:cursor-not-allowed">
            Start Cooking
          </Button>
        )}
        {order.status === 'Cooking' && (
            <Button onClick={handleDone} disabled={!canUpdate} className="w-full h-16 text-xl bg-green-500 hover:bg-green-600 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed">
            DONE
          </Button>
        )}
        {order.status === 'Done' && (
            <div className="w-full h-16 flex items-center justify-center text-2xl bg-green-900/50 text-green-400 font-bold rounded-md">
                Completed
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
