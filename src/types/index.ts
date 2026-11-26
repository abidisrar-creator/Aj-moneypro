export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Mobile Wallet' | 'Other';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile_wallet' | 'savings' | 'credit_card' | 'other';
  openingBalance: number;
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // used only for internal transfers
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  description?: string;
  notes?: string;
  receiptImage?: string; // Base64 or URL
  isRecurring?: boolean;
  recurringScheduleId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  name: string;
  categoryId?: string; // 'all' or empty for overall budget
  amount: number;
  period: 'monthly' | 'weekly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  color: string;
  icon: string;
  contributions: SavingsContribution[];
}

export interface DebtRepayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
}

export interface Debt {
  id: string;
  type: 'borrowed' | 'lent'; // borrowed = I owe others; lent = others owe me
  personName: string;
  principalAmount: number;
  date: string;
  dueDate: string;
  notes?: string;
  status: 'active' | 'settled';
  repayments: DebtRepayment[];
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  lastProcessedDate?: string;
  isActive: boolean;
  autoProcess: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'budget_warning' | 'budget_exceeded' | 'bill_reminder' | 'debt_reminder' | 'savings_milestone' | 'info';
  date: string;
  read: boolean;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  theme: 'dark' | 'light' | 'system';
  accentColor?: string;
  privacyHideBalance: boolean;
  isPinEnabled: boolean;
  pinHash?: string;
  isBiometricEnabled: boolean;
  biometricCredentialId?: string;
  biometricType?: 'fingerprint' | 'face' | 'platform';
  defaultAccountId: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  budgetAlertsEnabled: boolean;
}

export type ActiveTab = 'home' | 'transactions' | 'reports' | 'budgets' | 'settings' | 'more';
export type SubScreen = 
  | null 
  | 'accounts' 
  | 'debts' 
  | 'savings' 
  | 'recurring' 
  | 'calendar' 
  | 'apk-hub' 
  | 'settings' 
  | 'notifications';
