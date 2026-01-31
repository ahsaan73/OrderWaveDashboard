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
  role?: 'manager' | 'cashier' | 'waiter';
};

export type Order = FirebaseDocument & {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number, price: number }[];
  status: 'Waiting' | 'Cooking' | 'Done';
  total: number;
  time: string;
  createdAt: number; // Unix timestamp in milliseconds
  tableId?: string;
};

export type MenuItemCategory = 'Burgers' | 'Sides' | 'Wraps' | 'Pizzas' | 'Drinks';

export type MenuItem = FirebaseDocument & {
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  isAvailable: boolean;
  category: MenuItemCategory;
};

export type StockItem = FirebaseDocument & {
  name: string;
  stockLevel: number; // Percentage from 0 to 100
  threshold: number; // Percentage below which it is considered low
};

export type Table = FirebaseDocument & {
  name: string;
  status: 'Empty' | 'Seated' | 'Eating' | 'Needs Bill';
  guests: number;
  orderId?: string;
  shape: 'square' | 'circle';
};
