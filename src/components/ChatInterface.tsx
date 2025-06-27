import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User as UserIcon, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Calculator, 
  PieChart, 
  BarChart3, 
  Lightbulb,
  Activity,
  Shield,
  CreditCard,
  Home,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useChat } from '../hooks/useChat';
import { useGoals } from '../hooks/useGoals';

interface ChatInterfaceProps {
  user: User;
  onXPUpdate: (points: number) => void;
}

interface FinancialMetric {
  label: string;
  value: string | number;
  target?: string | number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onXPUpdate }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'calculating'>('idle');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage } = useChat(user);
  const { goals } = useGoals(user);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mock financial data - in real app, this would come from connected accounts
  const financialMetrics: FinancialMetric[] = [
    {
      label: 'Overall Score',
      value: '7.2/10',
      status: 'good',
      icon: Activity,
      color: 'text-[#2A6F68]'
    },
    {
      label: 'Debt Ratio',
      value: '33%',
      target: '18%',
      status: 'warning',
      icon: CreditCard,
      color: 'text-[#B76E79]'
    },
    {
      label: 'Emergency Fund',
      value: '1.5 months',
      target: '4-6 months',
      status: 'critical',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      label: 'Savings Rate',
      value: '18%',
      target: '15%+',
      status: 'good',
      icon: TrendingUp,
      color: 'text-[#2A6F68]'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'debt-consolidation',
      label: 'Analyze debt consolidation options',
      description: 'Find ways to reduce interest payments',
      icon: Calculator,
      color: 'bg-gradient-to-r from-[#B76E79] to-rose-500',
      action: () => handleQuickAction('Analyze my debt consolidation options and show potential savings')
    },
    {
      id: 'investment-review',
      label: 'Review investment portfolio',
      description: 'Optimize your asset allocation',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-[#2A6F68] to-emerald-500',
      action: () => handleQuickAction('Review my investment portfolio and suggest optimizations')
    },
    {
      id: 'emergency-fund',
      label: 'Plan emergency fund strategy',
      description: 'Build financial security',
      icon: Shield,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      action: () => handleQuickAction('Help me create a plan to build my emergency fund to 6 months of expenses')
    },
    {
      id: 'house-purchase',
      label: 'Calculate house purchase timeline',
      description: 'Plan for homeownership',
      icon: Home,
      color: 'bg-gradient-to-r from-purple-500 to-violet-500',
      action: () => handleQuickAction('Calculate when I can afford to buy a house and what I need to save')
    },
    {
      id: 'tax-optimization',
      label: 'Optimize tax withholdings',
      description: 'Maximize your take-home pay',
      icon: Briefcase,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      action: () => handleQuickAction('Analyze my tax situation and suggest optimization strategies')
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setAiStatus('analyzing');

    await sendMessage(message, (points) => {
      setXpGained(points);
      onXPUpdate(points);
      setTimeout(() => setXpGained(null), 3000);
    });

    setAiStatus('idle');
  };

  const handleQuickAction = async (actionMessage: string) => {
    setAiStatus('calculating');
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
    "How much should I save for retirement each month?",
    "Show me ways to optimize my tax situation"
  ];

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-[#2A6F68]';
      case 'warning': return 'text-[#B76E79]';
      case 'critical': return 'text-red-600';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-[#2A6F68]/10';
      case 'warning': return 'bg-[#B76E79]/10';
      case 'critical': return 'bg-red-50';
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] max-w-7xl mx-auto gap-6">
      {/* XP Gained Animation */}
      <AnimatePresence>
        {xpGained && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 right-4 bg-[#2A6F68] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
          >
            <Zap className="h-4 w-4 text-yellow-300" />
            <span>+{xpGained} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Financial AI Section */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* AI Status Header */}
            <div className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] p-4 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <img 
                    src="/finapp.png" 
                    alt="Financial AI" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Financial AI</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      aiStatus === 'idle' ? 'bg-green-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-sm text-white/90">
                      {aiStatus === 'idle' ? 'Active' : 
                       aiStatus === 'analyzing' ? 'Analyzing...' : 'Running calculations...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* User Analysis Header */}
              <div className="text-center">
                <h4 className="text-lg font-bold text-[#333333] mb-1">
                  {user.user_metadata?.full_name || 'Your'} Financial Analysis
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Net Worth: $22,000 • Monthly Savings: $1,883</div>
                  <div>Goals: {goals.length} active</div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs">AI analyzing in real-time</span>
                  </div>
                </div>
              </div>

              {/* Financial Health */}
              <div>
                <h3 className="font-semibold text-[#333333] mb-4">Financial Health</h3>
                <div className="space-y-3">
                  {financialMetrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    return (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg ${getStatusBg(metric.status)} border border-gray-200`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                            <span className="text-sm font-medium text-[#333333]">{metric.label}</span>
                          </div>
                          <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                            {metric.value}
                          </span>
                        </div>
                        {metric.target && (
                          <div className="text-xs text-gray-600">
                            Target: {metric.target}
                          </div>
                        )}
                        {metric.label === 'Overall Score' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-[#2A6F68] h-2 rounded-full" style={{ width: '72%' }} />
                          </div>
                        )}
                        {metric.label === 'Debt Ratio' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-[#B76E79] h-2 rounded-full" style={{ width: '33%' }} />
                          </div>
                        )}
                        {metric.label === 'Emergency Fund' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold text-[#333333] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                        disabled={loading || aiStatus !== 'idle'}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#333333] mb-1">
                              {action.label}
                            </div>
                            <div className="text-xs text-gray-600">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Goals Summary */}
              {goals.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#333333] mb-4">Active Goals</h3>
                  <div className="space-y-2">
                    {goals.slice(0, 3).map((goal) => {
                      const progress = goal.target_amount 
                        ? ((goal.saved_amount || 0) / goal.target_amount) * 100 
                        : 0;
                      
                      return (
                        <div key={goal.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#333333]">{goal.name}</span>
                            <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            ${(goal.saved_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-gray-200"
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
                className="w-12 h-12 bg-gradient-to-br from-[#2A6F68] to-[#B76E79] rounded-full flex items-center justify-center p-1"
              >
                <img 
                  src="/finapp.png" 
                  alt="DoughJo Sensei" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-[#333333]">
                  Sensei <span className="text-[#2A6F68]">DoughJo</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Your AI Financial Sensei
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-500 hover:text-[#2A6F68] transition-colors rounded-lg hover:bg-gray-100"
                title="Toggle Financial AI Panel"
              >
                <PieChart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

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
                className="w-20 h-20 mx-auto mb-4"
              >
                <img 
                  src="/finapp.png" 
                  alt="DoughJo Sensei" 
                  className="w-full h-full object-contain opacity-70"
                />
              </motion.div>
              <p className="text-gray-500 mb-6">
                Welcome to the dojo, young grasshopper! Ask me anything about your financial journey. 
                Together, we'll master the ancient art of money management! 🥋💰
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputMessage(question)}
                    className="p-4 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#2A6F68]/5 hover:to-[#B76E79]/5 rounded-lg text-sm text-[#333333] transition-all border border-gray-200 hover:border-[#2A6F68]/20"
                  >
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-[#2A6F68] mt-0.5 flex-shrink-0" />
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
                className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-[#2A6F68] text-white rounded-br-sm'
                    : 'bg-gray-50 text-[#333333] rounded-bl-sm border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender !== 'user' && (
                    <div className="w-6 h-6 mt-1 flex-shrink-0">
                      <img 
                        src="/finapp.png" 
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
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-yellow-400">33%</div>
                          <div className="text-xs opacity-80">Current DTI</div>
                          <div className="text-xs opacity-60">Target: 18%</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-red-400">1.5</div>
                          <div className="text-xs opacity-80">Emergency Fund</div>
                          <div className="text-xs opacity-60">Target: 4-6 months</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-green-400">18%</div>
                          <div className="text-xs opacity-80">Savings Rate</div>
                          <div className="text-xs opacity-60">Target: 15%+</div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons for AI responses */}
                    {message.sender === 'assistant' && message.message && message.message.includes('consolidate') && (
                      <div className="mt-3">
                        <button className="bg-gradient-to-r from-[#B76E79] to-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                          Debt Consolidation Analysis
                        </button>
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
              <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6">
                    <img 
                      src="/finapp.png" 
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
                        className="w-2 h-2 bg-[#B76E79] rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
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
          className="p-6 border-t border-gray-200"
        >
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sensei DoughJo for financial wisdom..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent resize-none transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="bg-[#2A6F68] text-white p-3 rounded-lg hover:bg-[#235A54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;