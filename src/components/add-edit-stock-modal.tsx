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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StockItem } from '@/lib/types';
import { Slider } from './ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface AddEditStockModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: StockItem | null;
  onSave: (item: Omit<StockItem, 'id' | 'ref'>, id?: string) => void;
}

const stockItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currentStock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0, 'Stock cannot be negative.')
  ),
  totalStock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive('Total stock must be positive.')
  ),
  unit: z.enum(['g', 'ml', 'pcs', 'kg']),
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
      threshold: 20,
    }
  });
  
  const watchedThreshold = watch("threshold");

  useEffect(() => {
    if (isOpen) {
        if (item) {
          reset({
            name: item.name,
            currentStock: item.currentStock,
            totalStock: item.totalStock,
            unit: item.unit,
            threshold: item.threshold,
          });
        } else {
          reset({
            name: '',
            currentStock: 0,
            totalStock: undefined,
            unit: 'g',
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className="w-full" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock" className="text-right">
                Current Qty
              </Label>
              <div className="col-span-3">
                <Input id="currentStock" type="number" {...register('currentStock')} className="w-full" />
                {errors.currentStock && <p className="text-destructive text-xs mt-1">{errors.currentStock.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalStock" className="text-right">
                Total Qty
              </Label>
              <div className="col-span-3">
                <Input id="totalStock" type="number" {...register('totalStock')} className="w-full" />
                {errors.totalStock && <p className="text-destructive text-xs mt-1">{errors.totalStock.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      </SelectContent>
                  </Select>
                  )}
              />
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
                 <p className="text-xs text-muted-foreground mt-1">The "danger zone" percentage for reordering.</p>
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
