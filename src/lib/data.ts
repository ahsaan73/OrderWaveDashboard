import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));

export type Order = {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  status: 'Waiting' | 'Cooking' | 'Done';
  total: number;
  time: string;
  createdAt: number; // Unix timestamp in milliseconds
};

export const stats = {
  moneyMadeToday: 4850.75,
  totalOrders: 124,
};

const now = Date.now();

export const orders: Order[] = [
  {
    id: '#83412',
    customerName: 'Alice Johnson',
    items: [
      { name: 'Zesty Burger', quantity: 1 },
      { name: 'Crispy Fries', quantity: 1 },
    ],
    status: 'Done',
    total: 15.99,
    time: '12:45 PM',
    createdAt: now - 10 * 60 * 1000, // 10 minutes ago
  },
  {
    id: '#83411',
    customerName: 'Bob Williams',
    items: [
      { name: 'Spicy Chicken Wrap', quantity: 2 },
      { name: 'Lemonade', quantity: 2 },
    ],
    status: 'Cooking',
    total: 22.5,
    time: '12:43 PM',
    createdAt: now - 8 * 60 * 1000, // 8 minutes ago
  },
  {
    id: '#83410',
    customerName: 'Charlie Brown',
    items: [{ name: 'Veggie Delight Pizza', quantity: 1 }],
    status: 'Waiting',
    total: 18.0,
    time: '12:42 PM',
    createdAt: now - 6 * 60 * 1000, // 6 minutes ago. This will be overdue.
  },
  {
    id: '#83409',
    customerName: 'Diana Prince',
    items: [
      { name: 'Zesty Burger', quantity: 1 },
      { name: 'Onion Rings', quantity: 1 },
      { name: 'Milkshake', quantity: 1 },
    ],
    status: 'Done',
    total: 20.75,
    time: '12:40 PM',
    createdAt: now - 15 * 60 * 1000, // 15 mins ago
  },
  {
    id: '#83408',
    customerName: 'Ethan Hunt',
    items: [{ name: 'Spicy Chicken Wrap', quantity: 1 }],
    status: 'Cooking',
    total: 9.5,
    time: '12:38 PM',
    createdAt: now - 2 * 60 * 1000, // 2 minutes ago
  },
    {
    id: '#83407',
    customerName: 'Fiona Glenanne',
    items: [
        { name: 'Veggie Delight Pizza', quantity: 1 },
        { name: 'Salad', quantity: 1 },
    ],
    status: 'Waiting',
    total: 24.00,
    time: '12:35 PM',
    createdAt: now - 1 * 60 * 1000, // 1 minute ago
  },
];

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  isAvailable: boolean;
};

export const menuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Zesty Burger',
    price: 12.99,
    imageUrl: imageMap.get('zesty-burger') || 'https://picsum.photos/seed/zesty-burger/400/400',
    imageHint: 'burger fries',
    isAvailable: true,
  },
  {
    id: 'item-2',
    name: 'Crispy Fries',
    price: 4.5,
    imageUrl: imageMap.get('crispy-fries') || 'https://picsum.photos/seed/crispy-fries/400/400',
    imageHint: 'fries potato',
    isAvailable: true,
  },
  {
    id: 'item-3',
    name: 'Spicy Chicken Wrap',
    price: 9.5,
    imageUrl: imageMap.get('chicken-wrap') || 'https://picsum.photos/seed/chicken-wrap/400/400',
    imageHint: 'wrap chicken',
    isAvailable: true,
  },
  {
    id: 'item-4',
    name: 'Veggie Delight Pizza',
    price: 18.0,
    imageUrl: imageMap.get('veggie-pizza') || 'https://picsum.photos/seed/veggie-pizza/400/400',
    imageHint: 'pizza vegetable',
    isAvailable: false,
  },
  {
    id: 'item-5',
    name: 'Onion Rings',
    price: 5.75,
    imageUrl: imageMap.get('onion-rings') || 'https://picsum.photos/seed/onion-rings/400/400',
    imageHint: 'onion rings',
    isAvailable: true,
  },
  {
    id: 'item-6',
    name: 'Classic Milkshake',
    price: 6.0,
    imageUrl: imageMap.get('milkshake') || 'https://picsum.photos/seed/milkshake/400/400',
    imageHint: 'milkshake dessert',
    isAvailable: true,
  },
];

export type StockItem = {
  id: string;
  name: string;
  stockLevel: number; // Percentage from 0 to 100
  threshold: number; // Percentage below which it is considered low
};

export const stockItems: StockItem[] = [
    { id: 'stock-1', name: 'Tomatoes', stockLevel: 80, threshold: 20 },
    { id: 'stock-2', name: 'Flour', stockLevel: 40, threshold: 20 },
    { id: 'stock-3', name: 'Cheese', stockLevel: 15, threshold: 20 },
    { id: 'stock-4', name: 'Chicken Patties', stockLevel: 95, threshold: 25 },
    { id: 'stock-5', name: 'Burger Buns', stockLevel: 50, threshold: 25 },
    { id: 'stock-6', name: 'Lettuce', stockLevel: 10, threshold: 25 },
    { id: 'stock-7', name: 'Onions', stockLevel: 60, threshold: 20 },
    { id: 'stock-8', name: 'Potatoes', stockLevel: 75, threshold: 30 },
];
