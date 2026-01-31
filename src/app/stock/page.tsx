import { DashboardLayout } from '@/components/dashboard-layout';
import { StockItemCard } from '@/components/stock-item-card';
import { stockItems } from '@/lib/data';

export default function StockPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Stock Levels
          </h1>
        </div>
        <p className="text-muted-foreground">
          Monitor your ingredient inventory at a glance. Low-stock items are highlighted.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stockItems.map(item => (
            <StockItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
