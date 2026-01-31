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
import type { MenuItem, MenuItemCategory } from '@/lib/types';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddEditMenuModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: MenuItem | null;
  onSave: (item: Omit<MenuItem, 'id'>, id?: string) => void;
}

const menuItemCategories: readonly [MenuItemCategory, ...MenuItemCategory[]] = ['Burgers', 'Sides', 'Wraps', 'Pizzas', 'Drinks'];

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be positive')
  ),
  imageUrl: z.string().url('Must be a valid image URL'),
  imageHint: z.string().optional(),
  category: z.enum(menuItemCategories),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export function AddEditMenuModal({ isOpen, setIsOpen, item, onSave }: AddEditMenuModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
        if (item) {
          reset({
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            category: item.category
          });
        } else {
          reset({
            name: '',
            price: 0,
            imageUrl: 'https://picsum.photos/seed/newitem/400/400',
            imageHint: '',
            category: 'Burgers'
          });
        }
    }
  }, [item, reset, isOpen]);

  const onSubmit = (data: MenuItemFormData) => {
    const savedItem = {
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      imageHint: data.imageHint || '',
      category: data.category,
      isAvailable: item?.isAvailable ?? true,
    };
    onSave(savedItem, item?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Food Sticker' : 'Add New Food Sticker'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this food sticker.' : 'Enter the details for the new food sticker.'}
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
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <div className="col-span-3">
                <Input id="price" type="number" step="0.01" {...register('price')} className="w-full" />
                {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                      {menuItemCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  )}
              />
              {errors.category && <p className="col-start-2 col-span-3 text-destructive text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <div className="col-span-3">
                <Input id="imageUrl" {...register('imageUrl')} className="w-full" placeholder="https://picsum.photos/seed/..."/>
                {errors.imageUrl && <p className="text-destructive text-xs mt-1">{errors.imageUrl.message}</p>}
              </div>
            </div>

            {watchedImageUrl && !errors.imageUrl && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3">
                        <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                        <Image src={watchedImageUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover"/>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageHint" className="text-right">
                Image Hint
              </Label>
              <div className="col-span-3">
                <Input id="imageHint" {...register('imageHint')} className="w-full" placeholder="e.g. 'burger cheese'"/>
                <p className="text-xs text-muted-foreground mt-1">Optional. One or two words for AI image search.</p>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
