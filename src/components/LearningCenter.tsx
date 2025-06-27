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
  Lightbulb
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
  userLevel?: number; // Minimum level required
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

  const categories = [
    { 
      id: 'budgeting', 
      name: 'Budgeting & Planning', 
      icon: PieChart, 
      color: 'from-blue-400 to-blue-600',
      description: 'Master the art of money management',
      minLevel: 1
    },
    { 
      id: 'investing', 
      name: 'Investing Basics', 
      icon: TrendingUp, 
      color: 'from-green-400 to-green-600',
      description: 'Build wealth through smart investments',
      minLevel: 3
    },
    { 
      id: 'saving', 
      name: 'Saving Strategies', 
      icon: DollarSign, 
      color: 'from-purple-400 to-purple-600',
      description: 'Effective techniques to grow your savings',
      minLevel: 1
    },
    { 
      id: 'debt', 
      name: 'Debt Management', 
      icon: Calculator, 
      color: 'from-red-400 to-red-600',
      description: 'Strategies to eliminate debt efficiently',
      minLevel: 2
    },
    { 
      id: 'insurance', 
      name: 'Insurance & Protection', 
      icon: Shield, 
      color: 'from-orange-400 to-orange-600',
      description: 'Protect your financial future',
      minLevel: 5
    },
    { 
      id: 'advanced', 
      name: 'Advanced Finance', 
      icon: Lightbulb, 
      color: 'from-indigo-400 to-indigo-600',
      description: 'Complex financial strategies',
      minLevel: 10
    }
  ];

  const difficulties = [
    { 
      id: 'beginner', 
      name: 'White Belt', 
      description: 'Basic concepts', 
      points: 10,
      color: 'from-gray-100 to-gray-300',
      minLevel: 1
    },
    { 
      id: 'intermediate', 
      name: 'Green Belt', 
      description: 'Intermediate strategies', 
      points: 20,
      color: 'from-green-400 to-green-600',
      minLevel: 5
    },
    { 
      id: 'advanced', 
      name: 'Black Belt', 
      description: 'Advanced techniques', 
      points: 30,
      color: 'from-gray-800 to-black',
      minLevel: 15
    }
  ];

  // Dynamic question bank that adapts to user level
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
          },
          {
            id: 'budget_3',
            question: 'How often should you review your budget?',
            options: ['Once a year', 'Every 6 months', 'Monthly', 'Never, once set'],
            correctAnswer: 2,
            explanation: 'Monthly budget reviews help you stay on track and adjust for changing circumstances.',
            difficulty: 'beginner',
            category: 'budgeting',
            points: 10,
            userLevel: 1
          }
        ],
        intermediate: [
          {
            id: 'budget_int_1',
            question: 'What is zero-based budgeting?',
            options: [
              'Starting with zero money',
              'Every dollar is assigned a purpose',
              'Spending nothing for a month',
              'Having zero debt'
            ],
            correctAnswer: 1,
            explanation: 'Zero-based budgeting means every dollar of income is allocated to expenses, savings, or debt payments, leaving zero unassigned.',
            difficulty: 'intermediate',
            category: 'budgeting',
            points: 20,
            userLevel: 5
          }
        ],
        advanced: [
          {
            id: 'budget_adv_1',
            question: 'What is the optimal debt-to-income ratio for mortgage approval?',
            options: ['Below 28%', 'Below 36%', 'Below 43%', 'Below 50%'],
            correctAnswer: 2,
            explanation: 'Most lenders prefer a debt-to-income ratio below 43% for mortgage approval, though some may accept up to 50% with strong credit.',
            difficulty: 'advanced',
            category: 'budgeting',
            points: 30,
            userLevel: 15
          }
        ]
      },
      investing: {
        beginner: [
          {
            id: 'invest_1',
            question: 'What does compound interest mean?',
            options: [
              'Interest paid only on the principal',
              'Interest paid on both principal and accumulated interest',
              'Interest that changes monthly',
              'Interest paid by the government'
            ],
            correctAnswer: 1,
            explanation: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods.',
            difficulty: 'beginner',
            category: 'investing',
            points: 10,
            userLevel: 3
          },
          {
            id: 'invest_2',
            question: 'What is diversification in investing?',
            options: [
              'Buying only one stock',
              'Spreading investments across different assets',
              'Investing only in bonds',
              'Keeping all money in savings'
            ],
            correctAnswer: 1,
            explanation: 'Diversification means spreading investments across different asset classes to reduce risk.',
            difficulty: 'beginner',
            category: 'investing',
            points: 10,
            userLevel: 3
          }
        ],
        intermediate: [
          {
            id: 'invest_int_1',
            question: 'What is the average annual return of the S&P 500 over the long term?',
            options: ['5%', '7%', '10%', '15%'],
            correctAnswer: 2,
            explanation: 'Historically, the S&P 500 has averaged about 10% annual returns over long periods, though individual years vary significantly.',
            difficulty: 'intermediate',
            category: 'investing',
            points: 20,
            userLevel: 7
          }
        ]
      },
      saving: {
        beginner: [
          {
            id: 'save_1',
            question: 'How much should you save for an emergency fund?',
            options: ['1 month of expenses', '3-6 months of expenses', '1 year of expenses', '2 years of expenses'],
            correctAnswer: 1,
            explanation: 'Financial experts recommend saving 3-6 months of living expenses for emergencies.',
            difficulty: 'beginner',
            category: 'saving',
            points: 10,
            userLevel: 1
          },
          {
            id: 'save_2',
            question: 'What is the best place to keep your emergency fund?',
            options: ['Stocks', 'High-yield savings account', 'Under your mattress', 'Cryptocurrency'],
            correctAnswer: 1,
            explanation: 'A high-yield savings account provides safety, liquidity, and some interest growth for emergency funds.',
            difficulty: 'beginner',
            category: 'saving',
            points: 10,
            userLevel: 1
          }
        ]
      },
      debt: {
        beginner: [
          {
            id: 'debt_1',
            question: 'Which debt repayment strategy focuses on paying off the smallest balance first?',
            options: ['Debt Avalanche', 'Debt Snowball', 'Debt Consolidation', 'Minimum Payment Strategy'],
            correctAnswer: 1,
            explanation: 'The Debt Snowball method focuses on paying off the smallest debt first to build momentum and motivation.',
            difficulty: 'beginner',
            category: 'debt',
            points: 10,
            userLevel: 2
          }
        ]
      }
    };

    const categoryQuestions = questionBank[category]?.[difficulty] || [];
    
    // Filter questions based on user level
    const levelAppropriateQuestions = categoryQuestions.filter(q => 
      (q.userLevel || 1) <= userLevel
    );

    // If not enough questions for the exact difficulty, mix in some from other levels
    if (levelAppropriateQuestions.length < 5) {
      const allCategoryQuestions = Object.values(questionBank[category] || {}).flat();
      const additionalQuestions = allCategoryQuestions
        .filter(q => (q.userLevel || 1) <= userLevel && !levelAppropriateQuestions.includes(q))
        .slice(0, 5 - levelAppropriateQuestions.length);
      
      return [...levelAppropriateQuestions, ...additionalQuestions].slice(0, 5);
    }

    return levelAppropriateQuestions.slice(0, 5);
  };

  const startQuiz = (category: string, difficulty: string) => {
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    
    const generatedQuestions = generateQuestions(category, difficulty, userLevel);
    
    if (generatedQuestions.length === 0) {
      // Fallback questions if none available
      const fallbackQuestions: Question[] = [
        {
          id: 'fallback_1',
          question: 'What is the most important first step in personal finance?',
          options: ['Investing in stocks', 'Creating a budget', 'Buying insurance', 'Getting a credit card'],
          correctAnswer: 1,
          explanation: 'Creating a budget is the foundation of good financial management.',
          difficulty: 'beginner',
          category: category,
          points: 10,
          userLevel: 1
        }
      ];
      setQuestions(fallbackQuestions);
    } else {
      setQuestions(generatedQuestions);
    }
    
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

    // Check if answer is correct for streak
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
        // Quiz completed
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
    const accuracyBonus = Math.floor((correctAnswers / questions.length) * 20);
    const streakBonus = streakCount >= 3 ? 15 : 0;
    const speedBonus = (Date.now() - quizStartTime) < 120000 ? 10 : 0; // 2 minutes
    
    const totalXP = Math.floor((correctAnswers / questions.length) * basePoints) + 
                   accuracyBonus + streakBonus + speedBonus;

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
    
    // Award XP
    onXPUpdate(totalXP);
    
    // Save quiz result to database
    saveQuizResult(result);
  };

  const saveQuizResult = async (result: QuizResult) => {
    try {
      await supabase.from('quiz_results').insert({
        user_id: user.id,
        category: result.category,
        difficulty: result.difficulty,
        score: result.score,
        correct_answers: result.correctAnswers,
        total_questions: result.totalQuestions,
        xp_earned: result.xpEarned
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
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

  const getRecommendedDifficulty = () => {
    if (userLevel <= 5) return 'beginner';
    if (userLevel <= 15) return 'intermediate';
    return 'advanced';
  };

  const getBeltEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🤍';
      case 'intermediate': return '💚';
      case 'advanced': return '🖤';
      default: return '🎯';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (currentView === 'quiz' && questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-t-2xl p-6 border-b border-gray-200">
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
                  <Zap className="h-3 w-3" />
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
              Level {userLevel} • {getBeltEmoji(selectedDifficulty)} {difficulties.find(d => d.id === selectedDifficulty)?.name}
            </p>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-b-2xl p-6">
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
                      <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                  <span>Back to Categories</span>
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
          className="bg-white rounded-2xl p-8 text-center"
        >
          {/* Results Header */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#333333] mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              {categories.find(c => c.id === quizResult.category)?.name} - {difficulties.find(d => d.id === quizResult.difficulty)?.name}
            </p>
          </div>

          {/* Score Display */}
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

          {/* Performance Message */}
          <div className="mb-6">
            {quizResult.score >= 80 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">Excellent mastery, Financial Warrior!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  You've demonstrated strong understanding. Ready for the next challenge?
                </p>
              </div>
            ) : quizResult.score >= 60 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-700">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Good progress on your journey!</span>
                </div>
                <p className="text-yellow-600 text-sm mt-1">
                  You're building solid foundations. Keep practicing to strengthen your knowledge.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Every master was once a beginner!</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Review the concepts and try again. Each attempt builds your financial wisdom.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuiz(quizResult.category, quizResult.difficulty)}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-[#333333] py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuiz}
              className="flex-1 bg-[#2A6F68] text-white py-3 px-4 rounded-lg hover:bg-[#235A54] transition-colors"
            >
              New Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Overview/Category Selection
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-full flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#333333] mb-2">Financial <span className="text-[#2A6F68]">DoughJo</span> Academy</h1>
        <p className="text-gray-600">
          Personalized quizzes that adapt to your Level {userLevel} expertise
        </p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-[#2A6F68]/10 text-[#2A6F68] px-4 py-2 rounded-full text-sm">
          <Award className="h-4 w-4" />
          <span>Recommended: {difficulties.find(d => d.id === getRecommendedDifficulty())?.name}</span>
        </div>
      </motion.div>

      {/* User Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#2A6F68]/5 to-[#B76E79]/5 rounded-xl p-4 border border-gray-200"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#2A6F68]">{userLevel}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#B76E79]">
              {categories.filter(c => c.minLevel <= userLevel).length}
            </div>
            <div className="text-sm text-gray-600">Unlocked Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {difficulties.filter(d => d.minLevel <= userLevel).length}
            </div>
            <div className="text-sm text-gray-600">Available Difficulties</div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const isUnlocked = category.minLevel <= userLevel;
          const IconComponent = category.icon;
          
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
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getBeltEmoji(difficulty.id)}</span>
                        <div>
                          <div className="font-medium text-[#333333]">{difficulty.name}</div>
                          <div className="text-sm text-gray-600">{difficulty.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[#B76E79]">
                        <span className="text-sm font-medium">+{difficulty.points} XP</span>
                        <ArrowRight className="h-4 w-4" />
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

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[#2A6F68]/5 to-[#B76E79]/5 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-[#333333] mb-3">Training Tips from Sensei <span className="text-[#2A6F68]">DoughJo</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Target className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Quizzes adapt to your Level {userLevel} knowledge</span>
          </div>
          <div className="flex items-start space-x-2">
            <Brain className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Build streaks for bonus XP rewards</span>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Complete quizzes quickly for speed bonuses</span>
          </div>
          <div className="flex items-start space-x-2">
            <Star className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Higher accuracy unlocks advanced categories</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningCenter;