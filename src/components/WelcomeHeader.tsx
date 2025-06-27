import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface WelcomeHeaderProps {
  user: User;
  xp: { points: number | null; badges: string[] | null } | null;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ user, xp }) => {
  const level = Math.floor((xp?.points || 0) / 100) + 1;

  const getBeltRank = (level: number) => {
    if (level >= 50) return { name: "Grand Master", color: "from-bronze-400 to-bronze-600", emoji: "🏆" };
    if (level >= 40) return { name: "Master", color: "from-rosegold-400 to-rosegold-600", emoji: "👑" };
    if (level >= 30) return { name: "Black Belt", color: "from-charcoal-700 to-charcoal-900", emoji: "🥋" };
    if (level >= 20) return { name: "Brown Belt", color: "from-bronze-600 to-bronze-800", emoji: "🤎" };
    if (level >= 15) return { name: "Blue Belt", color: "from-teal-400 to-teal-600", emoji: "💙" };
    if (level >= 10) return { name: "Green Belt", color: "from-sage-400 to-sage-600", emoji: "💚" };
    if (level >= 5) return { name: "Yellow Belt", color: "from-bronze-300 to-bronze-500", emoji: "💛" };
    return { name: "White Belt", color: "from-cream-300 to-cream-500", emoji: "🤍" };
  };

  const beltRank = getBeltRank(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-teal-600 rounded-2xl p-4 text-white relative overflow-hidden mb-8 border border-teal-500 shadow-lg"
    >
      <div className="absolute top-3 right-3">
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-8 h-8 opacity-30"
        >
          <img 
            src="/finapp.png" 
            alt="DoughJo" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
      
      <h1 className="text-lg font-serif font-bold mb-3 text-teal-50">
        Welcome back, {user.user_metadata?.full_name || 'Financial Warrior'}! 🥋
      </h1>
      
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 bg-gradient-to-r ${beltRank.color} text-white rounded-lg px-3 py-1 shadow-sm`}>
          <span className="text-xs">{beltRank.emoji}</span>
          <span className="text-xs font-medium">{beltRank.name}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
          <Award className="h-3 w-3" />
          <span className="text-xs">Level {level}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-xs">{xp?.points || 0} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;