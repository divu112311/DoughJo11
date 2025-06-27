import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User as UserIcon, 
  Zap, 
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useChat } from '../hooks/useChat';
import WelcomeHeader from './WelcomeHeader';
import FinancialHealthDashboard from './FinancialHealthDashboard';
import FinancialAnalysis from './FinancialAnalysis';
import QuickActions from './QuickActions';
import AILearningInsights from './AILearningInsights';

interface ChatInterfaceProps {
  user: User;
  xp?: { points: number | null; badges: string[] | null } | null;
  onXPUpdate: (points: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, xp, onXPUpdate }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'calculating'>('idle');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, error, sendMessage, clearError } = useChat(user);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setAiStatus('analyzing');
    clearError();

    await sendMessage(message, (points) => {
      setXpGained(points);
      onXPUpdate(points);
      setTimeout(() => setXpGained(null), 3000);
    });

    setAiStatus('idle');
  };

  const handleQuickAction = async (actionMessage: string) => {
    setAiStatus('calculating');
    clearError();
    await sendMessage(actionMessage, (points) => {
      setXpGained(points);
      onXPUpdate(points);
      setTimeout(() => setXpGained(null), 3000);
    });
    setAiStatus('idle');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Analyze my financial health and show opportunities",
    "What's my debt-to-income ratio and how can I improve it?",
    "Create a personalized investment strategy for me",
    "How much should I save for retirement each month?"
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader user={user} xp={xp} />

      <div className="flex h-[calc(100vh-280px)] max-w-7xl mx-auto gap-6">
        {/* XP Gained Animation */}
        <AnimatePresence>
          {xpGained && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed top-20 right-4 bg-brand-teal text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
            >
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>+{xpGained} XP</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Sidebar - Quick Actions & AI Insights */}
        <AnimatePresence>
          {showLeftSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-1/3 shrink-0 hidden lg:block space-y-4 h-full overflow-y-auto"
            >
              <QuickActions onQuickAction={handleQuickAction} />
              <AILearningInsights compact={true} />
              <FinancialHealthDashboard compact={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className={`${showLeftSidebar && showRightSidebar ? 'w-1/3' : showLeftSidebar || showRightSidebar ? 'flex-1' : 'w-full'} flex flex-col bg-white rounded-2xl shadow-sm border border-grey-200 min-w-0 h-full`}>
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b border-grey-200 bg-gradient-to-r from-gold-50 to-warmyellow-50 rounded-t-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                  className="w-10 h-10 bg-gradient-to-br from-brand-teal to-brand-rosegold rounded-full flex items-center justify-center p-1"
                >
                  <img 
                    src="/asset/finapp.png" 
                    alt="DoughJo Sensei" 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-charcoal-800">
                    Sensei <span className="text-brand-teal">DoughJo</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-teal rounded-full" />
                    <span className="text-sm text-charcoal-600">
                      {aiStatus === 'idle' ? 'Ready to help' : 
                       aiStatus === 'analyzing' ? 'Analyzing...' : 'Calculating...'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                  className="p-2 text-charcoal-500 hover:text-brand-teal transition-colors rounded-lg hover:bg-gold-100 flex items-center space-x-1 lg:flex hidden"
                  title="Toggle Quick Actions Panel"
                >
                  {showLeftSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="text-sm hidden xl:block">
                    {showLeftSidebar ? 'Hide' : 'Show'} Actions
                  </span>
                </button>
                <button
                  onClick={() => setShowRightSidebar(!showRightSidebar)}
                  className="p-2 text-charcoal-500 hover:text-brand-teal transition-colors rounded-lg hover:bg-gold-100 flex items-center space-x-1 lg:flex hidden"
                  title="Toggle Financial Analysis Panel"
                >
                  <span className="text-sm hidden xl:block">
                    {showRightSidebar ? 'Hide' : 'Show'} Analysis
                  </span>
                  {showRightSidebar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-4 flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
            >
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <img 
                    src="/asset/finapp.png" 
                    alt="DoughJo Sensei" 
                    className="w-full h-full object-contain opacity-70"
                  />
                </motion.div>
                <p className="text-charcoal-600 mb-6 text-sm">
                  Welcome to the dojo! Ask me anything about your financial journey. 
                  Together, we'll master the ancient art of money management! 🥋💰
                </p>
                
                <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInputMessage(question)}
                      className="p-3 text-left bg-gradient-to-r from-gold-50 to-warmyellow-50 hover:from-rosegold-50 hover:to-teal-50 rounded-lg text-sm text-charcoal-700 transition-all border border-gold-200 hover:border-brand-teal"
                    >
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-brand-teal mt-0.5 flex-shrink-0" />
                        <span>{question}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-brand-teal text-white rounded-br-sm'
                      : 'bg-gradient-to-r from-gold-50 to-warmyellow-50 text-charcoal-800 rounded-bl-sm border border-gold-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender !== 'user' && (
                      <div className="w-5 h-5 mt-1 flex-shrink-0">
                        <img 
                          src="/asset/finapp.png" 
                          alt="DoughJo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      
                      {/* Enhanced AI responses with financial data */}
                      {message.sender === 'assistant' && message.message && message.message.includes('debt-to-income') && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-brand-rosegold">33%</div>
                            <div className="text-xs opacity-80">Current DTI</div>
                            <div className="text-xs opacity-60">Target: 18%</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-red-400">1.5</div>
                            <div className="text-xs opacity-80">Emergency Fund</div>
                            <div className="text-xs opacity-60">Target: 4-6 months</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-brand-teal">18%</div>
                            <div className="text-xs opacity-80">Savings Rate</div>
                            <div className="text-xs opacity-60">Target: 15%+</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <UserIcon className="h-4 w-4 mt-1 text-white/70 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-r from-gold-50 to-warmyellow-50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs border border-gold-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5">
                      <img 
                        src="/asset/finapp.png" 
                        alt="DoughJo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 bg-brand-rosegold rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-charcoal-600">
                      {aiStatus === 'analyzing' ? 'Analyzing...' : 'Calculating...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-grey-200 bg-gradient-to-r from-gold-50 to-warmyellow-50 rounded-b-2xl"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Sensei DoughJo for financial wisdom..."
                className="flex-1 p-3 rounded-lg border border-gold-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-sm placeholder-charcoal-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="p-3 rounded-lg bg-brand-teal text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Financial Analysis */}
        <AnimatePresence>
          {showRightSidebar && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/3 shrink-0 hidden lg:block h-full overflow-y-auto"
            >
              <FinancialAnalysis user={user} compact={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;