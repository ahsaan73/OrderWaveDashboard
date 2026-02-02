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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MenuItem, MenuItemCategory, StockItem } from '@/lib/types';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Trash2 } from 'lucide-react';

interface AddEditMenuModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: MenuItem | null;
  onSave: (item: Omit<MenuItem, 'id' | 'ref'>, id?: string) => void;
  stockItems: StockItem[];
}

const menuItemCategories: readonly [MenuItemCategory, ...MenuItemCategory[]] = ['Burgers', 'Sides', 'Wraps', 'Pizzas', 'Drinks', 'Pasta'];

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be positive')
  ),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required."),
  imageHint: z.string().optional(),
  category: z.enum(menuItemCategories),
  recipe: z.array(z.object({
    stockItemId: z.string().min(1, 'Ingredient is required.'),
    quantity: z.preprocess(
      (val) => parseFloat(String(val)),
      z.number().positive('Quantity must be a positive number.')
    ),
  })).optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export function AddEditMenuModal({ isOpen, setIsOpen, item, onSave, stockItems }: AddEditMenuModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      imageHint: '',
      category: 'Burgers',
      recipe: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipe",
  });

  const [ingredient, setIngredient] = useState('');
  const [quantity, setQuantity] = useState('');

  const watchedImageUrl = watch("imageUrl");
  const watchedCategory = watch('category');
  const watchedRecipe = watch('recipe');

  useEffect(() => {
    if (isOpen) {
        if (item) {
          reset({
            name: item.name,
            price: item.price,
            description: item.description,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            category: item.category,
            recipe: item.recipe || [],
          });
        } else {
          const initialCategory = 'Burgers';
          const seed = initialCategory.toLowerCase().replace(/\s/g, '-');
          const hint = initialCategory.toLowerCase().replace(/s$/, '');
          reset({
            name: '',
            price: undefined,
            description: '',
            imageUrl: `https://picsum.photos/seed/${seed}/400/400`,
            imageHint: hint,
            category: initialCategory,
            recipe: [],
          });
        }
    }
  }, [item, reset, isOpen]);

  // Update image placeholder when category changes for a new item
  useEffect(() => {
    if (isOpen && !item && watchedCategory) {
      const seed = watchedCategory.toLowerCase().replace(/\s/g, '-');
      const hint = watchedCategory.toLowerCase().replace(/s$/, '');
      setValue('imageUrl', `https://picsum.photos/seed/${seed}/400/400`);
      setValue('imageHint', hint);
    }
  }, [watchedCategory, item, setValue, isOpen]);

  const onSubmit = (data: MenuItemFormData) => {
    const savedItem: Omit<MenuItem, 'id' | 'ref'> = {
      name: data.name,
      price: data.price,
      description: data.description || '',
      imageUrl: data.imageUrl,
      imageHint: data.imageHint || '',
      category: data.category,
      isAvailable: item?.isAvailable ?? true,
      recipe: data.recipe,
    };
    onSave(savedItem, item?.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    const qty = parseFloat(quantity);
    if(ingredient && qty > 0) {
        append({ stockItemId: ingredient, quantity: qty });
        setIngredient('');
        setQuantity('');
    }
  }

  const getIngredientName = (stockItemId: string) => {
    return stockItems.find(s => s.id === stockItemId)?.name || 'Unknown';
  }
   const getIngredientUnit = (stockItemId: string) => {
    return stockItems.find(s => s.id === stockItemId)?.unit || '';
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Food Sticker' : 'Add New Food Sticker'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this food sticker.' : 'Enter the details for the new food sticker.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto pr-6 pl-2 -ml-2">
          <div className="grid gap-6 py-4">
            {/* Item Details */}
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
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                    Description
                </Label>
                <div className="col-span-3">
                    <Textarea id="description" {...register('description')} className="w-full" placeholder="A short description of the item..."/>
                    {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
            
            <Tabs defaultValue="url" className="col-span-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Image URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="pt-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">
                            URL
                        </Label>
                        <div className="col-span-3">
                            <Input id="imageUrl" {...register('imageUrl')} className="w-full" placeholder="https://picsum.photos/seed/..."/>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file-upload" className="text-right">
                            File
                        </Label>
                        <div className="col-span-3">
                            <Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            {errors.imageUrl && <p className="col-start-2 col-span-3 text-destructive text-xs -mt-2">{errors.imageUrl.message}</p>}


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

            <Separator className="col-span-4 my-2"/>

            {/* Recipe Section */}
            <div className="col-span-4 grid gap-4">
                 <h3 className="text-lg font-medium">Recipe</h3>
                 <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                        Ingredients
                    </Label>
                    <div className="col-span-3 space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <span className="font-semibold flex-1">{getIngredientName(field.stockItemId)}</span>
                                <span className="w-24">{(field.quantity)} {getIngredientUnit(field.stockItemId)}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="text-destructive h-4 w-4"/></Button>
                            </div>
                        ))}
                         {watchedRecipe?.length === 0 && <p className="text-sm text-muted-foreground">No ingredients added yet.</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-4 items-end gap-4">
                     <Label htmlFor="ingredient" className="text-right">
                        Add Ingredient
                    </Label>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                        <Select value={ingredient} onValueChange={setIngredient}>
                             <SelectTrigger className="col-span-2">
                                <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                            <SelectContent>
                                {stockItems.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-full" type="number"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3">
                         <Button type="button" variant="secondary" onClick={handleAddIngredient}>Add to Recipe</Button>
                    </div>
                 </div>
            </div>
          </div>
        </form>
         <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)}>Save changes</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
