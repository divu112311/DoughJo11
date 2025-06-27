import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onError?: (error: any) => void;
  userId: string;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess, onError, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll simulate a Plaid connection with test data
  const handleTestConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate Plaid connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create test bank accounts directly in Supabase
      const testAccounts = [
        {
          user_id: userId,
          plaid_account_id: 'test_checking_001',
          plaid_access_token: 'access-sandbox-test-token',
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
          plaid_account_id: 'test_savings_001',
          plaid_access_token: 'access-sandbox-test-token',
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
          plaid_account_id: 'test_credit_001',
          plaid_access_token: 'access-sandbox-test-token',
          name: 'Chase Freedom Credit Card',
          type: 'credit',
          subtype: 'credit card',
          balance: -850.25, // Negative for credit cards (amount owed)
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
        // If accounts already exist, just update them
        if (dbError.code === '23505') { // Unique constraint violation
          console.log('Test accounts already exist, updating balances...');
          
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

      onSuccess('public-sandbox-test-token', mockMetadata);
      
    } catch (err: any) {
      console.error('Test connection error:', err);
      setError(err.message || 'Failed to connect test accounts');
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Demo Mode</p>
            <p>This will connect test bank accounts with sample data. In production, this would connect to real Plaid accounts.</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTestConnection}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#2A6F68] to-[#B76E79] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Connecting Test Accounts...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Connect Test Bank Accounts</span>
          </>
        )}
      </motion.button>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">
          🔒 Demo accounts with realistic test data
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
    </div>
  );
};

export default PlaidLink;