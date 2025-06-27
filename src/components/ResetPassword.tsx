import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasNumberOrSymbol;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with at least 1 number or symbol');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const resetToken = localStorage.getItem('supabase-reset-token');
      if (!resetToken) {
        throw new Error('Invalid reset token');
      }

      await updatePassword(resetToken, password);
      localStorage.removeItem('supabase-reset-token');
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F5F4F0] to-[#EBE9E4] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/40 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#333333] mb-2">Password Updated!</h2>
          <p className="text-gray-600 mb-4">
            Your password has been successfully updated. You will be redirected to the login page.
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#2A6F68] border-t-transparent rounded-full mx-auto"
          />
        </motion.div>
      </div>
    );
  }

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
            <div className="w-16 h-16 mr-3">
              <img 
                src="/asset/finapp.png" 
                alt="DoughJo Mascot" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#2A6F68]">DoughJo</h1>
          </div>
        </motion.div>

        {/* Form Card - More transparent and blended */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/40"
        >
          <h2 className="text-2xl font-bold text-[#333333] mb-6 text-center">
            Set New Password
          </h2>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
                  placeholder="Enter new password"
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
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-[#2A6F68] focus:border-transparent transition-all bg-white/40 backdrop-blur-sm placeholder-gray-500"
                  placeholder="Confirm new password"
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
                'Update Password'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-[#2A6F68] hover:text-[#235A54] transition-colors mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;