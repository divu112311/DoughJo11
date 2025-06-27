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
  TrendingUp
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
  category: 'budgeting' | 'investing' | 'saving' | 'debt' | 'insurance' | 'taxes';
  points: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  difficulty: string;
  xpEarned: number;
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

  const categories = [
    { id: 'budgeting', name: 'Budgeting & Planning', icon: '📊', color: 'from-blue-400 to-blue-600' },
    { id: 'investing', name: 'Investing', icon: '📈', color: 'from-green-400 to-green-600' },
    { id: 'saving', name: 'Saving Strategies', icon: '🏦', color: 'from-purple-400 to-purple-600' },
    { id: 'debt', name: 'Debt Management', icon: '💳', color: 'from-red-400 to-red-600' },
    { id: 'insurance', name: 'Insurance & Protection', icon: '🛡️', color: 'from-orange-400 to-orange-600' },
    { id: 'taxes', name: 'Tax Planning', icon: '📋', color: 'from-indigo-400 to-indigo-600' }
  ];

  const difficulties = [
    { id: 'beginner', name: 'White Belt', description: 'Basic concepts', points: 10 },
    { id: 'intermediate', name: 'Green Belt', description: 'Intermediate strategies', points: 20 },
    { id: 'advanced', name: 'Black Belt', description: 'Advanced techniques', points: 30 }
  ];

  // Sample questions - in a real app, these would come from a database
  const sampleQuestions: Question[] = [
    {
      id: '1',
      question: 'What is the recommended percentage of income to save for emergencies?',
      options: ['5-10%', '10-15%', '15-20%', '20-25%'],
      correctAnswer: 2,
      explanation: 'Financial experts recommend saving 15-20% of your income, with 3-6 months of expenses for emergencies.',
      difficulty: 'beginner',
      category: 'saving',
      points: 10
    },
    {
      id: '2',
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
      points: 10
    },
    {
      id: '3',
      question: 'Which debt repayment strategy focuses on paying off the smallest balance first?',
      options: ['Debt Avalanche', 'Debt Snowball', 'Debt Consolidation', 'Minimum Payment Strategy'],
      correctAnswer: 1,
      explanation: 'The Debt Snowball method focuses on paying off the smallest debt first to build momentum and motivation.',
      difficulty: 'intermediate',
      category: 'debt',
      points: 20
    },
    {
      id: '4',
      question: 'What is the maximum annual contribution to a 401(k) in 2024?',
      options: ['$19,500', '$22,500', '$23,000', '$25,000'],
      correctAnswer: 2,
      explanation: 'The 2024 401(k) contribution limit is $23,000 for those under 50, with an additional $7,500 catch-up contribution for those 50 and older.',
      difficulty: 'advanced',
      category: 'investing',
      points: 30
    },
    {
      id: '5',
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
      points: 10
    }
  ];

  const startQuiz = (category: string, difficulty: string) => {
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    
    // Filter questions based on selection
    const filteredQuestions = sampleQuestions.filter(
      q => q.category === category && q.difficulty === difficulty
    );
    
    // If no questions for exact match, get questions from the category
    const questionsToUse = filteredQuestions.length > 0 
      ? filteredQuestions 
      : sampleQuestions.filter(q => q.category === category);
    
    setQuestions(questionsToUse.slice(0, 5)); // Limit to 5 questions
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
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
    
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = questions.reduce((sum, q, index) => 
      answers[index] === q.correctAnswer ? sum + q.points : sum, 0
    );

    const result: QuizResult = {
      score: Math.round((correctAnswers / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      xpEarned: earnedPoints
    };

    setQuizResult(result);
    setCurrentView('results');
    
    // Award XP
    onXPUpdate(earnedPoints);
    
    // Save quiz result to database (optional)
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
  };

  const getRecommendedDifficulty = () => {
    if (userLevel <= 5) return 'beginner';
    if (userLevel <= 15) return 'intermediate';
    return 'advanced';
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
                <h2 className="text-lg font-semibold text-[#333333]">Financial Quiz</h2>
                <p className="text-sm text-gray-600">
                  {categories.find(c => c.id === selectedCategory)?.name} - {difficulties.find(d => d.id === selectedDifficulty)?.name}
                </p>
              </div>
            </div>
            <button
              onClick={resetQuiz}
              className="text-gray-500 hover:text-[#333333] transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              className="bg-[#2A6F68] h-2 rounded-full transition-all duration-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-b-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
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
                      buttonClass += "border-gray-200 hover:border-gray-300 text-[#333333]";
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
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
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
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#333333] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Overview</span>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
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
          </div>

          {/* Performance Message */}
          <div className="mb-6">
            {quizResult.score >= 80 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">Excellent work, Financial Warrior!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  You've mastered these concepts. Ready for the next challenge?
                </p>
              </div>
            ) : quizResult.score >= 60 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-700">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Good progress!</span>
                </div>
                <p className="text-yellow-600 text-sm mt-1">
                  You're on the right track. Keep practicing to strengthen your knowledge.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Keep learning!</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Every expert was once a beginner. Review the concepts and try again.
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
        <h1 className="text-2xl font-bold text-[#333333] mb-2">Financial Dojo Training</h1>
        <p className="text-gray-600">
          Test your knowledge and earn XP with personalized financial quizzes
        </p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-[#2A6F68]/10 text-[#2A6F68] px-4 py-2 rounded-full text-sm">
          <Award className="h-4 w-4" />
          <span>Recommended: {difficulties.find(d => d.id === getRecommendedDifficulty())?.name}</span>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
              {category.icon}
            </div>
            <h3 className="text-lg font-semibold text-[#333333] mb-2">{category.name}</h3>
            
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <motion.button
                  key={difficulty.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz(category.id, difficulty.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-[#333333]">{difficulty.name}</div>
                    <div className="text-sm text-gray-600">{difficulty.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 text-[#B76E79]">
                    <span className="text-sm font-medium">+{difficulty.points} XP</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[#2A6F68]/5 to-[#B76E79]/5 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-[#333333] mb-3">Training Tips from Sensei DoughJo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Target className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Start with your recommended difficulty level and work your way up</span>
          </div>
          <div className="flex items-start space-x-2">
            <Brain className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Read explanations carefully to deepen your understanding</span>
          </div>
          <div className="flex items-start space-x-2">
            <Trophy className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Retake quizzes to reinforce learning and earn more XP</span>
          </div>
          <div className="flex items-start space-x-2">
            <Star className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
            <span>Apply what you learn to your real financial decisions</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningCenter;