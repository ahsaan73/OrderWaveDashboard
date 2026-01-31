"use client";

import type { Order } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "./ui/card";

interface OrdersTableProps {
  orders: Order[];
}

const statusStyles = {
  Done: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
  Cooking: "bg-chart-4/20 text-chart-4 border border-chart-4/30",
  Waiting: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                {order.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
              </TableCell>
              <TableCell>{order.time}</TableCell>
              <TableCell className="text-right">
                ${order.total.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full capitalize",
                    statusStyles[order.status]
                  )}
                >
                  {order.status.toLowerCase()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
