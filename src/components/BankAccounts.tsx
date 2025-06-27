import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown,
  Building,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign,
  Info
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import PlaidLink from './PlaidLink';
import { supabase, createTimeoutQuery, isSupabaseConfigured, testConnection } from '../lib/supabase';

interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  institution_name: string;
  mask: string;
  last_updated: string;
  plaid_account_id: string;
}

interface BankAccountsProps {
  user: User;
}

const BankAccounts: React.FC<BankAccountsProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    } else {
      setLoading(false);
      setAccounts([]);
      setError(null);
    }
  }, [user?.id]); // Only depend on user.id

  const fetchAccounts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching accounts for user:', user.id);
      
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error('Unable to connect to database. Please check your Supabase configuration.');
      }

      const queryPromise = supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await createTimeoutQuery(
        queryPromise,
        30000, // Increased timeout to 30 seconds
        'Bank accounts query timeout - please check your connection'
      );

      if (fetchError) {
        console.error('Database error:', fetchError);
        throw new Error(`Failed to load accounts: ${fetchError.message}`);
      }

      console.log('Accounts fetched successfully:', data?.length || 0);
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load bank accounts';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout - please check your internet connection and try again. If this persists, the Supabase service may be unavailable.';
      } else if (error.message.includes('Supabase is not properly configured')) {
        errorMessage = 'Database not configured - please set up your Supabase connection';
      } else if (error.message.includes('Unable to connect to database')) {
        errorMessage = 'Cannot connect to database - please verify your Supabase URL and API key are correct';
      } else if (error.message.includes('Failed to load accounts')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      // Set empty accounts on error so UI doesn't stay in loading state
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Bank connection successful:', { publicToken, metadata });
      
      // For demo mode, accounts are already created in PlaidLink component
      // For real Plaid, you'd call your backend API here to exchange tokens
      
      // Refresh accounts list to show the newly connected accounts
      await fetchAccounts();
      setShowPlaidLink(false);
      
    } catch (error: any) {
      console.error('Error handling bank connection:', error);
      setError('Failed to connect bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidError = (error: any) => {
    console.error('Plaid connection error:', error);
    setError('Failed to connect to bank. Please try again.');
    setShowPlaidLink(false);
  };

  const handleRefreshAccounts = async () => {
    setRefreshing(true);
    setError(null);
    try {
      // Simulate refreshing account balances
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call Plaid API to get updated balances
      // For demo, we'll add some realistic variation to existing balances
      const updatedAccounts = accounts.map(account => {
        let newBalance = account.balance;
        
        // Add realistic balance changes based on account type
        if (account.type === 'depository') {
          if (account.subtype === 'checking') {
            // Checking: small random transactions
            newBalance += (Math.random() - 0.5) * 200;
          } else if (account.subtype === 'savings') {
            // Savings: small positive growth
            newBalance += Math.random() * 50;
          }
        } else if (account.type === 'credit') {
          // Credit cards: small spending changes
          newBalance -= Math.random() * 100;
        }
        
        return {
          ...account,
          balance: Math.round(newBalance * 100) / 100, // Round to 2 decimals
          last_updated: new Date().toISOString()
        };
      });

      // Update balances in database
      for (const account of updatedAccounts) {
        const updatePromise = supabase
          .from('bank_accounts')
          .update({
            balance: account.balance,
            last_updated: account.last_updated
          })
          .eq('id', account.id);

        await createTimeoutQuery(
          updatePromise,
          20000, // Increased timeout
          'Update account timeout'
        );
      }

      await fetchAccounts();
    } catch (error: any) {
      console.error('Error refreshing accounts:', error);
      setError('Failed to refresh account balances');
    } finally {
      setRefreshing(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    if (!user?.id) {
      console.warn('Cannot remove account - missing user ID');
      return;
    }

    try {
      setError(null);
      
      const deletePromise = supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      const { error } = await createTimeoutQuery(
        deletePromise,
        20000, // Increased timeout
        'Delete account timeout'
      );

      if (error) throw error;
      
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (error: any) {
      console.error('Error removing account:', error);
      setError('Failed to remove account');
    }
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(balance));
  };

  const getAccountIcon = (type: string, subtype: string) => {
    if (type === 'credit') return <CreditCard className="h-5 w-5 text-orange-500" />;
    if (subtype === 'checking') return <Building className="h-5 w-5 text-blue-500" />;
    if (subtype === 'savings') return <TrendingUp className="h-5 w-5 text-green-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  };

  const getBalanceColor = (balance: number, type: string) => {
    if (type === 'credit') {
      return balance < 0 ? 'text-orange-600' : 'text-green-600';
    }
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getAccountTypeLabel = (type: string, subtype: string) => {
    if (type === 'credit') return 'Credit Card';
    if (subtype === 'checking') return 'Checking';
    if (subtype === 'savings') return 'Savings';
    return 'Account';
  };

  const totalBalance = accounts
    .filter(account => account.type !== 'credit')
    .reduce((sum, account) => sum + account.balance, 0);

  const totalCredit = accounts
    .filter(account => account.type === 'credit')
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  const isDemoAccount = (account: Account) => {
    return account.plaid_account_id.startsWith('demo_');
  };

  // Show loading only for initial load
  if (loading && accounts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#2A6F68] border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-600">Loading bank accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#333333]">Connected Accounts</h3>
          <p className="text-sm text-gray-600">
            {accounts.length > 0 
              ? `${accounts.length} connected account${accounts.length !== 1 ? 's' : ''}`
              : 'No accounts connected yet'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {accounts.length > 0 && (
            <>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="p-2 text-gray-500 hover:text-[#2A6F68] transition-colors"
                title={showBalances ? 'Hide balances' : 'Show balances'}
              >
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={handleRefreshAccounts}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-[#2A6F68] transition-colors disabled:opacity-50"
                title="Refresh account data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaidLink(true)}
            className="flex items-center space-x-2 bg-[#2A6F68] text-white px-4 py-2 rounded-lg hover:bg-[#235A54] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Account</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Start Guide for New Users */}
      {accounts.length === 0 && !loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2">🚀 Quick Start: Connect Your First Account</h4>
              <p className="text-blue-800 text-sm mb-4">
                DoughJo can automatically track your finances by securely connecting to your bank accounts.
                Choose your preferred connection method:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🎭</span>
                    <span className="font-medium text-blue-900">Demo Mode</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Perfect for testing and demos</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Chase Checking ($2,500)</li>
                    <li>• Chase Savings ($15,000)</li>
                    <li>• Credit Card (-$850)</li>
                  </ul>
                </div>
                
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🏦</span>
                    <span className="font-medium text-blue-900">Plaid Sandbox</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Real Plaid integration testing</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Real test banks</li>
                    <li>• user_good / pass_good</li>
                    <li>• Production-ready</li>
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPlaidLink(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Connect Your First Account →
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Summary Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-xl p-6 text-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">Total Assets</p>
                <p className="text-2xl font-bold">
                  {showBalances ? formatBalance(totalBalance) : '••••••'}
                </p>
                <p className="text-white/70 text-xs mt-1">
                  Checking + Savings accounts
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          {/* Credit Card Debt */}
          {totalCredit > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Credit Card Debt</p>
                  <p className="text-2xl font-bold">
                    {showBalances ? formatBalance(totalCredit) : '••••••'}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Total amount owed
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        {accounts.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-[#333333] mb-2">Ready to connect?</h4>
            <p className="text-gray-600 mb-4">
              Choose between demo accounts or real Plaid sandbox integration
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlaidLink(true)}
              className="bg-[#2A6F68] text-white px-6 py-2 rounded-lg hover:bg-[#235A54] transition-colors"
            >
              Get Started
            </motion.button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {accounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-100 transition-colors bg-white first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAccountIcon(account.type, account.subtype)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-[#333333]">
                          {account.name}
                        </h4>
                        {isDemoAccount(account) && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {account.institution_name} • {getAccountTypeLabel(account.type, account.subtype)} ••••{account.mask}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`font-semibold ${getBalanceColor(account.balance, account.type)}`}>
                        {showBalances ? (
                          <>
                            {account.type === 'credit' && account.balance < 0 ? '-' : ''}
                            {formatBalance(account.balance)}
                            {account.type === 'credit' && (
                              <span className="text-xs text-gray-500 ml-1">
                                {account.balance < 0 ? 'owed' : 'available'}
                              </span>
                            )}
                          </>
                        ) : (
                          '••••••'
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(account.last_updated).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Plaid Link Modal */}
      <AnimatePresence>
        {showPlaidLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#2A6F68]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-[#2A6F68]" />
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">
                  Connect Bank Accounts
                </h3>
                <p className="text-gray-600">
                  Choose your connection method and start tracking your finances automatically
                </p>
              </div>

              <PlaidLink
                userId={user.id}
                onSuccess={handlePlaidSuccess}
                onError={handlePlaidError}
              />

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowPlaidLink(false)}
                  className="text-gray-500 hover:text-[#333333] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BankAccounts;