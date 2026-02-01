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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddStockModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  stockItems: StockItem[];
  onAddStock: (itemId: string, quantity: number) => void;
}

const addStockSchema = z.object({
  itemId: z.string().min(1, 'Please select an ingredient.'),
  quantity: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive('Quantity must be a positive number.')
  ),
});

type AddStockFormData = z.infer<typeof addStockSchema>;

export function AddStockModal({ isOpen, setIsOpen, stockItems, onAddStock }: AddStockModalProps) {
  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
    watch,
  } = useForm<AddStockFormData>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      itemId: '',
      quantity: 0
    }
  });
  
  const selectedItemId = watch('itemId');
  const selectedItem = stockItems.find(item => item.id === selectedItemId);

  useEffect(() => {
    if (isOpen) {
      reset({ itemId: undefined, quantity: undefined });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: AddStockFormData) => {
    onAddStock(data.itemId, data.quantity);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Quantity</DialogTitle>
          <DialogDescription>
            Select an ingredient and enter the quantity to add to the current stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemId" className="text-right">
                Ingredient
              </Label>
              <Controller
                  control={control}
                  name="itemId"
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                      {stockItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  )}
              />
              {errors.itemId && <p className="col-start-2 col-span-3 text-destructive text-xs mt-1">{errors.itemId.message}</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input id="quantity" type="number" {...field} onChange={event => field.onChange(event.target.value)} className="w-full" placeholder="e.g., 2000" />
                  )}
                />
                <span className="text-muted-foreground font-semibold w-8">{selectedItem?.unit}</span>
              </div>
               {errors.quantity && <p className="col-start-2 col-span-3 text-destructive text-xs mt-1">{errors.quantity.message}</p>}
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add to Stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
