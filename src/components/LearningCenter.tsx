import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import WelcomeHeader from './WelcomeHeader';
import LearningJourney from './LearningJourney';

interface LearningCenterProps {
  user: User;
  userLevel: number;
  xp: { points: number | null; badges: string[] | null } | null;
  onXPUpdate: (points: number) => void;
}

const LearningCenter: React.FC<LearningCenterProps> = ({ user, userLevel, xp, onXPUpdate }) => {
  const [totalPoints, setTotalPoints] = useState(xp?.points || 0);
  const [streakCount, setStreakCount] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader user={user} xp={xp} />

      {/* Learning Journey Component */}
      <LearningJourney 
        userLevel={userLevel}
        totalPoints={totalPoints}
        streakCount={streakCount}
        completedLessons={completedLessons}
      />

      {/* Dojo Wisdom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-[#2A6F68]/5 to-[#B76E79]/5 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-[#333333] mb-3 flex items-center space-x-2">
          <img 
            src="/assets/finapp.png" 
            alt="DoughJo" 
            className="w-6 h-6 object-contain"
          />
          <span>Wisdom from Sensei <span className="text-[#2A6F68]">DoughJo</span></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-[#2A6F68] font-bold">"</span>
            <span>The way of the warrior is to stop trouble before it starts - Build your emergency fund</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-[#2A6F68] font-bold">"</span>
            <span>A thousand-mile journey begins with a single step - Start investing today</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-[#2A6F68] font-bold">"</span>
            <span>The bamboo that bends is stronger than the oak - Adapt your financial strategy</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-[#2A6F68] font-bold">"</span>
            <span>Empty your cup so that it may be filled - Always keep learning</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningCenter;