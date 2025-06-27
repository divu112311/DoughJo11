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
  AlertCircle
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import PlaidLink from './PlaidLink';
import { supabase } from '../lib/supabase';

interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  institution_name: string;
  mask: string;
  last_updated: string;
}

interface BankAccountsProps {
  user: User;
}

const BankAccounts: React.FC<BankAccountsProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true);
      console.log('Bank connection successful:', { publicToken, metadata });
      
      // Refresh accounts list to show the newly connected accounts
      await fetchAccounts();
      setShowPlaidLink(false);
      
    } catch (error) {
      console.error('Error handling bank connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAccounts = async () => {
    setRefreshing(true);
    try {
      // Simulate refreshing account balances
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call Plaid API to get updated balances
      // For demo, we'll just add some random variation to existing balances
      const updatedAccounts = accounts.map(account => ({
        ...account,
        balance: account.balance + (Math.random() - 0.5) * 100, // Random variation
        last_updated: new Date().toISOString()
      }));

      // Update balances in database
      for (const account of updatedAccounts) {
        await supabase
          .from('bank_accounts')
          .update({
            balance: account.balance,
            last_updated: account.last_updated
          })
          .eq('id', account.id);
      }

      await fetchAccounts();
    } catch (error) {
      console.error('Error refreshing accounts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (error) {
      console.error('Error removing account:', error);
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
      return balance < 0 ? 'text-orange-600' : 'text-green-600'; // Negative is debt (bad), positive is credit (good)
    }
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const totalBalance = accounts
    .filter(account => account.type !== 'credit') // Exclude credit cards from total
    .reduce((sum, account) => sum + account.balance, 0);

  if (loading && accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#2A6F68] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#333333]">Bank Accounts</h3>
          <p className="text-sm text-gray-600">Manage your connected accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-500 hover:text-[#2A6F68] transition-colors"
            title={showBalances ? 'Hide balances' : 'Show balances'}
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {accounts.length > 0 && (
            <button
              onClick={handleRefreshAccounts}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-[#2A6F68] transition-colors disabled:opacity-50"
              title="Refresh account data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
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

      {/* Demo Notice */}
      {accounts.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Demo Mode</p>
              <p>Click "Add Account" to connect test bank accounts with realistic sample data. In production, this would connect to real banks via Plaid.</p>
            </div>
          </div>
        </div>
      )}

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#2A6F68] to-[#B76E79] rounded-xl p-6 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80 text-sm">Total Balance</p>
              <p className="text-2xl font-bold">
                {showBalances ? formatBalance(totalBalance) : '••••••'}
              </p>
              <p className="text-white/70 text-xs mt-1">
                Excludes credit card balances
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Accounts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {accounts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-[#333333] mb-2">No accounts connected</h4>
            <p className="text-gray-600 mb-4">
              Connect test bank accounts to see how automated financial tracking works
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlaidLink(true)}
              className="bg-[#2A6F68] text-white px-6 py-2 rounded-lg hover:bg-[#235A54] transition-colors"
            >
              Connect Test Accounts
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
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAccountIcon(account.type, account.subtype)}
                    <div>
                      <h4 className="font-medium text-[#333333]">
                        {account.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {account.institution_name} ••••{account.mask}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#2A6F68]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-[#2A6F68]" />
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">
                  Connect Bank Accounts
                </h3>
                <p className="text-gray-600">
                  Add test bank accounts to see how DoughJo tracks your finances
                </p>
              </div>

              <PlaidLink
                userId={user.id}
                onSuccess={handlePlaidSuccess}
                onError={(error) => console.error('Plaid error:', error)}
              />

              <div className="mt-4 text-center">
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