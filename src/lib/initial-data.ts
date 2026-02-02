import { PlaceHolderImages } from './placeholder-images';
import type { User, MenuItem, StockItem, Table } from './types';


const imageMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));

export const users: Omit<User, 'id' | 'ref'>[] = [
  {
    uid: 'admin-placeholder-uid',
    displayName: 'Admin User',
    email: 'admin@example.com',
    photoURL: 'https://picsum.photos/seed/admin/100/100',
    role: 'admin'
  }
];

export const menuItems: Omit<MenuItem, 'id' | 'ref'>[] = [
  {
    name: 'Spicy Zinger Burger',
    price: 850,
    description: 'A crispy, spicy zinger fillet with fresh lettuce and our secret sauce in a soft bun.',
    imageUrl: imageMap.get('zesty-burger') || 'https://picsum.photos/seed/zesty-burger/400/400',
    imageHint: 'zinger burger',
    isAvailable: true,
    category: 'Burgers',
  },
  {
    name: 'Classic Beef Burger',
    price: 950,
    description: 'A juicy beef patty with cheese, pickles, onions, and classic condiments.',
    imageUrl: 'https://picsum.photos/seed/beef-burger/400/400',
    imageHint: 'beef burger',
    isAvailable: true,
    category: 'Burgers',
  },
    {
    name: 'Grilled Chicken Burger',
    price: 750,
    description: 'Tender grilled chicken breast with fresh veggies and a light mayo.',
    imageUrl: 'https://picsum.photos/seed/chicken-burger/400/400',
    imageHint: 'chicken burger',
    isAvailable: true,
    category: 'Burgers',
  },
  {
    name: 'Masala Fries',
    price: 400,
    description: 'Crispy fries sprinkled with our special blend of desi spices.',
    imageUrl: imageMap.get('crispy-fries') || 'https://picsum.photos/seed/crispy-fries/400/400',
    imageHint: 'masala fries',
    isAvailable: true,
    category: 'Sides',
  },
   {
    name: 'Garlic Bread',
    price: 350,
    description: 'Toasted bread with a generous spread of garlic butter and herbs.',
    imageUrl: 'https://picsum.photos/seed/garlic-bread/400/400',
    imageHint: 'garlic bread',
    isAvailable: true,
    category: 'Sides',
  },
  {
    name: 'Onion Rings',
    price: 350,
    description: 'Golden-fried onion rings served with a tangy dipping sauce.',
    imageUrl: 'https://picsum.photos/seed/onion-rings/400/400',
    imageHint: 'onion rings',
    isAvailable: true,
    category: 'Sides',
  },
  {
    name: 'Chicken Paratha Roll',
    price: 650,
    description: 'Succulent chicken chunks wrapped in a flaky paratha with mint chutney.',
    imageUrl: imageMap.get('chicken-wrap') || 'https://picsum.photos/seed/chicken-wrap/400/400',
    imageHint: 'paratha roll',
    isAvailable: true,
    category: 'Wraps',
  },
    {
    name: 'Beef Kebab Roll',
    price: 700,
    description: 'Spicy seekh kebabs rolled in a soft paratha with onions and imli sauce.',
    imageUrl: 'https://picsum.photos/seed/beef-roll/400/400',
    imageHint: 'kebab roll',
    isAvailable: true,
    category: 'Wraps',
  },
  {
    name: 'Chicken Tikka Pizza',
    price: 1500,
    description: 'A classic pizza topped with spicy chicken tikka, onions, and lots of cheese.',
    imageUrl: imageMap.get('veggie-pizza') || 'https://picsum.photos/seed/veggie-pizza/400/400',
    imageHint: 'tikka pizza',
    isAvailable: true,
    category: 'Pizzas',
  },
  {
    name: 'Fajita Pizza',
    price: 1600,
    description: 'A flavorful pizza with fajita-seasoned chicken, bell peppers, and onions.',
    imageUrl: 'https://picsum.photos/seed/fajita-pizza/400/400',
    imageHint: 'fajita pizza',
    isAvailable: true,
    category: 'Pizzas',
  },
    {
    name: 'Veggie Supreme Pizza',
    price: 1400,
    description: 'Loaded with fresh vegetables like bell peppers, olives, mushrooms, and sweet corn.',
    imageUrl: 'https://picsum.photos/seed/veggie-supreme-pizza/400/400',
    imageHint: 'veggie pizza',
    isAvailable: true,
    category: 'Pizzas',
  },
  {
    name: 'Creamy Chicken Pasta',
    price: 1200,
    description: 'Penne pasta in a rich and creamy white sauce with grilled chicken.',
    imageUrl: 'https://picsum.photos/seed/chicken-pasta/400/400',
    imageHint: 'chicken pasta',
    isAvailable: true,
    category: 'Pasta',
  },
    {
    name: 'Spicy Fettuccine',
    price: 1250,
    description: 'Fettuccine pasta tossed in a spicy tomato sauce with a hint of red chili flakes.',
    imageUrl: 'https://picsum.photos/seed/spicy-pasta/400/400',
    imageHint: 'spicy pasta',
    isAvailable: true,
    category: 'Pasta',
  },
  {
    name: 'Mango Lassi',
    price: 450,
    description: 'A sweet and refreshing yogurt-based mango smoothie.',
    imageUrl: imageMap.get('milkshake') || 'https://picsum.photos/seed/milkshake/400/400',
    imageHint: 'mango lassi',
    isAvailable: true,
    category: 'Drinks',
  },
  {
    name: 'Coke',
    price: 150,
    description: 'An ice-cold can of Coca-Cola.',
    imageUrl: 'https://picsum.photos/seed/coke-can/400/400',
    imageHint: 'soda can',
    isAvailable: true,
    category: 'Drinks',
  },
  {
    name: 'Mineral Water',
    price: 100,
    description: 'A bottle of pure and refreshing mineral water.',
    imageUrl: 'https://picsum.photos/seed/water-bottle/400/400',
    imageHint: 'water bottle',
    isAvailable: true,
    category: 'Drinks',
  },
];


export const stockItems: Omit<StockItem, 'id' | 'ref'>[] = [
    { name: 'Tomatoes', currentStock: 8000, totalStock: 10000, unit: 'g', threshold: 20 },
    { name: 'Pizza Dough', currentStock: 20000, totalStock: 50000, unit: 'g', threshold: 20 },
    { name: 'Cheese', currentStock: 4000, totalStock: 20000, unit: 'g', threshold: 20 },
    { name: 'Chicken Patties', currentStock: 95, totalStock: 100, unit: 'pcs', threshold: 25 },
    { name: 'Burger Buns', currentStock: 50, totalStock: 100, unit: 'pcs', threshold: 25 },
    { name: 'Lettuce', currentStock: 1000, totalStock: 5000, unit: 'g', threshold: 25 },
    { name: 'Onions', currentStock: 6000, totalStock: 10000, unit: 'g', threshold: 20 },
    { name: 'Potatoes', currentStock: 15000, totalStock: 20000, unit: 'g', threshold: 30 },
    { name: 'Cooking Oil', currentStock: 2000, totalStock: 10000, unit: 'ml', threshold: 15 },
    { name: 'Mayonnaise', currentStock: 3000, totalStock: 5000, unit: 'g', threshold: 20 },
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
