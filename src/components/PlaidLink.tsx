import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Loader, Info } from 'lucide-react';
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
  const [mode, setMode] = useState<'demo' | 'sandbox'>('demo');

  // Generate link token for real Plaid sandbox
  const generateLinkToken = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creating Plaid link token...');
      
      const { data, error: functionError } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { userId },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to create link token');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Link token created successfully');
      setLinkToken(data.link_token);
    } catch (err: any) {
      console.error('Link token error:', err);
      setError('Plaid sandbox not configured. Using demo mode instead.');
      setMode('demo');
    } finally {
      setLoading(false);
    }
  };

  // Plaid Link configuration for sandbox
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

  // Handle real Plaid sandbox connection
  const handlePlaidConnect = useCallback(() => {
    if (!linkToken) {
      generateLinkToken();
    } else if (ready) {
      open();
    }
  }, [linkToken, ready, open]);

  // Demo connection (existing functionality)
  const handleDemoConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate Plaid connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create test bank accounts directly in Supabase
      const testAccounts = [
        {
          user_id: userId,
          plaid_account_id: 'demo_checking_001',
          plaid_access_token: 'access-demo-test-token',
          name: 'Chase Checking',
          type: 'depository',
          subtype: 'checking',
          balance: 2500.75,
          institution_name: 'Chase Bank',
          institution_id: 'ins_56',
          mask: '0000',
          last_updated: new Date().toISOString(),
        },
        {
          user_id: userId,
          plaid_account_id: 'demo_savings_001',
          plaid_access_token: 'access-demo-test-token',
          name: 'Chase Savings',
          type: 'depository',
          subtype: 'savings',
          balance: 15000.00,
          institution_name: 'Chase Bank',
          institution_id: 'ins_56',
          mask: '1111',
          last_updated: new Date().toISOString(),
        },
        {
          user_id: userId,
          plaid_account_id: 'demo_credit_001',
          plaid_access_token: 'access-demo-test-token',
          name: 'Chase Freedom Credit Card',
          type: 'credit',
          subtype: 'credit card',
          balance: -850.25,
          institution_name: 'Chase Bank',
          institution_id: 'ins_56',
          mask: '2222',
          last_updated: new Date().toISOString(),
        }
      ];

      // Insert test accounts into database
      const { data, error: dbError } = await supabase
        .from('bank_accounts')
        .insert(testAccounts)
        .select();

      if (dbError) {
        if (dbError.code === '23505') {
          console.log('Demo accounts already exist, updating balances...');
          
          for (const account of testAccounts) {
            await supabase
              .from('bank_accounts')
              .update({
                balance: account.balance,
                last_updated: account.last_updated
              })
              .eq('user_id', userId)
              .eq('plaid_account_id', account.plaid_account_id);
          }
        } else {
          throw dbError;
        }
      }

      // Simulate successful Plaid response
      const mockMetadata = {
        institution: {
          name: 'Chase Bank',
          institution_id: 'ins_56'
        },
        accounts: testAccounts.map(acc => ({
          id: acc.plaid_account_id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask
        }))
      };

      onSuccess('public-demo-test-token', mockMetadata);
      
    } catch (err: any) {
      console.error('Demo connection error:', err);
      setError(err.message || 'Failed to connect demo accounts');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, onSuccess, onError]);

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

      {/* Mode Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2 mb-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Connection Options</p>
            <p>Choose how you want to connect bank accounts:</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setMode('sandbox')}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              mode === 'sandbox' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Real Plaid Sandbox</div>
            <div className="text-xs text-gray-600">Connect to actual Plaid test banks</div>
          </button>
          
          <button
            onClick={() => setMode('demo')}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              mode === 'demo' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Demo Mode</div>
            <div className="text-xs text-gray-600">Simulated accounts with test data</div>
          </button>
        </div>
      </div>

      {/* Connection Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={mode === 'sandbox' ? handlePlaidConnect : handleDemoConnection}
        disabled={loading || (mode === 'sandbox' && linkToken && !ready)}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>
              {mode === 'sandbox' ? 'Connecting to Plaid...' : 'Connecting Demo Accounts...'}
            </span>
          </>
        ) : mode === 'sandbox' && linkToken && !ready ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Loading Plaid...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>
              {mode === 'sandbox' ? 'Connect via Plaid Sandbox' : 'Connect Demo Accounts'}
            </span>
          </>
        )}
      </motion.button>

      {/* Instructions */}
      <div className="text-center">
        {mode === 'sandbox' ? (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              🔒 Real Plaid sandbox with test institutions
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Use credentials: <strong>user_good</strong> / <strong>pass_good</strong></div>
              <div>Or select "First Platypus Bank" for instant connection</div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              🎭 Demo accounts with realistic test data
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Chase Checking ($2,500)</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Chase Savings ($15,000)</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-orange-500" />
                <span>Credit Card (-$850)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaidLink;