import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Lock } from 'lucide-react';

const SecurityBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-brand-teal/5 to-brand-rosegold/5 border border-brand-teal/20 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-teal/10 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-brand-teal" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-charcoal-800">🏦 Bank-Level Security Active</h4>
            <p className="text-xs text-charcoal-600">
              Auto-logout after 5 minutes of inactivity • Session monitoring enabled
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-charcoal-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>5min timeout</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock className="h-3 w-3" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityBanner;