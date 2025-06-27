import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle
} from 'lucide-react';

interface AnalysisMetric {
  label: string;
  value: string | number;
  target?: string | number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
}

interface FinancialAnalysisProps {
  user: any;
  compact?: boolean;
}

const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({ user, compact = false }) => {
  const analysisMetrics: AnalysisMetric[] = [
    {
      label: 'Overall Score',
      value: '7.2/10',
      status: 'good',
      icon: Activity,
      color: 'text-sage-600'
    },
    {
      label: 'Debt Ratio',
      value: '33%',
      target: '18%',
      status: 'warning',
      icon: TrendingDown,
      color: 'text-bronze-600'
    },
    {
      label: 'Emergency Fund',
      value: '1.5 months',
      target: '4-6 months',
      status: 'critical',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      label: 'Savings Rate',
      value: '18%',
      target: '15%+',
      status: 'good',
      icon: TrendingUp,
      color: 'text-sage-600'
    }
  ];

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-sage-600';
      case 'warning': return 'text-bronze-600';
      case 'critical': return 'text-red-600';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-sage-50';
      case 'warning': return 'bg-bronze-50';
      case 'critical': return 'bg-red-50';
    }
  };

  return (
    <div className={`bg-cream-50 rounded-2xl shadow-sm border border-cream-200 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
            <img 
              src="/finapp.png" 
              alt="Financial AI" 
              className="w-5 h-5 object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-charcoal-800">
              Financial Analysis
            </h3>
            <div className="text-xs text-charcoal-600">
              <div>Net Worth: $22,000 • Monthly Savings: $1,883</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span className="text-xs">AI analyzing in real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Metrics */}
      <div className="space-y-2">
        {analysisMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${getStatusBg(metric.status)} rounded-lg p-3 border border-cream-200`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <IconComponent className={`h-3 w-3 ${getStatusColor(metric.status)}`} />
                  <span className="text-xs font-medium text-charcoal-700">{metric.label}</span>
                </div>
                <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
              </div>
              {metric.target && (
                <div className="text-xs text-charcoal-600">
                  Target: {metric.target}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialAnalysis;