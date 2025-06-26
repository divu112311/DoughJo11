export interface User {
  id: string;
  email: string;
  name: string;
  age_range?: string;
  income_range?: string;
  financial_goals?: string;
  xp: number;
  level: number;
  badges?: string[];
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export interface Account {
  id: string;
  user_id: string;
  account_type: string;
  account_name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_user: boolean;
  timestamp: string;
}

export interface DashboardData {
  user: User;
  accounts: Account[];
  totalBalance: string;
  monthlySpending: string;
  recentTransactions: Transaction[];
  goals: Goal[];
  recentChats: ChatMessage[];
}