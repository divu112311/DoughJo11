import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Star, 
  Award, 
  ChevronRight,
  Shield,
  Calculator,
  TrendingUp,
  Brain,
  Target,
  Flame
} from 'lucide-react';

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

interface LearningJourneyProps {
  userLevel: number;
  totalPoints: number;
  streakCount: number;
  completedLessons: number;
}

const LearningJourney: React.FC<LearningJourneyProps> = ({ 
  userLevel, 
  totalPoints, 
  streakCount, 
  completedLessons 
}) => {
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

  return (
    <div className="space-y-6">
      {/* Journey Stats Header */}
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
              <h2 className="text-2xl font-bold">Your Learning Journey</h2>
              <p className="text-white/90">Master financial wisdom through the DoughJo way</p>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="text-sm text-white/80">Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold flex items-center">
                {streakCount}
                {streakCount > 0 && <Flame className="h-5 w-5 ml-1 text-orange-300" />}
              </div>
              <div className="text-sm text-white/80">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{completedLessons}</div>
              <div className="text-sm text-white/80">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Belt Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.5, duration: 1 }}
            className={`bg-gradient-to-r ${beltRank.color} h-3 rounded-full`}
          />
        </div>
        <p className="text-sm text-gray-600">
          {5 - (userLevel % 5)} more levels to next belt
        </p>
      </motion.div>

      {/* Learning Paths */}
      <div>
        <h3 className="text-xl font-bold text-[#333333] mb-4 flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-[#2A6F68]" />
          <span>Learning Paths</span>
        </h3>
        
        <div className="space-y-3">
          {learningPaths.map((path, index) => {
            const IconComponent = path.icon;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-gradient-to-r ${path.bgGradient} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <IconComponent className={`h-6 w-6 ${path.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-[#333333] mb-1">{path.title}</h4>
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
    </div>
  );
};

export default LearningJourney;