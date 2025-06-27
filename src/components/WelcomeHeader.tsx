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
    if (level >= 50) return { name: "Grand Master", color: "from-yellow-400 to-yellow-600", emoji: "🏆" };
    if (level >= 40) return { name: "Master", color: "from-purple-400 to-purple-600", emoji: "👑" };
    if (level >= 30) return { name: "Black Belt", color: "from-gray-800 to-black", emoji: "🥋" };
    if (level >= 20) return { name: "Brown Belt", color: "from-amber-600 to-amber-800", emoji: "🤎" };
    if (level >= 15) return { name: "Blue Belt", color: "from-blue-400 to-blue-600", emoji: "💙" };
    if (level >= 10) return { name: "Green Belt", color: "from-green-400 to-green-600", emoji: "💚" };
    if (level >= 5) return { name: "Yellow Belt", color: "from-yellow-300 to-yellow-500", emoji: "💛" };
    return { name: "White Belt", color: "from-gray-100 to-gray-300", emoji: "🤍" };
  };

  const beltRank = getBeltRank(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-2xl p-6 text-white relative overflow-hidden mb-8"
    >
      <div className="absolute top-4 right-4">
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
          className="w-16 h-16 opacity-20"
        >
          <img 
            src="/finapp.png" 
            alt="DoughJo" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
      
      <h1 className="text-2xl font-serif font-bold mb-2">
        Welcome back, {user.user_metadata?.full_name || 'Financial Warrior'}! 🥋
      </h1>
      <p className="text-white/90 mb-4">
        Continue your training in the <span className="text-white font-medium">DoughJo</span> dojo
      </p>
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 bg-gradient-to-r ${beltRank.color} text-white rounded-lg px-3 py-1`}>
          <span className="text-sm">{beltRank.emoji}</span>
          <span className="text-sm font-medium">{beltRank.name}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
          <Award className="h-4 w-4" />
          <span className="text-sm">Level {level}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-sm">{xp?.points || 0} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;