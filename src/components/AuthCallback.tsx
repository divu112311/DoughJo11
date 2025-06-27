import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const AuthCallback: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');

      if (type === 'recovery' && accessToken) {
        // Handle password reset
        localStorage.setItem('supabase-reset-token', accessToken);
        window.location.href = '/reset-password';
      } else if (accessToken && refreshToken) {
        // Handle OAuth callback
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#2A6F68] border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-[#333333]">Completing authentication...</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;