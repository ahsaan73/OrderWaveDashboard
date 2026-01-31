'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StockItem } from '@/lib/types';
import { Slider } from './ui/slider';

interface AddEditStockModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: StockItem | null;
  onSave: (item: Omit<StockItem, 'id' | 'ref'>, id?: string) => void;
}

const stockItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stockLevel: z.number().min(0).max(100),
  threshold: z.number().min(0).max(100),
});

type StockItemFormData = z.infer<typeof stockItemSchema>;

export function AddEditStockModal({ isOpen, setIsOpen, item, onSave }: AddEditStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control,
    setValue
  } = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: '',
      stockLevel: 50,
      threshold: 20
    }
  });
  
  const watchedStockLevel = watch("stockLevel");
  const watchedThreshold = watch("threshold");

  useEffect(() => {
    if (isOpen) {
        if (item) {
          reset({
            name: item.name,
            stockLevel: item.stockLevel,
            threshold: item.threshold,
          });
        } else {
          reset({
            name: '',
            stockLevel: 50,
            threshold: 20,
          });
        }
    }
  }, [item, reset, isOpen]);

  const onSubmit = (data: StockItemFormData) => {
    onSave(data, item?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this ingredient.' : 'Enter the details for the new ingredient.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className="w-full" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="stockLevel" className="text-right pt-2">
                Stock
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                    <Slider
                        id="stockLevel"
                        min={0}
                        max={100}
                        step={1}
                        value={[watchedStockLevel]}
                        onValueChange={(value) => setValue('stockLevel', value[0])}
                    />
                    <span className="font-bold text-lg tabular-nums w-12 text-center">{watchedStockLevel}%</span>
                </div>
                 {errors.stockLevel && <p className="text-destructive text-xs mt-1">{errors.stockLevel.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="threshold" className="text-right pt-2">
                Threshold
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                    <Slider
                        id="threshold"
                        min={0}
                        max={100}
                        step={1}
                        value={[watchedThreshold]}
                        onValueChange={(value) => setValue('threshold', value[0])}
                    />
                    <span className="font-bold text-lg tabular-nums w-12 text-center text-destructive">{watchedThreshold}%</span>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">The "danger zone" number for reordering.</p>
                 {errors.threshold && <p className="text-destructive text-xs mt-1">{errors.threshold.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
