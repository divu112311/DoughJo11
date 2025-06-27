import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'email-verification' | 'check-email';

const LoginForm: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    resetToken: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, loading } = useAuth();

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasNumberOrSymbol;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isBlocked) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }

    try {
      switch (currentView) {
        case 'login':
          if (!validateEmail(formState.email)) {
            setError('Please enter a valid email address');
            return;
          }
          
          try {
            await signIn(formState.email, formState.password);
            setLoginAttempts(0);
          } catch (err: any) {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            
            if (newAttempts >= 5) {
              setIsBlocked(true);
              setTimeout(() => {
                setIsBlocked(false);
                setLoginAttempts(0);
              }, 300000); // 5 minutes
              setError('Account temporarily locked due to multiple failed attempts');
            } else {
              setError('Invalid credentials. Please check your email and password.');
            }
          }
          break;

        case 'signup':
          if (!validateEmail(formState.email)) {
            setError('Please enter a valid email address');
            return;
          }
          
          if (!validatePassword(formState.password)) {
            setError('Password must be at least 8 characters with at least 1 number or symbol');
            return;
          }
          
          if (formState.password !== formState.confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          
          if (!formState.fullName.trim()) {
            setError('Please enter your full name');
            return;
          }

          await signUp(formState.email, formState.password, formState.fullName);
          setCurrentView('email-verification');
          break;

        case 'forgot-password':
          if (!validateEmail(formState.email)) {
            setError('Please enter a valid email address');
            return;
          }
          
          await resetPassword(formState.email);
          setCurrentView('check-email');
          break;

        case 'reset-password':
          if (!validatePassword(formState.password)) {
            setError('Password must be at least 8 characters with at least 1 number or symbol');
            return;
          }
          
          if (formState.password !== formState.confirmPassword) {
            setError('Passwords do not match');
            return;
          }

          await updatePassword(formState.resetToken, formState.password);
          setSuccess('Password updated successfully! You can now log in.');
          setCurrentView('login');
          break;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (err: any) {
      setGoogleLoading(false);
      if (err.message.includes('not configured')) {
        setError('Google sign-in setup required. Please contact support or use email/password login.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const renderLoginView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formState.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('forgot-password')}
            className="text-sm text-[#2A6F68] hover:text-[#235A54] mt-2 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || isBlocked || googleLoading}
          className="w-full bg-[#2A6F68] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#235A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
            />
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      {/* Google Sign In - Just Icon */}
      <div className="mt-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-full flex items-center justify-center hover:bg-white/90 hover:border-gray-300/60 transition-all disabled:opacity-50 shadow-sm"
        >
          {googleLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
            />
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
        </motion.button>
      </div>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          onClick={() => setCurrentView('signup')}
          className="text-[#2A6F68] hover:text-[#235A54] font-medium transition-colors"
        >
          Sign up
        </button>
      </div>
    </motion.div>
  );

  const renderSignUpView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formState.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formState.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            At least 8 characters with 1 number or symbol
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formState.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#2A6F68] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#235A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
            />
          ) : (
            'Create Account'
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={() => setCurrentView('login')}
          className="text-[#2A6F68] hover:text-[#235A54] font-medium transition-colors"
        >
          Sign in
        </button>
      </div>
    </motion.div>
  );

  const renderForgotPasswordView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#2A6F68]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-[#2A6F68]" />
        </div>
        <h3 className="text-xl font-bold text-[#333333] mb-2">Reset Password</h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
            placeholder="Enter your email"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-[#2A6F68] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#235A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
            />
          ) : (
            'Send Reset Link'
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentView('login')}
          className="flex items-center space-x-2 text-[#2A6F68] hover:text-[#235A54] transition-colors mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </motion.div>
  );

  const renderCheckEmailView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-[#333333] mb-2">Check Your Email</h3>
      <p className="text-gray-600 mb-4">
        We've sent a password reset link to <strong>{formState.email}</strong>
      </p>
      <p className="text-sm text-gray-500 mb-6">
        The link will expire in 10 minutes. Check your spam folder if you don't see it.
      </p>
      
      <button
        onClick={() => setCurrentView('login')}
        className="flex items-center space-x-2 text-[#2A6F68] hover:text-[#235A54] transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Sign In</span>
      </button>
    </motion.div>
  );

  const renderEmailVerificationView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-[#333333] mb-2">Verify Your Email</h3>
      <p className="text-gray-600 mb-4">
        We've sent a verification link to <strong>{formState.email}</strong>
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Please check your email and click the verification link to activate your account.
      </p>
      
      <button
        onClick={() => setCurrentView('login')}
        className="flex items-center space-x-2 text-[#2A6F68] hover:text-[#235A54] transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Sign In</span>
      </button>
    </motion.div>
  );

  const getViewTitle = () => {
    switch (currentView) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'check-email': return 'Check Email';
      case 'email-verification': return 'Verify Email';
      default: return 'Welcome Back';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F5F4F0] to-[#EBE9E4] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-16 h-16 mr-3"
            >
              <img 
                src="/finapp.png" 
                alt="DoughJo Mascot" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <h1 className="text-4xl font-serif font-bold text-[#2A6F68]">DoughJo</h1>
          </div>
          <p className="text-[#666666] text-lg">Your AI Financial Sensei</p>
          <p className="text-[#888888] text-sm mt-2">Master your money with ancient wisdom and modern AI</p>
        </motion.div>

        {/* Form Card - More transparent and blended */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/40"
        >
          <h2 className="text-2xl font-bold text-[#333333] mb-6 text-center">
            {getViewTitle()}
          </h2>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-green-600 text-sm bg-green-50/80 backdrop-blur-sm p-3 rounded-lg mb-4 border border-green-200/50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 text-sm bg-red-50/80 backdrop-blur-sm p-3 rounded-lg mb-4 border border-red-200/50"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Rate Limit Warning */}
          {loginAttempts >= 3 && !isBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-orange-600 text-sm bg-orange-50/80 backdrop-blur-sm p-3 rounded-lg mb-4 border border-orange-200/50"
            >
              <Clock className="h-4 w-4" />
              <span>Warning: {5 - loginAttempts} attempts remaining before temporary lock</span>
            </motion.div>
          )}

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            {currentView === 'login' && renderLoginView()}
            {currentView === 'signup' && renderSignUpView()}
            {currentView === 'forgot-password' && renderForgotPasswordView()}
            {currentView === 'check-email' && renderCheckEmailView()}
            {currentView === 'email-verification' && renderEmailVerificationView()}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              "The way of the warrior is to stop trouble before it starts" - <span className="text-[#2A6F68] font-medium">DoughJo</span> Wisdom
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;