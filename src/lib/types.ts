import type { DocumentData, DocumentReference, Timestamp } from 'firebase/firestore';

export interface FirebaseDocument {
    id: string;
    ref?: DocumentReference<DocumentData>;
}

export type User = FirebaseDocument & {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'manager' | 'cashier' | 'waiter' | 'admin' | 'kitchen';
};

export type Order = FirebaseDocument & {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number, price: number }[];
  status: 'Waiting' | 'Cooking' | 'Done';
  total: number;
  time: string;
  createdAt: number; // Unix timestamp in milliseconds
  cookingStartedAt?: number; // Unix timestamp in milliseconds
  tableId?: string;
  paymentMethod?: 'Cash' | 'Card';
  orderType: 'Pickup' | 'Delivery' | 'Dine-in';
  address?: string;
  phoneNumber?: string;
};

export type MenuItemCategory = 'Burgers' | 'Sides' | 'Wraps' | 'Pizzas' | 'Drinks' | 'Pasta';

export type MenuItem = FirebaseDocument & {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  isAvailable: boolean;
  category: MenuItemCategory;
};

export type StockItem = FirebaseDocument & {
  name: string;
  currentStock: number;
  totalStock: number;
  unit: 'g' | 'ml' | 'pcs';
  threshold: number; // Percentage below which it is considered low
};

export type InventoryLog = FirebaseDocument & {
    itemId: string;
    itemName: string;
    userId: string;
    userName: string;
    change: number;
    oldStockLevel: number;
    newStockLevel: number;
    reason: 'Manual Addition' | 'Order Fulfillment' | 'Correction';
    timestamp: number;
};

export type Table = FirebaseDocument & {
  name: string;
  status: 'Empty' | 'Seated' | 'Eating' | 'Needs Bill';
  guests: number;
  orderId?: string;
  shape: 'square' | 'circle';
};
