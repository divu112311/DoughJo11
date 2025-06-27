import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Target, CheckCircle } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  date: string;
}

interface RecentAchievementsProps {
  compact?: boolean;
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ compact = false }) => {
  const achievements: Achievement[] = [
    {
      id: 'financial-freshman',
      title: 'Financial Freshman',
      description: 'Completed onboarding and started your financial journey',
      icon: Trophy,
      color: 'text-[#2A6F68]',
      bgColor: 'bg-[#2A6F68]/10',
      date: '2 days ago'
    },
    {
      id: 'first-goal',
      title: 'Goal Setter',
      description: 'Created your first financial goal',
      icon: Target,
      color: 'text-[#B76E79]',
      bgColor: 'bg-[#B76E79]/10',
      date: '1 day ago'
    },
    {
      id: 'chat-master',
      title: 'Sensei Student',
      description: 'Had 10 conversations with DoughJo',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      date: 'Today'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-[#333333] flex items-center space-x-2`}>
          <Trophy className="h-5 w-5 text-[#2A6F68]" />
          <span>Recent Achievements</span>
        </h3>
        <div className="text-xs text-gray-500">🏆</div>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement, index) => {
          const IconComponent = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${achievement.bgColor} rounded-lg ${compact ? 'p-3' : 'p-4'} border border-gray-200`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${achievement.bgColor} rounded-lg flex items-center justify-center border border-gray-200`}>
                  <IconComponent className={`h-4 w-4 ${achievement.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-[#333333] mb-1`}>
                    {achievement.title}
                  </h4>
                  <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{achievement.date}</span>
                    <CheckCircle className="h-4 w-4 text-[#2A6F68]" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentAchievements;