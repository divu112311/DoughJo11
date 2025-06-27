import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  RefreshCw, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  PiggyBank,
  Activity,
  Target
} from 'lucide-react';

interface FinancialMetric {
  id: string;
  label: string;
  value: string;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface FinancialHealthDashboardProps {
  showTitle?: boolean;
  compact?: boolean;
}

const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const healthScore = 47;
  
  const metrics: FinancialMetric[] = [
    {
      id: 'emergency-fund',
      label: 'Emergency Fund',
      value: '68%',
      percentage: 68,
      status: 'good',
      icon: Shield,
      color: 'text-[#2A6F68]',
      bgColor: 'bg-[#2A6F68]/10'
    },
    {
      id: 'debt-management',
      label: 'Debt Management',
      value: '72%',
      percentage: 72,
      status: 'good',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'savings-rate',
      label: 'Savings Rate',
      value: '85%',
      percentage: 85,
      status: 'good',
      icon: PiggyBank,
      color: 'text-[#B76E79]',
      bgColor: 'bg-[#B76E79]/10'
    },
    {
      id: 'investment-growth',
      label: 'Investment Growth',
      value: '45%',
      percentage: 45,
      status: 'warning',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#333333] flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-[#2A6F68]" />
            <span>Financial Health Dashboard</span>
          </h3>
          <button className="text-[#2A6F68] hover:text-[#235A54] text-sm transition-colors flex items-center space-x-1">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* Health Score Circle */}
      <div className={`flex items-center justify-center ${compact ? 'mb-4' : 'mb-8'}`}>
        <div className={`relative ${compact ? 'w-24 h-24' : 'w-32 h-32'}`}>
          <svg className={`${compact ? 'w-24 h-24' : 'w-32 h-32'} transform -rotate-90`} viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#healthGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={314}
              initial={{ strokeDashoffset: 314 }}
              animate={{ strokeDashoffset: 314 - (314 * healthScore) / 100 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2A6F68" />
                <stop offset="100%" stopColor="#B76E79" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-[#2A6F68]`}>
                {healthScore}%
              </div>
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
                Health Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-4'}`}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`${metric.bgColor} rounded-lg ${compact ? 'p-3' : 'p-4'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${metric.color}`} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                    {metric.label}
                  </span>
                </div>
                <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.percentage}%` }}
                  transition={{ delay: 1 + index * 0.1, duration: 1 }}
                  className={`h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialHealthDashboard;