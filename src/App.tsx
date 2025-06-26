import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import OnboardingFlow from './components/OnboardingFlow';
import { User, AuthState } from './types';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('chat');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('luxefi-token');
    if (token) {
      // Validate token with server
      fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Invalid token');
      })
      .then(data => {
        setUser(data.user);
        setAuthState('authenticated');
        
        // Check if onboarding is needed
        if (!data.user.age_range || !data.user.income_range) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {
        localStorage.removeItem('luxefi-token');
        setAuthState('unauthenticated');
      });
    } else {
      setAuthState('unauthenticated');
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('luxefi-token', token);
    setUser(userData);
    setAuthState('authenticated');
    
    // Check if onboarding is needed
    if (!userData.age_range || !userData.income_range) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('luxefi-token');
    setUser(null);
    setAuthState('unauthenticated');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#2A6F68] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.h1 
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-serif font-bold text-[#333333]"
              >
                LuxeFi
              </motion.h1>
              <div className="flex items-center space-x-2 bg-[#2A6F68] text-white px-3 py-1 rounded-full text-sm">
                <span>Level {user?.level || 1}</span>
                <span className="text-[#B76E79]">•</span>
                <span>{user?.xp || 0} XP</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'chat'
                      ? 'bg-[#2A6F68] text-white'
                      : 'text-[#333333] hover:bg-gray-100'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-[#2A6F68] text-white'
                      : 'text-[#333333] hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
              </nav>
              
              <button
                onClick={handleLogout}
                className="text-[#333333] hover:text-[#B76E79] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeView === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;