'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EditableStockCard } from '@/components/editable-stock-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { StockItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddEditStockModal } from '@/components/add-edit-stock-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

export default function StaffPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  useEffect(() => {
    if (!userLoading && !['manager', 'admin'].includes(user?.role || '')) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const stockQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'stockItems');
  }, [firestore]);

  const { data: stock, isLoading: dataLoading } = useCollection<StockItem>(stockQuery);

  const handleStockUpdate = async (item: StockItem, newStockLevel: number) => {
    if (!firestore || !user) return;
    const itemRef = doc(firestore, 'stockItems', item.id);
    try {
      await updateDoc(itemRef, { stockLevel: newStockLevel });
      
      const logCollection = collection(firestore, 'inventoryLogs');
      await addDoc(logCollection, {
          itemId: item.id,
          itemName: item.name,
          userId: user.uid,
          userName: user.displayName || 'N/A',
          oldStockLevel: item.stockLevel,
          newStockLevel: newStockLevel,
          timestamp: Date.now(),
      });

      toast({ title: 'Success', description: 'Stock level updated and logged.' });
    } catch (error) {
      console.error('Error updating stock level', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update stock level.'});
    }
  };

  const handleSaveItem = async (itemData: Omit<StockItem, 'id' | 'ref'>, id?: string) => {
    if (!firestore) return;
    try {
      if (id) {
        const itemRef = doc(firestore, 'stockItems', id);
        await updateDoc(itemRef, itemData);
        toast({ title: 'Success', description: 'Ingredient updated.' });
      } else {
        await addDoc(collection(firestore, 'stockItems'), itemData);
        toast({ title: 'Success', description: 'New ingredient added.' });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save ingredient.' });
    }
  };
  
  const handleDeleteItem = async () => {
    if (!firestore || !selectedItem) return;
    try {
      const itemRef = doc(firestore, 'stockItems', selectedItem.id);
      await deleteDoc(itemRef);
      toast({ title: 'Success', description: `"${selectedItem.name}" was deleted.` });
      setIsAlertOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete ingredient.' });
    }
  }

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteAlert = (item: StockItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };

  
  const isLoading = userLoading || dataLoading;

  if (userLoading || !user || !['manager', 'admin'].includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Manage Ingredients
            </h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, delete, and update the stock levels for your restaurant's ingredients.
            </p>
          </div>
          <Button onClick={handleOpenAddModal} size="lg" className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" /> Add New Ingredient
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && Array.from({length: 8}).map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"/>)}
          {stock?.map(item => (
            <EditableStockCard 
                key={item.id} 
                item={item} 
                onUpdate={handleStockUpdate} 
                onEdit={() => handleOpenEditModal(item)}
                onDelete={() => handleOpenDeleteAlert(item)}
            />
          ))}
        </div>
      </div>
      <AddEditStockModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        item={selectedItem}
        onSave={handleSaveItem}
      />
       <DeleteConfirmationModal
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={handleDeleteItem}
        itemName={selectedItem?.name || 'the selected item'}
      />
    </DashboardLayout>
  );
}