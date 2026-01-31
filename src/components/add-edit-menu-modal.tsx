'use client';

import { useEffect, useState } from 'react';
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
import type { MenuItem } from '@/lib/data';
import Image from 'next/image';

interface AddEditMenuModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: MenuItem | null;
  onSave: (item: MenuItem) => void;
}

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be positive')
  ),
  imageUrl: z.string().url('Must be a valid image URL'),
  imageHint: z.string().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export function AddEditMenuModal({ isOpen, setIsOpen, item, onSave }: AddEditMenuModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
  });

  const watchedImageUrl = watch("imageUrl");

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        imageHint: item.imageHint
      });
    } else {
      reset({
        name: '',
        price: 0,
        imageUrl: '',
        imageHint: ''
      });
    }
  }, [item, reset, isOpen]);

  const onSubmit = (data: MenuItemFormData) => {
    const savedItem: MenuItem = {
      ...item,
      id: item?.id || `new-${Date.now()}`,
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl,
      imageHint: data.imageHint || '',
      isAvailable: item?.isAvailable ?? true,
    };
    onSave(savedItem);
  };

  // I can't handle file uploads directly, so I'll ask for an image URL.
  // This is a reasonable simplification.
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this menu item.' : 'Enter the details for the new menu item.'}
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
