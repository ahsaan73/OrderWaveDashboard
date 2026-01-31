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
  const [editedLevel, setEditedLevel] = useState(item.stockLevel);

  const isLow = item.stockLevel < item.threshold;

  let progressColorClass = '[&>div]:bg-chart-2'; // green
  if (item.stockLevel < 50 && item.stockLevel >= item.threshold) {
    progressColorClass = '[&>div]:bg-chart-4'; // yellow
  }
  if (isLow) {
    progressColorClass = '[&>div]:bg-destructive'; // red
  }

  const handleSave = () => {
    let newLevel = editedLevel;
    if (newLevel > 100) newLevel = 100;
    if (newLevel < 0) newLevel = 0;
    onUpdate(item, newLevel);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedLevel(item.stockLevel);
    setIsEditing(false);
  }

  return (
    <Card className={cn("transition-all hover:shadow-md flex flex-col", isLow && !isEditing && "border-destructive/50 bg-destructive/5")}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">
          {item.name}
        </CardTitle>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="flex items-center gap-4">
          <Progress 
            value={item.stockLevel} 
            className={cn(progressColorClass, "transition-all")}
          />
          {isEditing ? (
            <div className="flex items-center gap-2">
                <Input 
                    type="number"
                    value={editedLevel}
                    onChange={(e) => setEditedLevel(parseInt(e.target.value, 10) || 0)}
                    className="w-20 h-9"
                    max={100}
                    min={0}
                />
                <Button size="icon" className="h-9 w-9 bg-green-500 hover:bg-green-600" onClick={handleSave}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancel}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <span 
              className={cn("font-bold text-lg tabular-nums cursor-pointer", isLow && "text-destructive")}
              onClick={() => setIsEditing(true)}
            >
              {item.stockLevel}%
            </span>
          )}
        </div>
         {isLow && !isEditing && (
            <div className="flex items-center gap-2 text-destructive mt-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Low stock! Below {item.threshold}%.</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
