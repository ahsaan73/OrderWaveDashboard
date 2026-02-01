'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EditableStockCard } from '@/components/editable-stock-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, updateDoc, addDoc, deleteDoc, getDoc, runTransaction } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { StockItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddEditStockModal } from '@/components/add-edit-stock-modal';
import { AddStockModal } from '@/components/add-stock-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

export default function StockPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    if (!userLoading && !isManager) {
      router.replace('/');
    }
  }, [user, userLoading, router, isManager]);

  const stockQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'stockItems');
  }, [firestore]);

  const { data: stockItems, isLoading: dataLoading } = useCollection<StockItem>(stockQuery);

  const handleManualStockUpdate = async (item: StockItem, newCurrentStock: number) => {
    if (!firestore || !user || !isManager) return;
    const itemRef = doc(firestore, 'stockItems', item.id);
    try {
      const change = newCurrentStock - item.currentStock;
      await updateDoc(itemRef, { currentStock: newCurrentStock });
      
      const logCollection = collection(firestore, 'inventoryLogs');
      await addDoc(logCollection, {
          itemId: item.id,
          itemName: item.name,
          userId: user.uid,
          userName: user.displayName || 'N/A',
          change,
          oldStockLevel: item.currentStock,
          newStockLevel: newCurrentStock,
          reason: 'Correction',
          timestamp: Date.now(),
      });

      toast({ title: 'Success', description: 'Stock level corrected and logged.' });
    } catch (error) {
      console.error('Error updating stock level', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update stock level.'});
    }
  };

  const handleAddStock = async (itemId: string, quantityToAdd: number) => {
    if (!firestore || !user || !isManager) return;
    const itemRef = doc(firestore, "stockItems", itemId);

    try {
        const newStockLevel = await runTransaction(firestore, async (transaction) => {
            const itemDoc = await transaction.get(itemRef);
            if (!itemDoc.exists()) {
                throw "Document does not exist!";
            }
            const oldStock = itemDoc.data().currentStock;
            const newStock = oldStock + quantityToAdd;
            
            transaction.update(itemRef, { currentStock: newStock });
            return { newStock, oldStock, itemName: itemDoc.data().name };
        });

        const logCollection = collection(firestore, 'inventoryLogs');
        await addDoc(logCollection, {
            itemId: itemId,
            itemName: newStockLevel.itemName,
            userId: user.uid,
            userName: user.displayName || 'N/A',
            change: quantityToAdd,
            oldStockLevel: newStockLevel.oldStock,
            newStockLevel: newStockLevel.newStock,
            reason: 'Manual Addition',
            timestamp: Date.now(),
        });
        
        toast({ title: "Success", description: "Stock added successfully and logged." });

    } catch (e) {
        console.error("Transaction failed: ", e);
        toast({ variant: "destructive", title: "Error", description: "Could not add stock."});
    }
  };

  const handleSaveIngredient = async (itemData: Omit<StockItem, 'id' | 'ref'>, id?: string) => {
    if (!firestore || !isManager) return;
    try {
      if (id) {
        const itemRef = doc(firestore, 'stockItems', id);
        await updateDoc(itemRef, itemData);
        toast({ title: 'Success', description: 'Ingredient updated.' });
      } else {
        await addDoc(collection(firestore, 'stockItems'), itemData);
        toast({ title: 'Success', description: 'New ingredient added.' });
      }
      setIsManageModalOpen(false);
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save ingredient.' });
    }
  };
  
  const handleDeleteItem = async () => {
    if (!firestore || !selectedItem || !isManager) return;
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

  const handleOpenManageModal = (item?: StockItem) => {
    setSelectedItem(item || null);
    setIsManageModalOpen(true);
  };

  const handleOpenDeleteAlert = (item: StockItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };

  
  const isLoading = userLoading || dataLoading;

  if (isLoading || !isManager) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Manage Stock
            </h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, delete, and update the stock levels for your restaurant's ingredients.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={() => handleOpenManageModal()} size="lg">
              <Plus className="mr-2" /> Manage Ingredients
            </Button>
            <Button onClick={() => setIsAddStockModalOpen(true)} size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="mr-2" /> Add Stock
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && Array.from({length: 8}).map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"/>)}
          {stockItems?.map(item => (
            <EditableStockCard 
                key={item.id} 
                item={item} 
                onUpdate={handleManualStockUpdate} 
                onEdit={() => handleOpenManageModal(item)}
                onDelete={() => handleOpenDeleteAlert(item)}
            />
          ))}
        </div>
      </div>

      <AddStockModal
        isOpen={isAddStockModalOpen}
        setIsOpen={setIsAddStockModalOpen}
        stockItems={stockItems || []}
        onAddStock={handleAddStock}
      />
      
      <AddEditStockModal
        isOpen={isManageModalOpen}
        setIsOpen={setIsManageModalOpen}
        item={selectedItem}
        onSave={handleSaveIngredient}
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
