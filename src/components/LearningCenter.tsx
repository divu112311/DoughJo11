import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Brain,
  Star,
  Award,
  RefreshCw,
  TrendingUp,
  Zap,
  Clock,
  Users,
  DollarSign,
  PieChart,
  Shield,
  Calculator,
  Lightbulb,
  Play,
  BarChart3,
  Activity,
  Flame,
  ChevronRight
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  progress: number;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
}

interface QuickAction {
  id: string;
  title: string;
  points: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface LearningCenterProps {
  user: User;
  userLevel: number;
  onXPUpdate: (points: number) => void;
}

const LearningCenter: React.FC<LearningCenterProps> = ({ user, userLevel, onXPUpdate }) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  // Learning paths with dojo-themed colors
  const learningPaths: LearningPath[] = [
    {
      id: 'foundation',
      title: 'Financial Foundation',
      description: 'Address urgent financial priorities',
      lessons: 1,
      duration: '2 weeks',
      progress: 0,
      icon: Shield,
      color: 'text-red-600',
      bgGradient: 'from-red-50 to-orange-50'
    },
    {
      id: 'debt-elimination',
      title: 'Debt Elimination Strategy',
      description: 'Strategic approach to becoming debt-free',
      lessons: 4,
      duration: '4 weeks',
      progress: 0,
      icon: Calculator,
      color: 'text-orange-600',
      bgGradient: 'from-orange-50 to-yellow-50'
    },
    {
      id: 'investment-mastery',
      title: 'Investment Mastery',
      description: 'Build wealth through smart investments',
      lessons: 6,
      duration: '6 weeks',
      progress: 25,
      icon: TrendingUp,
      color: 'text-[#2A6F68]',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Strategies',
      description: 'Master complex financial techniques',
      lessons: 8,
      duration: '8 weeks',
      progress: 10,
      icon: Brain,
      color: 'text-[#B76E79]',
      bgGradient: 'from-rose-50 to-pink-50'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'debt-spreadsheet',
      title: 'Create debt payoff spreadsheet',
      points: 25,
      icon: Calculator,
      color: 'bg-gradient-to-r from-[#2A6F68] to-emerald-600'
    },
    {
      id: 'foundation-module',
      title: 'Complete your financial foundation module',
      points: 25,
      icon: Shield,
      color: 'bg-gradient-to-r from-[#B76E79] to-rose-600'
    },
    {
      id: 'budget-review',
      title: 'Review and optimize your budget',
      points: 20,
      icon: PieChart,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    {
      id: 'emergency-fund',
      title: 'Set up emergency fund strategy',
      points: 30,
      icon: Shield,
      color: 'bg-gradient-to-r from-purple-500 to-violet-600'
    }
  ];

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

  const beltRank = getBeltRank(userLevel);

  return (
    <div className="space-y-8">
      {/* Header with Journey Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Learning Journey</h1>
              <p className="text-white/90">Master financial wisdom through the DoughJo way</p>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="text-sm text-white/80">Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{streakCount}</div>
              <div className="text-sm text-white/80">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{completedLessons}</div>
              <div className="text-sm text-white/80">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Paths */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#333333] flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-[#2A6F68]" />
          <span>Learning Paths</span>
        </h2>
        
        <div className="space-y-3">
          {learningPaths.map((path, index) => {
            const IconComponent = path.icon;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${path.bgGradient} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <IconComponent className={`h-6 w-6 ${path.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#333333] mb-1">{path.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{path.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{path.lessons} lessons</span>
                        <span>•</span>
                        <span>{path.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Progress</div>
                      <div className="text-lg font-bold text-[#333333]">{path.progress}%</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#2A6F68] transition-colors" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${path.progress}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] h-2 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Quick Actions</h3>
          </div>
          <button className="text-white/80 hover:text-white text-sm transition-colors">
            Show Tools
          </button>
        </div>
        
        <div className="space-y-3">
          {quickActions.slice(0, 2).map((action, index) => {
            const IconComponent = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/20 transition-all border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-white/80">+{action.points} points</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/60" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Financial Health Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
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

        {/* Health Score Circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
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
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={314}
                initial={{ strokeDashoffset: 314 }}
                animate={{ strokeDashoffset: 314 - (314 * 47) / 100 }}
                transition={{ duration: 2, delay: 0.8 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2A6F68" />
                  <stop offset="100%" stopColor="#B76E79" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2A6F68]">47%</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Emergency Fund', value: '68%', color: 'text-green-600', bgColor: 'bg-green-100' },
            { label: 'Debt Management', value: '72%', color: 'text-blue-600', bgColor: 'bg-blue-100' },
            { label: 'Savings Rate', value: '85%', color: 'text-purple-600', bgColor: 'bg-purple-100' },
            { label: 'Investment Growth', value: '45%', color: 'text-orange-600', bgColor: 'bg-orange-100' }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className={`${metric.bgColor} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: metric.value }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                  className={`h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Belt Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-xl font-bold text-[#333333] mb-6 flex items-center space-x-2">
          <Award className="h-5 w-5 text-[#2A6F68]" />
          <span>DoughJo Belt Progression</span>
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${beltRank.color} rounded-full flex items-center justify-center`}>
              <span className="text-lg">{beltRank.emoji}</span>
            </div>
            <div>
              <h4 className="font-semibold text-[#333333]">Current Rank: {beltRank.name}</h4>
              <p className="text-sm text-gray-600">Level {userLevel} Financial Warrior</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Next Belt</div>
            <div className="text-lg font-bold text-[#2A6F68]">
              {userLevel < 5 ? 'Yellow Belt' : 
               userLevel < 10 ? 'Green Belt' : 
               userLevel < 15 ? 'Blue Belt' : 
               userLevel < 20 ? 'Brown Belt' : 
               userLevel < 30 ? 'Black Belt' : 
               userLevel < 40 ? 'Master' : 'Grand Master'}
            </div>
          </div>
        </div>

        {/* Progress to next belt */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((userLevel % 5) / 5) * 100}%` }}
            transition={{ delay: 1, duration: 1 }}
            className={`bg-gradient-to-r ${beltRank.color} h-3 rounded-full`}
          />
        </div>
        <p className="text-sm text-gray-600">
          {5 - (userLevel % 5)} more levels to next belt
        </p>
      </motion.div>

      {/* Dojo Wisdom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-[#2A6F68]/5 to-[#B76E79]/5 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-[#333333] mb-3 flex items-center space-x-2">
          <img 
            src="/finapp.png" 
            alt="DoughJo" 
            className="w-6 h-6 object-contain"
          />
          <span>Wisdom from Sensei <span className="text-[#2A6F68]">DoughJo</span></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Target className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>"The way of the warrior is to stop trouble before it starts" - Build your emergency fund</span>
          </div>
          <div className="flex items-start space-x-2">
            <Brain className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>"A thousand-mile journey begins with a single step" - Start investing today</span>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>"The bamboo that bends is stronger than the oak" - Adapt your financial strategy</span>
          </div>
          <div className="flex items-start space-x-2">
            <Star className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>"Empty your cup so that it may be filled" - Always keep learning</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningCenter;