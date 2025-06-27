import React from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';

interface SessionExpiredModalProps {
  isVisible: boolean;
  onReload: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isVisible,
  onReload
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-red-200"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            >
              <Shield className="h-8 w-8 text-red-600" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-charcoal-800 mb-2">
            🔒 Session Expired
          </h2>
          <p className="text-charcoal-600 text-sm">
            Your session has been automatically logged out for security
          </p>
        </div>

        {/* Security Information */}
        <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">Security Logout Triggered</p>
              <ul className="space-y-1 text-xs">
                <li>• 5+ minutes of inactivity detected</li>
                <li>• Session data has been cleared</li>
                <li>• Please log in again to continue</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Banking Security Message */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">🏦 Bank-Level Security</p>
            <p>DoughJo uses the same security standards as major banks to protect your financial data. Automatic logout prevents unauthorized access if you step away from your device.</p>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReload}
          className="w-full bg-brand-teal text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Return to Login</span>
        </motion.button>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-charcoal-500">
            Your data is secure and protected
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionExpiredModal;