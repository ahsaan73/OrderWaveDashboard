'use client';

import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { MenuItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailability: (id: string) => void;
  onEdit: () => void;
}

export function MenuItemCard({ item, onToggleAvailability, onEdit }: MenuItemCardProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden transition-all hover:shadow-xl", !item.isAvailable && "opacity-60 bg-muted/50")}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={400}
          className="aspect-square object-cover"
          data-ai-hint={item.imageHint}
        />
         <Button size="icon" className="absolute top-2 right-2 rounded-full" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Item</span>
         </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-bold mb-1">{item.name}</CardTitle>
        <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30 flex justify-between items-center">
        <Label htmlFor={`available-${item.id}`} className="text-sm font-medium">
          {item.isAvailable ? 'Available' : 'Sold Out'}
        </Label>
        <Switch
          id={`available-${item.id}`}
          checked={item.isAvailable}
          onCheckedChange={() => onToggleAvailability(item.id)}
        />
      </CardFooter>
    </Card>
  );
}
