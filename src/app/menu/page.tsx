'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MenuItemCard } from '@/components/menu-item-card';
import { AddEditMenuModal } from '@/components/add-edit-menu-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { collection, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { MenuItem, StockItem, RecipeIngredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';


export default function MenuPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading, authUser } = useUser();
  const router = useRouter();
  const allowedRoles = ['manager', 'admin'];

  useEffect(() => {
    if (!userLoading) {
      if (user && !allowedRoles.includes(user.role || '')) {
        router.replace('/');
      } else if (!user && !authUser) {
        router.replace('/login');
      }
    }
  }, [user, userLoading, authUser, router]);

  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'menuItems');
  }, [firestore]);
  
  const stockItemsQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return collection(firestore, 'stockItems');
  }, [firestore]);

  const { data: menuItems, isLoading: dataLoading } = useCollection<MenuItem>(menuItemsQuery);
  const { data: stockItems, isLoading: stockLoading } = useCollection<StockItem>(stockItemsQuery);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'menuItems', id);
    try {
      await updateDoc(itemRef, { isAvailable: !isAvailable });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update item availability.'})
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (item: Omit<MenuItem, 'id' | 'ref'> & { recipe?: RecipeIngredient[] }, id?: string) => {
    if (!firestore) return;
    const { recipe, ...publicData } = item;
    
    try {
      if (id) {
        // Update existing item
        const itemRef = doc(firestore, 'menuItems', id);
        await updateDoc(itemRef, publicData);
        
        const recipeRef = doc(firestore, 'menuItemRecipes', id);
        if (recipe && recipe.length > 0) {
          await setDoc(recipeRef, { recipe });
        } else {
          // if recipe is empty or undefined, delete the recipe document if it exists
          try {
            await deleteDoc(recipeRef);
          } catch (e) {
             // Ignore error if doc doesn't exist
          }
        }
        toast({ title: 'Success', description: 'Menu item updated.' });
      } else {
        // Add new item
        const newDocRef = await addDoc(collection(firestore, 'menuItems'), publicData);
        if (recipe && recipe.length > 0) {
          const recipeRef = doc(firestore, 'menuItemRecipes', newDocRef.id);
          await setDoc(recipeRef, { recipe });
        }
        toast({ title: 'Success', description: 'New menu item added.' });
      }
      setIsModalOpen(false);
    } catch(error) {
      console.error('Error saving item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save menu item.'});
    }
  };

  const handleOpenDeleteAlert = (item: MenuItem) => {
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!firestore || !itemToDelete) return;
    try {
      const itemRef = doc(firestore, 'menuItems', itemToDelete.id);
      const recipeRef = doc(firestore, 'menuItemRecipes', itemToDelete.id);
      
      await deleteDoc(itemRef);
      // It's possible a recipe doc doesn't exist, so we don't want to fail if it's not there
      try {
        await deleteDoc(recipeRef);
      } catch(e) {
        // Ignore if recipe doc doesn't exist
      }
      
      toast({ title: 'Success', description: `"${itemToDelete.name}" was deleted.` });
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete menu item.' });
    }
  };

  const isLoading = userLoading || dataLoading || stockLoading;

  if (userLoading || !user || !allowedRoles.includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Menu Sticker Book
          </h1>
          <Button onClick={handleOpenAddModal} size="lg">
            <Plus className="mr-2" /> Add New Sticker
          </Button>
        </div>
        <p className="text-muted-foreground">
          Add new food 'stickers' to your menu, set their prices, and arrange them just right.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading && Array.from({length: 4}).map((_, i) => <div key={i} className="bg-muted rounded-lg h-96 animate-pulse" />)}
          {menuItems?.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggleAvailability={() => handleToggleAvailability(item.id, item.isAvailable)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleOpenDeleteAlert(item)}
            />
          ))}
        </div>
      </div>
      <AddEditMenuModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        item={editingItem}
        onSave={handleSaveItem}
        stockItems={stockItems || []}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDeleteItem}
        itemName={itemToDelete?.name || 'the selected item'}
      />
    </DashboardLayout>
  );
}
