export type Order = {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  status: 'Waiting' | 'Cooking' | 'Done';
  total: number;
  time: string;
};

export const stats = {
  moneyMadeToday: 4850.75,
  totalOrders: 124,
};

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
  },
  {
    id: '#83410',
    customerName: 'Charlie Brown',
    items: [{ name: 'Veggie Delight Pizza', quantity: 1 }],
    status: 'Waiting',
    total: 18.0,
    time: '12:42 PM',
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
  },
  {
    id: '#83408',
    customerName: 'Ethan Hunt',
    items: [{ name: 'Spicy Chicken Wrap', quantity: 1 }],
    status: 'Cooking',
    total: 9.5,
    time: '12:38 PM',
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
  },
];
