import { PlaceHolderImages } from './placeholder-images';
import type { User, MenuItem, StockItem, Table } from './types';


const imageMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));

export const users: Omit<User, 'id' | 'ref'>[] = [
  {
    uid: 'demoadmin',
    displayName: 'Demo Admin',
    email: 'admin@example.com',
    photoURL: 'https://picsum.photos/seed/demoadmin/100/100',
    role: 'admin'
  },
  {
    uid: 'demomanager',
    displayName: 'Demo Manager',
    email: 'demo@example.com',
    photoURL: 'https://picsum.photos/seed/demouser/100/100',
    role: 'manager'
  },
  {
    uid: 'cashier-1',
    displayName: 'Ayesha Khan',
    email: 'ayesha.k@example.com',
    photoURL: 'https://picsum.photos/seed/ayesha/100/100',
    role: 'cashier'
  },
  {
    uid: 'waiter-1',
    displayName: 'Bilal Ahmed',
    email: 'bilal.a@example.com',
    photoURL: 'https://picsum.photos/seed/bilal/100/100',
    role: 'waiter'
  },
  {
    uid: 'kitchen-1',
    displayName: 'Fatima Ali',
    email: 'fatima.a@example.com',
    photoURL: 'https://picsum.photos/seed/fatima/100/100',
    role: 'kitchen'
  }
];

export const menuItems: Omit<MenuItem, 'id' | 'ref'>[] = [
  {
    name: 'Spicy Zinger Burger',
    price: 850,
    imageUrl: imageMap.get('zesty-burger') || 'https://picsum.photos/seed/zesty-burger/400/400',
    imageHint: 'zinger burger',
    isAvailable: true,
    category: 'Burgers',
  },
  {
    name: 'Classic Beef Burger',
    price: 950,
    imageUrl: 'https://picsum.photos/seed/beef-burger/400/400',
    imageHint: 'beef burger',
    isAvailable: true,
    category: 'Burgers',
  },
  {
    name: 'Masala Fries',
    price: 400,
    imageUrl: imageMap.get('crispy-fries') || 'https://picsum.photos/seed/crispy-fries/400/400',
    imageHint: 'masala fries',
    isAvailable: true,
    category: 'Sides',
  },
   {
    name: 'Garlic Bread',
    price: 350,
    imageUrl: 'https://picsum.photos/seed/garlic-bread/400/400',
    imageHint: 'garlic bread',
    isAvailable: true,
    category: 'Sides',
  },
  {
    name: 'Chicken Paratha Roll',
    price: 650,
    imageUrl: imageMap.get('chicken-wrap') || 'https://picsum.photos/seed/chicken-wrap/400/400',
    imageHint: 'paratha roll',
    isAvailable: true,
    category: 'Wraps',
  },
  {
    name: 'Chicken Tikka Pizza',
    price: 1500,
    imageUrl: imageMap.get('veggie-pizza') || 'https://picsum.photos/seed/veggie-pizza/400/400',
    imageHint: 'tikka pizza',
    isAvailable: true,
    category: 'Pizzas',
  },
  {
    name: 'Fajita Pizza',
    price: 1600,
    imageUrl: 'https://picsum.photos/seed/fajita-pizza/400/400',
    imageHint: 'fajita pizza',
    isAvailable: true,
    category: 'Pizzas',
  },
  {
    name: 'Creamy Chicken Pasta',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/chicken-pasta/400/400',
    imageHint: 'chicken pasta',
    isAvailable: true,
    category: 'Pasta',
  },
  {
    name: 'Mango Lassi',
    price: 450,
    imageUrl: imageMap.get('milkshake') || 'https://picsum.photos/seed/milkshake/400/400',
    imageHint: 'mango lassi',
    isAvailable: true,
    category: 'Drinks',
  },
];


export const stockItems: Omit<StockItem, 'id' | 'ref'>[] = [
    { name: 'Tomatoes', stockLevel: 80, threshold: 20 },
    { name: 'Flour', stockLevel: 40, threshold: 20 },
    { name: 'Cheese', stockLevel: 15, threshold: 20 },
    { name: 'Chicken Patties', stockLevel: 95, threshold: 25 },
    { name: 'Burger Buns', stockLevel: 50, threshold: 25 },
    { name: 'Lettuce', stockLevel: 10, threshold: 25 },
    { name: 'Onions', stockLevel: 60, threshold: 20 },
    { name: 'Potatoes', stockLevel: 75, threshold: 30 },
];

export const tables: Omit<Table, 'id' | 'ref'>[] = [
  { name: 'Table 1', status: 'Empty', guests: 0, orderId: '', shape: 'square' },
  { name: 'Table 2', status: 'Empty', guests: 0, shape: 'square' },
  { name: 'Table 3', status: 'Empty', guests: 0, shape: 'circle' },
  { name: 'Table 4', status: 'Empty', guests: 0, shape: 'square' },
  { name: 'Table 5', status: 'Empty', guests: 0, shape: 'circle' },
  { name: 'Table 6', status: 'Empty', guests: 0, shape: 'square' },
  { name: 'Table 7', status: 'Empty', guests: 0, shape: 'circle' },
  { name: 'Table 8', status: 'Empty', guests: 0, shape: 'square' },
  { name: 'Patio 1', status: 'Empty', guests: 0, shape: 'square' },
  { name: 'Patio 2', status: 'Empty', guests: 0, shape: 'circle' },
];
