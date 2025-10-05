import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4780 },
  { month: 'May', sales: 5890 },
  { month: 'Jun', sales: 4390 },
  { month: 'Jul', sales: 6490 },
  { month: 'Aug', sales: 7000 },
  { month: 'Sep', sales: 6000 },
  { month: 'Oct', sales: 7200 },
  { month: 'Nov', sales: 8000 },
  { month: 'Dec', sales: 9000 },
];

const topProducts = [
  { name: 'Cement', value: 400 },
  { name: 'Drill', value: 300 },
  { name: 'Ladder', value: 300 },
  { name: 'Scaffolding', value: 200 },
  { name: 'Wacker', value: 100 },
];
const COLORS = ['#2563eb', '#f59e42', '#059669', '#dc2626', '#a21caf'];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 17000 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 19000 },
  { month: 'Jul', revenue: 23000 },
  { month: 'Aug', revenue: 25000 },
  { month: 'Sep', revenue: 22000 },
  { month: 'Oct', revenue: 27000 },
  { month: 'Nov', revenue: 30000 },
  { month: 'Dec', revenue: 32000 },
];

const DashboardCharts = () => (
  <div className="dashboard-charts">
    <div className="chart-card">
      <div className="chart-title">Monthly Sales</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-card">
      <div className="chart-title">Top-Selling Products</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={topProducts}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            label
          >
            {topProducts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-card">
      <div className="chart-title">Revenue Growth</div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default DashboardCharts;
