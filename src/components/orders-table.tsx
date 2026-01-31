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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface OrdersTableProps {
  orders: Order[];
}

const mobileStatusStyles = {
  Done: "bg-chart-2/20 text-chart-2",
  Cooking: "bg-chart-4/20 text-chart-4",
  Waiting: "bg-chart-1/20 text-chart-1",
};

const desktopStatusStyles = {
  Done: "bg-chart-2/20 text-chart-2 border border-chart-2/30",
  Cooking: "bg-chart-4/20 text-chart-4 border border-chart-4/30",
  Waiting: "bg-chart-1/20 text-chart-1 border border-chart-1/30",
};


export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <>
      {/* Mobile View: List of Cards */}
      <div className="grid gap-4 md:hidden">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
              <div className="grid gap-1">
                <CardTitle className="text-base font-medium">{order.id}</CardTitle>
                <CardDescription>{order.customerName}</CardDescription>
              </div>
              <div className={cn("text-xs font-semibold capitalize px-2 py-1 rounded-full", mobileStatusStyles[order.status])}>
                {order.status.toLowerCase()}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <div className="text-sm text-muted-foreground mb-2 truncate">
                {order.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">{order.time}</span>
                <span className="text-base font-bold">
                  PKR {order.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View: Table */}
      <Card className="hidden md:block">
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
                  PKR {order.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full capitalize",
                      desktopStatusStyles[order.status]
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
    </>
  );
}
