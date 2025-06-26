import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Award, Zap } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatInterfaceProps {
  user: User | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('luxefi-token');
      const response = await fetch('/api/chat-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      message: userMessage,
      is_user: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userChatMessage]);

    try {
      const token = localStorage.getItem('luxefi-token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          user_id: user?.id || '',
          message: data.message,
          is_user: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);

        // Show XP gained animation
        if (data.xpEarned) {
          setXpGained(data.xpEarned);
          setTimeout(() => setXpGained(null), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user?.id || '',
        message: 'Sorry, I encountered an error. Please try again.',
        is_user: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How's my spending this month?",
    "Should I invest more or save more?",
    "Help me create a budget",
    "What's my net worth looking like?",
    "Give me some investment advice"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
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

      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-2xl p-6 border-b border-gray-200"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2A6F68] to-[#B76E79] rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#333333]">LuxeBot</h2>
            <p className="text-sm text-gray-600">Your AI Financial Concierge</p>
          </div>
        </div>
        <p className="text-[#666666] text-sm">
          Ask me anything about your finances, investments, or goals. I'm here to help you make smarter money decisions!
        </p>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 bg-white overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Bot className="h-16 w-16 text-[#B76E79] mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-6">Start a conversation with LuxeBot!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputMessage(question)}
                  className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-[#333333] transition-colors border border-gray-200"
                >
                  {question}
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
            className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.is_user
                  ? 'bg-[#2A6F68] text-white rounded-br-sm'
                  : 'bg-gray-100 text-[#333333] rounded-bl-sm'
              }`}
            >
              <div className="flex items-start space-x-2">
                {!message.is_user && (
                  <Bot className="h-4 w-4 mt-1 text-[#B76E79] flex-shrink-0" />
                )}
                <p className="text-sm leading-relaxed">{message.message}</p>
                {message.is_user && (
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
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-[#B76E79]" />
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
        className="bg-white rounded-b-2xl p-6 border-t border-gray-200"
      >
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your finances..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent resize-none transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="bg-[#2A6F68] text-white p-3 rounded-lg hover:bg-[#235A54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;