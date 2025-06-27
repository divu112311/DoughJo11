import React from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, TrendingUp } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { User } from '@supabase/supabase-js';

interface FinancialGoalsProps {
  user: User;
  compact?: boolean;
}

const FinancialGoals: React.FC<FinancialGoalsProps> = ({ user, compact = false }) => {
  const { goals, loading } = useGoals(user);

  // Mock goals for demonstration if no real goals exist
  const mockGoals = [
    {
      id: 'emergency-fund',
      name: 'Emergency Fund',
      saved_amount: 8750,
      target_amount: 10000,
      deadline: '2024-12-30',
      priority: 'high'
    },
    {
      id: 'japan-vacation',
      name: 'Japan Vacation',
      saved_amount: 1200,
      target_amount: 4000,
      deadline: '2025-03-14',
      priority: 'medium'
    },
    {
      id: 'investment-portfolio',
      name: 'Investment Portfolio',
      saved_amount: 12500,
      target_amount: 25000,
      deadline: '2025-12-30',
      priority: 'high'
    }
  ];

  const displayGoals = goals.length > 0 ? goals : mockGoals;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-[#333333] flex items-center space-x-2`}>
          <Target className="h-5 w-5 text-[#2A6F68]" />
          <span>Financial Goals</span>
        </h3>
        <div className="text-xs text-gray-500">🎯</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#2A6F68] border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {displayGoals.slice(0, compact ? 2 : 3).map((goal, index) => {
            const progress = goal.target_amount 
              ? ((goal.saved_amount || 0) / goal.target_amount) * 100 
              : 0;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-[#2A6F68]" />
                    <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-[#333333]`}>
                      {goal.name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(goal as any).priority && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor((goal as any).priority)}`}>
                        {(goal as any).priority}
                      </span>
                    )}
                    <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-[#2A6F68]`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] h-3 rounded-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    ${(goal.saved_amount || 0).toLocaleString()} of ${(goal.target_amount || 0).toLocaleString()}
                  </div>
                  {goal.deadline && (
                    <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      Target: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {!compact && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-[#2A6F68] hover:text-[#2A6F68] transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Goal</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialGoals;