'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StockItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface StockItemCardProps {
  item: StockItem;
}

export function StockItemCard({ item }: StockItemCardProps) {
  const isLow = item.stockLevel < item.threshold;

  let progressColorClass = '[&>div]:bg-chart-2'; // green
  if (item.stockLevel < 50 && item.stockLevel >= item.threshold) {
    progressColorClass = '[&>div]:bg-chart-4'; // yellow
  }
  if (isLow) {
    progressColorClass = '[&>div]:bg-destructive'; // red
  }


  return (
    <Card className={cn("transition-all hover:shadow-md", isLow && "border-destructive/50 bg-destructive/5")}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>{item.name}</span>
          {isLow && <AlertTriangle className="h-5 w-5 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Progress 
            value={item.stockLevel} 
            className={progressColorClass}
          />
          <span className={cn("font-bold text-lg tabular-nums", isLow && "text-destructive")}>
            {item.stockLevel}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
