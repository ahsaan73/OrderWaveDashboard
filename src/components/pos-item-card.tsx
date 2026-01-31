'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

interface PosItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function PosItemCard({ item, onSelect }: PosItemCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        !item.isAvailable && "opacity-50 cursor-not-allowed bg-muted/50"
      )}
      onClick={() => item.isAvailable && onSelect(item)}
    >
      <div className="relative">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={400}
          className="aspect-square object-cover"
          data-ai-hint={item.imageHint}
        />
        {!item.isAvailable && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-bold text-lg">Sold Out</p>
            </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-bold text-md truncate">{item.name}</h3>
        <p className="text-sm font-semibold text-primary">PKR {item.price.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
}
