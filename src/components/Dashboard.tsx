import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Award,
  Plus
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useGoals } from '../hooks/useGoals';
import BankAccounts from './BankAccounts';
import FinancialHealthDashboard from './FinancialHealthDashboard';
import WelcomeHeader from './WelcomeHeader';

interface DashboardProps {
  user: User;
  xp: { points: number | null; badges: string[] | null } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, xp }) => {
  const { goals, loading: goalsLoading } = useGoals(user);

  const level = Math.floor((xp?.points || 0) / 100) + 1;

  const getBeltRank = (level: number) => {
    if (level >= 50) return { name: "Grand Master", color: "from-yellow-400 to-yellow-600", emoji: "🏆" };
    if (level >= 40) return { name: "Master", color: "from-purple-400 to-purple-600", emoji: "👑" };
    if (level >= 30) return { name: "Black Belt", color: "from-gray-800 to-black", emoji: "🥋" };
    if (level >= 20) return { name: "Brown Belt", color: "from-amber-600 to-amber-800", emoji: "🤎" };
    if (level >= 15) return { name: "Blue Belt", color: "from-blue-400 to-blue-600", emoji: "💙" };
    if (level >= 10) return { name: "Green Belt", color: "from-green-400 to-green-600", emoji: "💚" };
    if (level >= 5) return { name: "Yellow Belt", color: "from-yellow-300 to-yellow-500", emoji: "💛" };
    return { name: "White Belt", color: "from-gray-100 to-gray-300", emoji: "🤍" };
  };

  const beltRank = getBeltRank(level);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader user={user} xp={xp} />

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
            $22,000
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            {goals.length}
          </h3>
          <p className="text-sm text-gray-600">Active Goals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#B76E79]/10 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-[#B76E79]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            {xp?.badges?.length || 0}
          </h3>
          <p className="text-sm text-gray-600">Achievements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${beltRank.color} rounded-lg flex items-center justify-center`}>
              <span className="text-lg">{beltRank.emoji}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#333333] mb-1">
            {beltRank.name}
          </h3>
          <p className="text-sm text-gray-600">Current Rank</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Financial Health Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FinancialHealthDashboard />
          </motion.div>

          {/* Bank Accounts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-1 shadow-sm border border-gray-200"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#333333] flex items-center space-x-2">
                    <span>🏦</span>
                    <span>Bank Accounts</span>
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Connect your accounts to track finances automatically
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Demo Ready!
                </div>
              </div>
              
              <BankAccounts user={user} />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Goals */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#333333]">Financial Quests</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-[#2A6F68] text-white px-4 py-2 rounded-lg hover:bg-[#235A54] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Quest</span>
              </motion.button>
            </div>

            {goalsLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-[#2A6F68] border-t-transparent rounded-full"
                />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4">
                  <img 
                    src="/finapp.png" 
                    alt="DoughJo" 
                    className="w-full h-full object-contain opacity-50"
                  />
                </div>
                <p className="text-gray-500 mb-4">No quests yet, young warrior</p>
                <p className="text-sm text-gray-400">Begin your journey by setting your first financial goal!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal, index) => {
                  const progress = goal.target_amount 
                    ? ((goal.saved_amount || 0) / goal.target_amount) * 100 
                    : 0;
                  
                  return (
                    <div key={goal.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-[#333333]">🎯 {goal.name}</h4>
                        <span className="text-sm text-gray-600">
                          ${(goal.saved_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                          className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] h-2 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% complete</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Badges Section */}
          {xp?.badges && xp.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Earned Achievements</h3>
              <div className="flex flex-wrap gap-3">
                {xp.badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] text-white px-3 py-2 rounded-full text-sm"
                  >
                    <Award className="h-4 w-4" />
                    <span>{badge}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;