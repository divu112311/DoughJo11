import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, Loader, Settings, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onError?: (error: any) => void;
  userId: string;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess, onError, userId }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupInstructions, setSetupInstructions] = useState(false);

  // Generate link token for Plaid sandbox
  const generateLinkToken = async () => {
    setLoading(true);
    setError(null);
    setSetupInstructions(false);

    try {
      console.log('Creating Plaid link token...');
      
      const { data, error: functionError } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { userId },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        if (functionError.message?.includes('not found') || functionError.message?.includes('404')) {
          throw new Error('Plaid Edge Functions not deployed. Please deploy the functions first.');
        }
        throw new Error(functionError.message || 'Failed to create link token');
      }

      if (data?.error) {
        console.error('Plaid API error:', data.error);
        if (data.error.includes('not configured') || data.error.includes('credentials')) {
          throw new Error('Plaid credentials not configured in Supabase secrets');
        }
        throw new Error(data.error);
      }

      console.log('Link token created successfully');
      setLinkToken(data.link_token);
    } catch (err: any) {
      console.error('Link token error:', err);
      setError(err.message);
      setSetupInstructions(true);
    } finally {
      setLoading(false);
    }
  };

  // Plaid Link configuration
  const config = {
    token: linkToken,
    onSuccess: async (publicToken: string, metadata: any) => {
      console.log('Plaid Link success:', { publicToken, metadata });
      
      try {
        setLoading(true);
        
        // Call our exchange token function
        const { data, error: exchangeError } = await supabase.functions.invoke('plaid-exchange-token', {
          body: {
            publicToken,
            userId,
            institutionName: metadata.institution?.name || 'Unknown Bank',
            accounts: metadata.accounts || []
          },
        });

        if (exchangeError) {
          throw new Error(exchangeError.message || 'Failed to exchange token');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        console.log('Token exchange successful:', data);
        onSuccess(publicToken, metadata);
      } catch (err: any) {
        console.error('Token exchange error:', err);
        setError(err.message || 'Failed to connect accounts');
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
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

  // Handle Plaid connection
  const handlePlaidConnect = useCallback(() => {
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

      {/* Setup Instructions */}
      {setupInstructions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2 mb-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">🔧 Plaid Setup Required</p>
              <p className="mb-3">To connect real bank accounts, you need to:</p>
              
              <div className="bg-blue-100 rounded-lg p-3 mb-3">
                <p className="font-medium mb-2">Quick Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Get Plaid credentials from <a href="https://dashboard.plaid.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.plaid.com</a></li>
                  <li>Add credentials to <strong>Supabase → Settings → Secrets</strong></li>
                  <li>Deploy the 3 Edge Functions via <strong>Supabase Dashboard</strong></li>
                  <li>Test with real Plaid sandbox banks</li>
                </ol>
              </div>
              
              <div className="text-xs text-blue-700">
                <p className="mb-2"><strong>Required Supabase Secrets:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>PLAID_CLIENT_ID</code> - Your Plaid client ID</li>
                  <li><code>PLAID_SECRET</code> - Your Plaid sandbox secret</li>
                  <li><code>PLAID_ENV</code> - Set to "sandbox"</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePlaidConnect}
        disabled={loading || (linkToken && !ready)}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Connecting to Plaid...</span>
          </>
        ) : linkToken && !ready ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Loading Plaid...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Connect Bank Account</span>
          </>
        )}
      </motion.button>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">
          🔧 Connect to real Plaid sandbox with test institutions
        </p>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Use credentials: <strong>user_good</strong> / <strong>pass_good</strong></div>
          <div>Or select "First Platypus Bank" for instant connection</div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-xs text-yellow-800">
          <p className="font-medium mb-1">🚀 Quick Plaid Setup:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to <strong>Supabase → Settings → Secrets</strong></li>
            <li>Add: <code>PLAID_CLIENT_ID</code>, <code>PLAID_SECRET</code>, <code>PLAID_ENV=sandbox</code></li>
            <li>Deploy Edge Functions via <strong>Supabase → Edge Functions</strong></li>
            <li>Copy function code from project files</li>
          </ol>
          <p className="mt-2 text-yellow-700">
            <strong>Need help?</strong> Check the detailed setup guide in your project files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaidLink;