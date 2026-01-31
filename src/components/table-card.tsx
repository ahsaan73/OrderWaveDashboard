'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Table } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Users, Utensils, CircleDollarSign, CheckCircle2 } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onStatusChange?: (tableId: string) => void;
}

const statusConfig = {
    Empty: {
        icon: CheckCircle2,
        className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
        label: "Empty"
    },
    Seated: {
        icon: Users,
        className: "bg-primary/10 text-primary border-primary/20",
        label: "Seated"
    },
    Eating: {
        icon: Utensils,
        className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
        label: "Eating"
    },
    'Needs Bill': {
        icon: CircleDollarSign,
        className: "bg-chart-1/10 text-chart-1 border-chart-1/20",
        label: "Needs Bill"
    }
}

export function TableCard({ table, onStatusChange }: TableCardProps) {
  const config = statusConfig[table.status];
  const Icon = config.icon;

  const isInteractive = !!onStatusChange;

  return (
    <Card 
        className={cn(
            "transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col aspect-[4/3] justify-center", 
            config.className,
            isInteractive && "cursor-pointer"
        )}
        onClick={() => onStatusChange?.(table.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-xl font-headline">
          <span>{table.name}</span>
          <Icon className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center gap-2 pt-0">
         <p className="text-3xl font-bold">{config.label}</p>
         {table.status !== 'Empty' && (
            <p className="text-md font-semibold text-current/80">{table.guests} Guests</p>
         )}
      </CardContent>
    </Card>
  );
}
