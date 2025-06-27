import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface SessionWarningModalProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onLogout
}) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-red-200"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-charcoal-800 mb-2">
                🔒 Security Alert
              </h2>
              <p className="text-charcoal-600 text-sm">
                Your session will expire soon due to inactivity
              </p>
            </div>

            {/* Countdown */}
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-center border border-red-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Time Remaining</span>
              </div>
              <motion.div
                key={timeRemaining}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-red-600"
              >
                {formatTime(timeRemaining)}
              </motion.div>
            </div>

            {/* Security Message */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why does this happen?</p>
                  <p>For your security, DoughJo automatically logs you out after 5 minutes of inactivity. This protects your financial data if you step away from your device.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExtendSession}
                className="flex-1 bg-brand-teal text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md"
              >
                Stay Logged In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="flex-1 bg-grey-200 text-charcoal-700 py-3 px-4 rounded-lg font-medium hover:bg-grey-300 transition-colors"
              >
                Logout Now
              </motion.button>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-charcoal-500">
                This is a security feature to protect your financial information
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionWarningModal;