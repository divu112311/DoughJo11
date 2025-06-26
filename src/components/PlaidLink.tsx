import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onError?: (error: any) => void;
  userId: string;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess, onError, userId }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate link token
  const generateLinkToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize bank connection');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    token: linkToken,
    onSuccess: (publicToken: string, metadata: any) => {
      console.log('Plaid Link success:', { publicToken, metadata });
      onSuccess(publicToken, metadata);
    },
    onExit: (err: any, metadata: any) => {
      console.log('Plaid Link exit:', { err, metadata });
      if (err) {
        setError('Bank connection was cancelled or failed');
        if (onError) onError(err);
      }
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Plaid Link event:', eventName, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleConnect = useCallback(() => {
    if (!linkToken) {
      generateLinkToken();
    } else if (ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <div className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConnect}
        disabled={loading || (linkToken && !ready)}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Preparing Connection...</span>
          </>
        ) : linkToken && !ready ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Connect Bank Account</span>
          </>
        )}
      </motion.button>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">
          🔒 Bank-level security powered by Plaid
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Read-only access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaidLink;