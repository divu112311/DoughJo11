import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  BarChart3, 
  Shield, 
  Target,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  onActionClick: (message: string) => void;
  compact?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, compact = false }) => {
  const quickActions: QuickAction[] = [
    {
      id: 'debt-consolidation',
      label: 'Analyze debt consolidation',
      description: 'Find ways to reduce interest',
      icon: Calculator,
      color: 'bg-gradient-to-r from-[#B76E79] to-rose-500',
      action: () => onActionClick('Analyze my debt consolidation options and show potential savings')
    },
    {
      id: 'investment-review',
      label: 'Review investments',
      description: 'Optimize asset allocation',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-[#2A6F68] to-emerald-500',
      action: () => onActionClick('Review my investment portfolio and suggest optimizations')
    },
    {
      id: 'emergency-fund',
      label: 'Plan emergency fund',
      description: 'Build financial security',
      icon: Shield,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      action: () => onActionClick('Help me create a plan to build my emergency fund to 6 months of expenses')
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className="text-base font-bold text-[#333333] mb-3 flex items-center space-x-2">
        <Target className="h-4 w-4 text-[#2A6F68]" />
        <span>Quick Actions</span>
      </h3>
      
      <div className="space-y-2">
        {quickActions.slice(0, compact ? 3 : 5).map((action, index) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#2A6F68]/5 hover:to-[#B76E79]/5 transition-all border border-gray-200 hover:border-[#2A6F68]/20"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#333333] mb-1">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;