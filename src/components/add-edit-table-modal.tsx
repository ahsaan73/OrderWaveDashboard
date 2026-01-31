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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddEditTableModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (data: { name: string; shape: 'square' | 'circle' }) => void;
}

const tableSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shape: z.enum(['square', 'circle']),
});

type TableFormData = z.infer<typeof tableSchema>;

export function AddEditTableModal({ isOpen, setIsOpen, onSave }: AddEditTableModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: '',
      shape: 'square',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        shape: 'square',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: TableFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Enter the details for the new table.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className="w-full" placeholder="e.g., Table 11" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shape" className="text-right">
                Shape
              </Label>
              <Controller
                control={control}
                name="shape"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shape && <p className="col-start-2 col-span-3 text-destructive text-xs mt-1">{errors.shape.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
