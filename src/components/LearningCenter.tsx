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

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  points: number;
  userLevel?: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  difficulty: string;
  xpEarned: number;
  timeSpent: number;
}

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
  const [currentView, setCurrentView] = useState<'overview' | 'quiz' | 'results'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [streakCount, setStreakCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
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

  const categories = [
    { 
      id: 'budgeting', 
      name: 'Budgeting & Planning', 
      icon: PieChart, 
      color: 'from-[#2A6F68] to-emerald-600',
      description: 'Master the art of money management',
      minLevel: 1
    },
    { 
      id: 'investing', 
      name: 'Investing Basics', 
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Build wealth through smart investments',
      minLevel: 3
    },
    { 
      id: 'saving', 
      name: 'Saving Strategies', 
      icon: DollarSign, 
      color: 'from-[#B76E79] to-rose-600',
      description: 'Effective techniques to grow your savings',
      minLevel: 1
    },
    { 
      id: 'debt', 
      name: 'Debt Management', 
      icon: Calculator, 
      color: 'from-orange-500 to-red-600',
      description: 'Strategies to eliminate debt efficiently',
      minLevel: 2
    }
  ];

  const difficulties = [
    { 
      id: 'beginner', 
      name: 'White Belt', 
      description: 'Basic concepts', 
      points: 10,
      color: 'from-gray-100 to-gray-300',
      textColor: 'text-gray-700',
      minLevel: 1
    },
    { 
      id: 'intermediate', 
      name: 'Green Belt', 
      description: 'Intermediate strategies', 
      points: 20,
      color: 'from-[#2A6F68] to-emerald-600',
      textColor: 'text-white',
      minLevel: 5
    },
    { 
      id: 'advanced', 
      name: 'Black Belt', 
      description: 'Advanced techniques', 
      points: 30,
      color: 'from-gray-800 to-black',
      textColor: 'text-white',
      minLevel: 15
    }
  ];

  // Generate questions (same as before)
  const generateQuestions = (category: string, difficulty: string, userLevel: number): Question[] => {
    const questionBank: { [key: string]: { [key: string]: Question[] } } = {
      budgeting: {
        beginner: [
          {
            id: 'budget_1',
            question: 'What is the 50/30/20 budgeting rule?',
            options: [
              '50% needs, 30% wants, 20% savings',
              '50% savings, 30% needs, 20% wants',
              '50% wants, 30% savings, 20% needs',
              '50% investments, 30% expenses, 20% emergency fund'
            ],
            correctAnswer: 0,
            explanation: 'The 50/30/20 rule allocates 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment.',
            difficulty: 'beginner',
            category: 'budgeting',
            points: 10,
            userLevel: 1
          },
          {
            id: 'budget_2',
            question: 'Which expense is considered a "need" in budgeting?',
            options: ['Netflix subscription', 'Rent payment', 'Dining out', 'New clothes'],
            correctAnswer: 1,
            explanation: 'Rent is a basic necessity for shelter, while the others are typically considered "wants" that can be adjusted.',
            difficulty: 'beginner',
            category: 'budgeting',
            points: 10,
            userLevel: 1
          }
        ]
      }
    };

    const categoryQuestions = questionBank[category]?.[difficulty] || [];
    return categoryQuestions.filter(q => (q.userLevel || 1) <= userLevel).slice(0, 5);
  };

  const startQuiz = (category: string, difficulty: string) => {
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    
    const generatedQuestions = generateQuestions(category, difficulty, userLevel);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizStartTime(Date.now());
    setCurrentView('quiz');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
    } else {
      setStreakCount(0);
    }

    if (showExplanation) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        finishQuiz(newAnswers);
      }
    } else {
      setShowExplanation(true);
    }
  };

  const finishQuiz = (answers: number[]) => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    
    const basePoints = questions.reduce((sum, q) => sum + q.points, 0);
    const totalXP = Math.floor((correctAnswers / questions.length) * basePoints);

    const result: QuizResult = {
      score: Math.round((correctAnswers / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      xpEarned: totalXP,
      timeSpent: Math.floor((Date.now() - quizStartTime) / 1000)
    };

    setQuizResult(result);
    setCurrentView('results');
    onXPUpdate(totalXP);
    setTotalPoints(prev => prev + totalXP);
    setCompletedLessons(prev => prev + 1);
  };

  const resetQuiz = () => {
    setCurrentView('overview');
    setQuizResult(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setStreakCount(0);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (currentView === 'quiz' && questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-t-2xl p-6 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#2A6F68]/10 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-[#2A6F68]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#333333]">Financial Mastery Quiz</h2>
                <p className="text-sm text-gray-600">
                  {categories.find(c => c.id === selectedCategory)?.name} - {difficulties.find(d => d.id === selectedDifficulty)?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {streakCount > 0 && (
                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm">
                  <Flame className="h-3 w-3" />
                  <span>{streakCount} streak!</span>
                </div>
              )}
              <button
                onClick={resetQuiz}
                className="text-gray-500 hover:text-[#333333] transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] h-3 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-600">
              Level {userLevel} • {difficulties.find(d => d.id === selectedDifficulty)?.name}
            </p>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-b-2xl p-6 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-[#333333] mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showResult = showExplanation;
                  
                  let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all ";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-green-50 text-green-700";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50 text-red-700";
                    } else {
                      buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "border-[#2A6F68] bg-[#2A6F68]/5 text-[#2A6F68]";
                    } else {
                      buttonClass += "border-gray-200 hover:border-gray-300 text-[#333333] hover:bg-gray-50";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                        <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#333333] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Learning</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="flex items-center space-x-2 bg-[#2A6F68] text-white px-6 py-2 rounded-lg hover:bg-[#235A54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>
                    {showExplanation 
                      ? (currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question')
                      : 'Submit Answer'
                    }
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (currentView === 'results' && quizResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 text-center shadow-sm"
        >
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#333333] mb-2">Quest Complete!</h2>
            <p className="text-gray-600">
              {categories.find(c => c.id === quizResult.category)?.name} - {difficulties.find(d => d.id === quizResult.difficulty)?.name}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#2A6F68]">{quizResult.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#2A6F68]">
                {quizResult.correctAnswers}/{quizResult.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#B76E79]">+{quizResult.xpEarned}</div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{quizResult.timeSpent}s</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuiz(quizResult.category, quizResult.difficulty)}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-[#333333] py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake Quest</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuiz}
              className="flex-1 bg-[#2A6F68] text-white py-3 px-4 rounded-lg hover:bg-[#235A54] transition-colors"
            >
              New Quest
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Overview
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

      {/* Practice Quizzes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#333333] flex items-center space-x-2">
          <Brain className="h-5 w-5 text-[#2A6F68]" />
          <span>Practice Quizzes</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isUnlocked = category.minLevel <= userLevel;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all ${
                  isUnlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {!isUnlocked && (
                    <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      Level {category.minLevel}+
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-[#333333] mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                {isUnlocked ? (
                  <div className="space-y-2">
                    {difficulties.filter(d => d.minLevel <= userLevel).map((difficulty) => (
                      <motion.button
                        key={difficulty.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startQuiz(category.id, difficulty.id)}
                        className={`w-full flex items-center justify-between p-3 bg-gradient-to-r ${difficulty.color} rounded-lg transition-all text-left`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`text-lg ${difficulty.textColor}`}>🥋</div>
                          <div>
                            <div className={`font-medium ${difficulty.textColor}`}>{difficulty.name}</div>
                            <div className={`text-sm ${difficulty.textColor} opacity-80`}>{difficulty.description}</div>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 ${difficulty.textColor}`}>
                          <span className="text-sm font-medium">+{difficulty.points} XP</span>
                          <Play className="h-4 w-4" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Reach Level {category.minLevel} to unlock
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;