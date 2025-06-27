import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Coffee,
  Shield,
  PiggyBank
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'alert' | 'progress' | 'opportunity';
  title: string;
  description: string;
  value?: string;
  action?: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  tag?: string;
}

interface AILearningInsightsProps {
  compact?: boolean;
}

const AILearningInsights: React.FC<AILearningInsightsProps> = ({ compact = false }) => {
  const insights: Insight[] = [
    {
      id: 'coffee-spending',
      type: 'alert',
      title: 'Coffee Spending Alert',
      description: "You've spent $156 on coffee this month - 23% more than last month. Consider brewing at home to save $80/month.",
      icon: Coffee,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      tag: 'spending',
      action: 'Learn More'
    },
    {
      id: 'emergency-fund',
      type: 'progress',
      title: 'Emergency Fund Progress',
      description: "Great job! You're 87.5% towards your emergency fund goal. Just $1,250 more to go!",
      icon: Shield,
      color: 'text-brand-teal',
      bgColor: 'bg-teal-50',
      tag: 'saving'
    },
    {
      id: 'investment-opportunity',
      type: 'opportunity',
      title: 'Investment Opportunity',
      description: 'You have $2,000+ sitting in checking. Consider moving some to your high-yield savings or investment account.',
      icon: PiggyBank,
      color: 'text-brand-rosegold',
      bgColor: 'bg-rosegold-50',
      tag: 'investing'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-grey-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-serif font-bold text-charcoal-800 flex items-center space-x-2`}>
          <Brain className="h-4 w-4 text-brand-rosegold" />
          <span>AI Learning Insights</span>
        </h3>
        <div className="text-lg">🧠</div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${insight.bgColor} rounded-lg ${compact ? 'p-3' : 'p-4'} border border-grey-200`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${insight.bgColor} rounded-lg flex items-center justify-center border border-grey-200`}>
                  <IconComponent className={`h-3 w-3 ${insight.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-charcoal-800`}>
                      {insight.title}
                    </h4>
                    {insight.tag && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        insight.tag === 'spending' ? 'bg-red-100 text-red-700' :
                        insight.tag === 'saving' ? 'bg-teal-100 text-teal-700' :
                        'bg-rosegold-100 text-rosegold-700'
                      }`}>
                        {insight.tag}
                      </span>
                    )}
                  </div>
                  <p className={`${compact ? 'text-xs' : 'text-sm'} text-charcoal-600 mb-3 leading-relaxed`}>
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className={`text-xs ${insight.color} hover:opacity-70 transition-opacity flex items-center space-x-1 font-medium`}>
                      <span>{insight.action}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AILearningInsights;