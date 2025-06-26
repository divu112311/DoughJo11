import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  PieChart, 
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { User, DashboardData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsePieChart, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('luxefi-token');
      const response = await fetch('http://localhost:3001/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#2A6F68] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  // Process data for charts
  const spendingByCategory = dashboardData.recentTransactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(spendingByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const monthlyData = dashboardData.recentTransactions
    .reduce((acc, t) => {
      const month = format(parseISO(t.date), 'MMM');
      if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
      if (t.amount > 0) {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, any>);

  const chartData = Object.values(monthlyData);

  const COLORS = ['#2A6F68', '#B76E79', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-serif font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-white/90 mb-4">
          Here's your financial overview for today
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
            <Award className="h-4 w-4" />
            <span className="text-sm">Level {user?.level}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
            <span className="text-sm">{user?.xp} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#2A6F68]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-[#2A6F68]" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            ${parseFloat(dashboardData.totalBalance).toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Net Worth</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#B76E79]/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-[#B76E79]" />
            </div>
            <ArrowDownRight className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            ${parseFloat(dashboardData.monthlySpending).toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Monthly Spending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            {dashboardData.goals.length}
          </h3>
          <p className="text-sm text-gray-600">Active Goals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            {dashboardData.accounts.length}
          </h3>
          <p className="text-sm text-gray-600">Connected Accounts</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Bar dataKey="income" fill="#2A6F68" radius={4} />
                <Bar dataKey="expenses" fill="#B76E79" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsePieChart>
                <pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </pie>
              </RechartsePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Goals and Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Financial Goals</h3>
          <div className="space-y-4">
            {dashboardData.goals.map((goal, index) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-[#333333]">{goal.title}</h4>
                    <span className="text-sm text-gray-600">
                      ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="bg-[#2A6F68] h-2 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% complete</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Account Balances</h3>
          <div className="space-y-4">
            {dashboardData.accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-[#333333]">{account.account_name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{account.account_type}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(account.balance).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {dashboardData.recentTransactions.slice(0, 8).map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-[#333333]">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.category} • {format(parseISO(transaction.date), 'MMM d')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;