import { PlaceHolderImages } from './placeholder-images';

const imageMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));

export const menuItems: Omit<import('./types').MenuItem, 'id'>[] = [
  {
    name: 'Zesty Burger',
    price: 950,
    imageUrl: imageMap.get('zesty-burger') || 'https://picsum.photos/seed/zesty-burger/400/400',
    imageHint: 'burger fries',
    isAvailable: true,
    category: 'Burgers',
  },
  {
    name: 'Crispy Fries',
    price: 350,
    imageUrl: imageMap.get('crispy-fries') || 'https://picsum.photos/seed/crispy-fries/400/400',
    imageHint: 'fries potato',
    isAvailable: true,
    category: 'Sides',
  },
  {
    name: 'Spicy Chicken Wrap',
    price: 750,
    imageUrl: imageMap.get('chicken-wrap') || 'https://picsum.photos/seed/chicken-wrap/400/400',
    imageHint: 'wrap chicken',
    isAvailable: true,
    category: 'Wraps',
  },
  {
    name: 'Veggie Delight Pizza',
    price: 1400,
    imageUrl: imageMap.get('veggie-pizza') || 'https://picsum.photos/seed/veggie-pizza/400/400',
    imageHint: 'pizza vegetable',
    isAvailable: false,
    category: 'Pizzas',
  },
  {
    name: 'Onion Rings',
    price: 450,
    imageUrl: imageMap.get('onion-rings') || 'https://picsum.photos/seed/onion-rings/400/400',
    imageHint: 'onion rings',
    isAvailable: true,
    category: 'Sides',
  },
  {
    name: 'Classic Milkshake',
    price: 550,
    imageUrl: imageMap.get('milkshake') || 'https://picsum.photos/seed/milkshake/400/400',
    imageHint: 'milkshake dessert',
    isAvailable: true,
    category: 'Drinks',
  },
];

export const stockItems: Omit<import('./types').StockItem, 'id'>[] = [
    { name: 'Tomatoes', stockLevel: 80, threshold: 20 },
    { name: 'Flour', stockLevel: 40, threshold: 20 },
    { name: 'Cheese', stockLevel: 15, threshold: 20 },
    { name: 'Chicken Patties', stockLevel: 95, threshold: 25 },
    { name: 'Burger Buns', stockLevel: 50, threshold: 25 },
    { name: 'Lettuce', stockLevel: 10, threshold: 25 },
    { name: 'Onions', stockLevel: 60, threshold: 20 },
    { name: 'Potatoes', stockLevel: 75, threshold: 30 },
];

export const tables: Omit<import('./types').Table, 'id'>[] = [
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
