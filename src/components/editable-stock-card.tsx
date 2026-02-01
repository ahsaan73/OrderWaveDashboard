'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { StockItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X, Pencil, Trash2 } from 'lucide-react';

interface EditableStockCardProps {
  item: StockItem;
  onUpdate: (item: StockItem, newLevel: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EditableStockCard({ item, onUpdate, onEdit, onDelete }: EditableStockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLevel, setEditedLevel] = useState(item.currentStock ?? 0);

  const currentStock = item.currentStock ?? 0;
  const totalStock = item.totalStock ?? 0;
  const threshold = item.threshold ?? 0;

  const stockPercentage = totalStock > 0 ? (currentStock / totalStock) * 100 : 0;
  const isLow = stockPercentage < threshold;

  let progressColorClass = '[&>div]:bg-chart-2'; // green
  if (stockPercentage < 50 && stockPercentage >= threshold) {
    progressColorClass = '[&>div]:bg-chart-4'; // yellow
  }
  if (isLow) {
    progressColorClass = '[&>div]:bg-destructive'; // red
  }

  const handleSave = () => {
    let newLevel = editedLevel;
    if (newLevel > totalStock) newLevel = totalStock;
    if (newLevel < 0) newLevel = 0;
    onUpdate(item, newLevel);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedLevel(currentStock);
    setIsEditing(false);
  }

  return (
    <Card className={cn("transition-all hover:shadow-md flex flex-col", isLow && !isEditing && "border-destructive/50 bg-destructive/5")}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <CardTitle className="text-xl">
          {item.name}
        </CardTitle>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Ingredient</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Ingredient</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center gap-2">
        <div className="flex items-center gap-4">
          <Progress 
            value={stockPercentage} 
            className={cn(progressColorClass, "h-3 transition-all")}
          />
          <span className={cn( "font-bold text-lg tabular-nums", isLow && "text-destructive" )}>
              {Math.round(stockPercentage)}%
            </span>
        </div>
        {isEditing ? (
            <div className="flex items-center gap-2">
                <Input 
                    type="number"
                    value={editedLevel}
                    onChange={(e) => setEditedLevel(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-9"
                    max={totalStock}
                    min={0}
                />
                <Button size="icon" className="h-9 w-9 bg-green-500 hover:bg-green-600 shrink-0" onClick={handleSave}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={handleCancel}><X className="h-4 w-4" /></Button>
            </div>
        ) : (
             <p 
              className="text-2xl font-bold text-muted-foreground text-center cursor-pointer"
              onClick={() => setIsEditing(true)}
             >
              {currentStock.toLocaleString()} <span className="text-lg">/ {totalStock.toLocaleString()} {item.unit}</span>
            </p>
        )}
         {isLow && !isEditing && (
            <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Low stock! Below {threshold}%.</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
