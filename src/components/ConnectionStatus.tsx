import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Settings
} from 'lucide-react';
import { testConnection, isSupabaseConfigured } from '../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorDetails(null);
    
    try {
      if (!isSupabaseConfigured) {
        setConnectionStatus('error');
        setErrorDetails('Supabase not configured - check environment variables');
        setIsVisible(true);
        return;
      }

      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      setLastChecked(new Date());
      
      // Show status briefly, then hide if connected
      setIsVisible(true);
      if (isConnected) {
        setTimeout(() => setIsVisible(false), 3000);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorDetails(error.message);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds if there's an issue
    const interval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        checkConnection();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'checking':
        return {
          icon: Loader,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          message: 'Checking connection...',
          animate: true
        };
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          message: 'Connected to Supabase',
          animate: false
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          message: 'Connection lost - retrying...',
          animate: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          message: errorDetails || 'Connection error',
          animate: false
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (!isVisible && connectionStatus === 'connected') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg`}>
            <div className="flex items-center space-x-3">
              <motion.div
                animate={config.animate ? { rotate: 360 } : {}}
                transition={config.animate ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <IconComponent className={`h-5 w-5 ${config.color}`} />
              </motion.div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${config.color}`}>
                  {config.message}
                </p>
                {lastChecked && connectionStatus === 'connected' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                )}
                {errorDetails && connectionStatus === 'error' && (
                  <p className="text-xs text-red-500 mt-1">
                    {errorDetails}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                {connectionStatus !== 'checking' && (
                  <button
                    onClick={checkConnection}
                    className={`p-1 ${config.color} hover:opacity-70 transition-opacity`}
                    title="Retry connection"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => setIsVisible(false)}
                  className={`p-1 ${config.color} hover:opacity-70 transition-opacity`}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Quick Actions for Error States */}
            {connectionStatus === 'error' && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex items-center space-x-2 text-xs text-red-600">
                  <Settings className="h-3 w-3" />
                  <span>Check your .env file and Supabase dashboard</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;