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
  onQuickAction: (message: string) => void;
  compact?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, compact = false }) => {
  const quickActions: QuickAction[] = [
    {
      id: 'debt-consolidation',
      label: 'Analyze debt consolidation',
      description: 'Find ways to reduce interest',
      icon: Calculator,
      color: 'bg-gradient-to-r from-brand-rosegold to-rosegold-600',
      action: () => onQuickAction('Analyze my debt consolidation options and show potential savings')
    },
    {
      id: 'investment-review',
      label: 'Review investments',
      description: 'Optimize asset allocation',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-brand-teal to-teal-600',
      action: () => onQuickAction('Review my investment portfolio and suggest optimizations')
    },
    {
      id: 'emergency-fund',
      label: 'Plan emergency fund',
      description: 'Build financial security',
      icon: Shield,
      color: 'bg-gradient-to-r from-brand-teal to-teal-700',
      action: () => onQuickAction('Help me create a plan to build my emergency fund to 6 months of expenses')
    }
  ];

  return (
    <div className={`bg-cream-50 rounded-2xl shadow-sm border border-cream-200 ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className="text-base font-serif font-bold text-charcoal-800 mb-3 flex items-center space-x-2">
        <Target className="h-4 w-4 text-brand-teal" />
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
              className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-cream-100 to-cream-200 hover:from-teal-50 hover:to-rosegold-50 transition-all border border-cream-300 hover:border-brand-teal"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-charcoal-800 mb-1">
                    {action.label}
                  </div>
                  <div className="text-xs text-charcoal-600">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-charcoal-400 flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;