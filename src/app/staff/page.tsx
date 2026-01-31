'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EditableStockCard } from '@/components/editable-stock-card';
import { stockItems as initialStockItems, type StockItem } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Role = 'manager' | 'cashier' | 'waiter' | null;

export default function StaffPage() {
  const [role, setRole] = useState<Role>(null);
  const [stock, setStock] = useState<StockItem[]>(initialStockItems);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') as Role;
    if (!userRole) {
      router.push('/login');
    } else {
      setRole(userRole);
    }
  }, [router]);

  const handleStockUpdate = (id: string, newStockLevel: number) => {
    setStock(currentStock =>
      currentStock.map(item =>
        item.id === id ? { ...item, stockLevel: newStockLevel } : item
      )
    );
  };

  const renderContent = () => {
    switch (role) {
      case 'manager':
        return (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Manage Stock
              </h1>
            </div>
            <p className="text-muted-foreground">
              Click on a stock level number to update it. This is a manager-only view.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stock.map(item => (
                <EditableStockCard key={item.id} item={item} onUpdate={handleStockUpdate} />
              ))}
            </div>
          </div>
        );
      case 'cashier':
      case 'waiter':
        const rolePage = role === 'cashier' ? '/cashier' : '/waiter';
        return (
          <Card>
            <CardHeader>
              <CardTitle>Staff Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Your primary workspace is elsewhere.</p>
              <Button asChild>
                <Link href={rolePage}>Go to your dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return <p>Loading or unrecognized role...</p>;
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
