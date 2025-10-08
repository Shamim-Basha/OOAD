// Simple mock data generator for user activity / orders
const sampleProducts = [
  { productId: 101, name: 'Electric Drill', unitPrice: 4500 },
  { productId: 102, name: 'Concrete Mixer', unitPrice: 25000 },
  { productId: 103, name: 'Adjustable Wrench', unitPrice: 1200 },
  { productId: 104, name: 'Scaffold Set', unitPrice: 18000 },
];

function formatDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export default function mockActivityForUser(userId) {
  // produce 3 sample orders with varied items
  const orders = [
    {
      id: `ORD-${userId}-1`,
      createdAt: formatDate(4),
      total: 4500,
      items: [ { productId: 101, name: 'Electric Drill', quantity: 1, price: 4500 } ]
    },
    {
      id: `ORD-${userId}-2`,
      createdAt: formatDate(30),
      total: 26200,
      items: [ { productId: 102, name: 'Concrete Mixer', quantity: 1, price: 25000 }, { productId: 103, name: 'Adjustable Wrench', quantity: 1, price: 1200 } ]
    },
    {
      id: `ORD-${userId}-3`,
      createdAt: formatDate(90),
      total: 18000,
      items: [ { productId: 104, name: 'Scaffold Set', quantity: 1, price: 18000 } ]
    }
  ];

  const totalProducts = orders.reduce((acc,o) => acc + (o.items ? o.items.reduce((s,i)=>s + (i.quantity||1),0) : 0), 0);
  const totalAmount = orders.reduce((acc,o) => acc + (o.total || 0), 0);

  const activity = [
    { timestamp: formatDate(2), action: 'Logged in' },
    { timestamp: formatDate(4), action: 'Placed an order' },
    { timestamp: formatDate(30), action: 'Left a review' }
  ];

  return {
    orders,
    totalProducts,
    totalAmount,
    recentOrdersCount: Math.min(5, orders.length),
    activity
  };
}
