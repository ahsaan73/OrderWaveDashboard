'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MenuItemCard } from '@/components/menu-item-card';
import { AddEditMenuModal } from '@/components/add-edit-menu-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { menuItems as initialMenuItems, type MenuItem } from '@/lib/data';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleToggleAvailability = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (item: MenuItem) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(items => items.map(i => (i.id === item.id ? item : i)));
    } else {
      // Add new item
      const newItem = { ...item, id: `item-${Date.now()}` };
      setMenuItems(items => [...items, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Edit Menu
          </h1>
          <Button onClick={handleOpenAddModal} size="lg">
            <Plus className="mr-2" /> Add Food Item
          </Button>
        </div>
        <p className="text-muted-foreground">
          Here you can add, edit, and manage your menu items. Drag and drop to re-order.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menuItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggleAvailability={handleToggleAvailability}
              onEdit={() => handleOpenEditModal(item)}
            />
          ))}
        </div>
      </div>
      <AddEditMenuModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        item={editingItem}
        onSave={handleSaveItem}
      />
    </DashboardLayout>
  );
}
