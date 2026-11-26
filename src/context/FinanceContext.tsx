import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  Debt,
  RecurringTransaction,
  AppSettings,
  AppNotification,
  ActiveTab,
  SubScreen,
  TransactionType,
} from '../types';
import { StorageService } from '../services/storage';
import {
  BiometricService,
  BiometricAvailability,
  BiometricResult,
} from '../services/biometricService';

interface FinanceContextType {
  // State
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  recurring: RecurringTransaction[];
  settings: AppSettings;
  notifications: AppNotification[];
  activeTab: ActiveTab;
  subScreen: SubScreen;
  isPinLocked: boolean;
  biometricAvailability: BiometricAvailability | null;
  isBiometricAuthenticating: boolean;
  biometricError: string | null;
  isAddModalOpen: boolean;
  addModalInitialType: TransactionType;
  isTransferModalOpen: boolean;
  editingTransaction: Transaction | null;

  // Setters & Navigation
  setActiveTab: (tab: ActiveTab) => void;
  setSubScreen: (screen: SubScreen) => void;
  openAddModal: (type?: TransactionType, transactionToEdit?: Transaction | null) => void;
  closeAddModal: () => void;
  openTransferModal: () => void;
  closeTransferModal: () => void;
  unlockApp: (pin?: string) => boolean;
  unlockAppWithBiometric: () => Promise<BiometricResult>;
  authenticateWithBiometric: (unlockOnSuccess?: boolean) => Promise<BiometricResult>;
  enrollBiometric: () => Promise<BiometricResult>;
  disableBiometric: () => void;
  clearBiometricError: () => void;
  lockApp: () => void;

  // Financial Calculations
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  todayExpense: number;
  thisWeekExpense: number;
  thisMonthExpense: number;
  averageDailySpending: number;
  highestSpendingCategory: { name: string; amount: number; color: string } | null;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (tx: Transaction) => void;
  transferMoney: (fromAccountId: string, toAccountId: string, amount: number, date: string, time: string, description?: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  addAccount: (acc: Omit<Account, 'id' | 'balance'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => boolean;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => void;
  contributeToSavings: (goalId: string, amount: number, accountId?: string, note?: string) => void;

  addDebt: (debt: Omit<Debt, 'id' | 'repayments' | 'status'>) => void;
  recordDebtRepayment: (debtId: string, amount: number, accountId?: string, note?: string) => void;

  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'isActive'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;
  processRecurringSchedule: (id: string) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  togglePrivacyHideBalance: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  resetAllAppData: () => void;
  refreshData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.recalculateAllAccountBalances());
  const [budgets, setBudgets] = useState<Budget[]>(() => StorageService.getBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => StorageService.getSavingsGoals());
  const [debts, setDebts] = useState<Debt[]>(() => StorageService.getDebts());
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => StorageService.getRecurring());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());

  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [subScreen, setSubScreenState] = useState<SubScreen>(null);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    const s = StorageService.getSettings();
    return !!(s.isPinEnabled || s.isBiometricEnabled);
  });

  // WebAuthn Biometric Authentication State
  const [biometricAvailability, setBiometricAvailability] = useState<BiometricAvailability | null>(null);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState<boolean>(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Detect WebAuthn platform authenticator capability on mount
  useEffect(() => {
    let mounted = true;
    BiometricService.checkAvailability().then((avail) => {
      if (mounted) {
        setBiometricAvailability(avail);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync balances and reload data
  const refreshData = useCallback(() => {
    const updatedAccounts = StorageService.recalculateAllAccountBalances();
    setAccounts(updatedAccounts);
    setTransactions(StorageService.getTransactions());
    setCategories(StorageService.getCategories());
    setBudgets(StorageService.getBudgets());
    setSavingsGoals(StorageService.getSavingsGoals());
    setDebts(StorageService.getDebts());
    setRecurring(StorageService.getRecurring());
    setSettings(StorageService.getSettings());
    setNotifications(StorageService.getNotifications());
  }, []);

  const setActiveTab = (tab: ActiveTab) => {
    setSubScreenState(null);
    setActiveTabState(tab);
  };

  const setSubScreen = (screen: SubScreen) => {
    setSubScreenState(screen);
  };

  const openAddModal = (type: TransactionType = 'expense', transactionToEdit: Transaction | null = null) => {
    setAddModalInitialType(type);
    setEditingTransaction(transactionToEdit);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const openTransferModal = () => {
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
  };

  const unlockApp = (pin?: string): boolean => {
    if (!settings.isPinEnabled && !settings.isBiometricEnabled) {
      setIsPinLocked(false);
      setBiometricError(null);
      return true;
    }
    if (!pin) return false;
    const targetHash = settings.pinHash || '1234';
    if (targetHash === pin) {
      setIsPinLocked(false);
      setBiometricError(null);
      return true;
    }
    return false;
  };

  const clearBiometricError = useCallback(() => {
    setBiometricError(null);
  }, []);

  const enrollBiometric = useCallback(async (): Promise<BiometricResult> => {
    setIsBiometricAuthenticating(true);
    setBiometricError(null);
    try {
      const result = await BiometricService.registerCredential('AJ MoneyPro User');
      if (result.success) {
        const updated: AppSettings = {
          ...settings,
          isBiometricEnabled: true,
          biometricCredentialId: result.credentialId,
          biometricType: BiometricService.getBiometricType(),
        };
        setSettings(updated);
        StorageService.saveSettings(updated);
      } else if (result.error) {
        setBiometricError(result.error);
      }
      return result;
    } finally {
      setIsBiometricAuthenticating(false);
    }
  }, [settings]);

  const disableBiometric = useCallback(() => {
    BiometricService.clearCredential();
    const updated: AppSettings = {
      ...settings,
      isBiometricEnabled: false,
      biometricCredentialId: undefined,
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
    setBiometricError(null);
  }, [settings]);

  const authenticateWithBiometric = useCallback(
    async (unlockOnSuccess = true): Promise<BiometricResult> => {
      setIsBiometricAuthenticating(true);
      setBiometricError(null);
      try {
        const storedCredId = settings.biometricCredentialId || BiometricService.getStoredCredentialId();
        let result = await BiometricService.authenticate(storedCredId || undefined);

        // If no credential has been registered on this browser yet, perform seamless WebAuthn registration
        if (!result.success && !storedCredId && !result.cancelled) {
          const regResult = await BiometricService.registerCredential('AJ MoneyPro User');
          if (regResult.success) {
            const updated: AppSettings = {
              ...settings,
              isBiometricEnabled: true,
              biometricCredentialId: regResult.credentialId,
              biometricType: BiometricService.getBiometricType(),
            };
            setSettings(updated);
            StorageService.saveSettings(updated);
            result = regResult;
          } else {
            result = regResult;
          }
        }

        if (result.success && unlockOnSuccess) {
          setIsPinLocked(false);
          setBiometricError(null);
        } else if (!result.success && result.error) {
          setBiometricError(result.error);
        }

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Biometric authentication failed';
        setBiometricError(msg);
        return { success: false, error: msg };
      } finally {
        setIsBiometricAuthenticating(false);
      }
    },
    [settings]
  );

  const unlockAppWithBiometric = useCallback(async (): Promise<BiometricResult> => {
    return authenticateWithBiometric(true);
  }, [authenticateWithBiometric]);

  const lockApp = () => {
    if (settings.isPinEnabled || settings.isBiometricEnabled) {
      setBiometricError(null);
      setIsPinLocked(true);
    }
  };

  // Calculations
  const {
    totalBalance,
    totalIncome,
    totalExpense,
    netSavings,
    todayExpense,
    thisWeekExpense,
    thisMonthExpense,
    averageDailySpending,
    highestSpendingCategory,
  } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Start of week (Monday)
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const mondayStr = monday.toISOString().split('T')[0];

    let incomeSum = 0;
    let expenseSum = 0;
    let tExpense = 0;
    let wExpense = 0;
    let mExpense = 0;

    const catTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;

      if (tx.type === 'income') {
        incomeSum += amt;
      } else if (tx.type === 'expense') {
        expenseSum += amt;

        if (tx.date === todayStr) {
          tExpense += amt;
        }
        if (tx.date >= mondayStr && tx.date <= todayStr) {
          wExpense += amt;
        }
        if (tx.date.startsWith(monthPrefix)) {
          mExpense += amt;
          catTotals[tx.categoryId] = (catTotals[tx.categoryId] || 0) + amt;
        }
      }
    });

    const totBal = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    const netSave = incomeSum - expenseSum;

    // Daily average spending for current month
    const dayOfMonth = Math.max(1, now.getDate());
    const avgDaily = mExpense / dayOfMonth;

    // Highest spending category
    let highestCat: { name: string; amount: number; color: string } | null = null;
    let maxCatAmt = 0;
    const catMap = new Map(categories.map((c) => [c.id, c]));

    Object.entries(catTotals).forEach(([catId, amt]) => {
      if (amt > maxCatAmt) {
        maxCatAmt = amt;
        const c = catMap.get(catId);
        highestCat = {
          name: c ? c.name : 'Other',
          amount: amt,
          color: c ? c.color : '#64748b',
        };
      }
    });

    return {
      totalBalance: totBal,
      totalIncome: incomeSum,
      totalExpense: expenseSum,
      netSavings: netSave,
      todayExpense: tExpense,
      thisWeekExpense: wExpense,
      thisMonthExpense: mExpense,
      averageDailySpending: avgDaily,
      highestSpendingCategory: highestCat,
    };
  }, [transactions, accounts, categories]);

  // Transaction Actions
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    const updatedAccounts = StorageService.recalculateAllAccountBalances();
    setAccounts(updatedAccounts);

    // Check budget limits
    if (data.type === 'expense' && settings.budgetAlertsEnabled) {
      checkBudgetAlerts(data.categoryId, data.amount);
    }
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) =>
      t.id === updatedTx.id ? { ...updatedTx, updatedAt: Date.now() } : t
    );
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    const updatedAccounts = StorageService.recalculateAllAccountBalances();
    setAccounts(updatedAccounts);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    const updatedAccounts = StorageService.recalculateAllAccountBalances();
    setAccounts(updatedAccounts);
  };

  const duplicateTransaction = (tx: Transaction) => {
    const dup: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      ...tx,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    };
    addTransaction(dup);
  };

  const transferMoney = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date: string,
    time: string,
    description?: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);

    const title = `Transfer: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Wallet'}`;

    addTransaction({
      type: 'transfer',
      title,
      amount,
      categoryId: '',
      accountId: fromAccountId,
      toAccountId,
      date,
      time,
      paymentMethod: 'Bank Transfer',
      description: description || `Internal transfer between accounts`,
    });
  };

  const checkBudgetAlerts = (catId: string, _newExpenseAmt: number) => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calculate month spent for this category
    const catSpent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === catId && t.date.startsWith(monthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = budgets.find((b) => b.categoryId === catId || b.categoryId === 'all');
    if (budget && budget.amount > 0) {
      const ratio = catSpent / budget.amount;
      if (ratio >= 1.0) {
        StorageService.addNotification({
          title: 'Budget Exceeded!',
          message: `You have exceeded your ${budget.name} budget (${settings.currencySymbol} ${budget.amount.toLocaleString()}).`,
          type: 'budget_exceeded',
        });
      } else if (ratio >= 0.85) {
        StorageService.addNotification({
          title: 'Budget Alert (85%+ Spent)',
          message: `You've spent ${(ratio * 100).toFixed(0)}% of your ${budget.name} budget.`,
          type: 'budget_warning',
        });
      }
      setNotifications(StorageService.getNotifications());
    }
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat_custom_' + Date.now(),
      isCustom: true,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    StorageService.saveCategories(updated);
  };

  // Accounts
  const addAccount = (acc: Omit<Account, 'id' | 'balance'>) => {
    const newAcc: Account = {
      ...acc,
      id: 'acc_' + Date.now(),
      balance: acc.openingBalance,
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    refreshData();
  };

  const updateAccount = (acc: Account) => {
    const updated = accounts.map((a) => (a.id === acc.id ? acc : a));
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    refreshData();
  };

  const deleteAccount = (id: string): boolean => {
    // Safeguard: Check if transactions are linked to this account
    const hasTransactions = transactions.some((t) => t.accountId === id || t.toAccountId === id);
    if (hasTransactions) {
      return false;
    }
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    return true;
  };

  // Budgets
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: 'b_' + Date.now(),
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  const updateBudget = (budget: Budget) => {
    const updated = budgets.map((b) => (b.id === budget.id ? budget : b));
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  // Savings
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'sg_' + Date.now(),
      currentAmount: 0,
      contributions: [],
    };
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(updated);
  };

  const contributeToSavings = (goalId: string, amount: number, accountId?: string, note?: string) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const contribution = {
      id: 'c_' + Date.now(),
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      accountId,
    };

    const newCurrent = goal.currentAmount + amount;
    const updated = savingsGoals.map((g) =>
      g.id === goalId
        ? {
            ...g,
            currentAmount: newCurrent,
            contributions: [contribution, ...g.contributions],
          }
        : g
    );

    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(updated);

    // If an account is selected, record a dedicated savings transaction or deduction
    if (accountId) {
      addTransaction({
        type: 'expense',
        title: `Savings: ${goal.name}`,
        amount,
        categoryId: 'exp_other',
        accountId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'Bank Transfer',
        description: `Contribution to ${goal.name}. ${note || ''}`,
      });
    }

    if (newCurrent >= goal.targetAmount) {
      StorageService.addNotification({
        title: 'Goal Achieved! 🎉',
        message: `Congratulations! You reached your savings target for "${goal.name}".`,
        type: 'savings_milestone',
      });
      setNotifications(StorageService.getNotifications());
    }
  };

  // Debts
  const addDebt = (debt: Omit<Debt, 'id' | 'repayments' | 'status'>) => {
    const newDebt: Debt = {
      ...debt,
      id: 'debt_' + Date.now(),
      status: 'active',
      repayments: [],
    };
    const updated = [...debts, newDebt];
    setDebts(updated);
    StorageService.saveDebts(updated);
  };

  const recordDebtRepayment = (debtId: string, amount: number, accountId?: string, note?: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const repayment = {
      id: 'r_' + Date.now(),
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      accountId,
    };

    const totalRepaid = debt.repayments.reduce((sum, r) => sum + r.amount, 0) + amount;
    const isSettled = totalRepaid >= debt.principalAmount;

    const updated = debts.map((d) =>
      d.id === debtId
        ? {
            ...d,
            status: (isSettled ? 'settled' : 'active') as 'settled' | 'active',
            repayments: [repayment, ...d.repayments],
          }
        : d
    );

    setDebts(updated);
    StorageService.saveDebts(updated);

    // Update account balance correctly:
    // If 'lent' (someone paid me back), this is cash coming into my account!
    // If 'borrowed' (I am paying someone back), this is cash leaving my account!
    if (accountId) {
      if (debt.type === 'lent') {
        addTransaction({
          type: 'income',
          title: `Loan Repayment from ${debt.personName}`,
          amount,
          categoryId: 'inc_other',
          accountId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          paymentMethod: 'Bank Transfer',
          description: `Repayment received for principal loan. ${note || ''}`,
        });
      } else {
        addTransaction({
          type: 'expense',
          title: `Debt Repayment to ${debt.personName}`,
          amount,
          categoryId: 'exp_other',
          accountId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          paymentMethod: 'Bank Transfer',
          description: `Repayment paid for borrowed loan. ${note || ''}`,
        });
      }
    }
  };

  // Recurring
  const addRecurring = (rec: Omit<RecurringTransaction, 'id' | 'isActive'>) => {
    const newRec: RecurringTransaction = {
      ...rec,
      id: 'rec_' + Date.now(),
      isActive: true,
    };
    const updated = [...recurring, newRec];
    setRecurring(updated);
    StorageService.saveRecurring(updated);
  };

  const toggleRecurring = (id: string) => {
    const updated = recurring.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    setRecurring(updated);
    StorageService.saveRecurring(updated);
  };

  const deleteRecurring = (id: string) => {
    const updated = recurring.filter((r) => r.id !== id);
    setRecurring(updated);
    StorageService.saveRecurring(updated);
  };

  const processRecurringSchedule = (id: string) => {
    const rec = recurring.find((r) => r.id === id);
    if (!rec) return;

    addTransaction({
      type: rec.type,
      title: rec.title,
      amount: rec.amount,
      categoryId: rec.categoryId,
      accountId: rec.accountId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'Bank Transfer',
      description: `Recurring schedule executed (${rec.frequency})`,
      isRecurring: true,
      recurringScheduleId: rec.id,
    });

    // Advance next due date
    const d = new Date(rec.nextDueDate);
    if (rec.frequency === 'daily') d.setDate(d.getDate() + 1);
    else if (rec.frequency === 'weekly') d.setDate(d.getDate() + 7);
    else if (rec.frequency === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (rec.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);

    const updated = recurring.map((r) =>
      r.id === id
        ? {
            ...r,
            lastProcessedDate: new Date().toISOString().split('T')[0],
            nextDueDate: d.toISOString().split('T')[0],
          }
        : r
    );
    setRecurring(updated);
    StorageService.saveRecurring(updated);
  };

  // Settings & Preferences
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const togglePrivacyHideBalance = () => {
    updateSettings({ privacyHideBalance: !settings.privacyHideBalance });
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
  };

  const resetAllAppData = () => {
    StorageService.resetAllData();
    refreshData();
  };

  // Apply dark/light class and accent attribute to html document element
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let isDark = true;
      if (settings.theme === 'light') {
        isDark = false;
      } else if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => {
        if (settings.theme === 'system') {
          applyTheme();
        }
      };

      mediaQuery.addEventListener('change', handleMediaChange);

      if (settings.accentColor) {
        root.setAttribute('data-accent', settings.accentColor);
      }

      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    } else {
      if (settings.accentColor) {
        root.setAttribute('data-accent', settings.accentColor);
      }
    }
  }, [settings.theme, settings.accentColor]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        savingsGoals,
        debts,
        recurring,
        settings,
        notifications,
        activeTab,
        subScreen,
        isPinLocked,
        biometricAvailability,
        isBiometricAuthenticating,
        biometricError,
        isAddModalOpen,
        addModalInitialType,
        isTransferModalOpen,
        editingTransaction,
        setActiveTab,
        setSubScreen,
        openAddModal,
        closeAddModal,
        openTransferModal,
        closeTransferModal,
        unlockApp,
        unlockAppWithBiometric,
        authenticateWithBiometric,
        enrollBiometric,
        disableBiometric,
        clearBiometricError,
        lockApp,
        totalBalance,
        totalIncome,
        totalExpense,
        netSavings,
        todayExpense,
        thisWeekExpense,
        thisMonthExpense,
        averageDailySpending,
        highestSpendingCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        transferMoney,
        addCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        contributeToSavings,
        addDebt,
        recordDebtRepayment,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        processRecurringSchedule,
        updateSettings,
        togglePrivacyHideBalance,
        markNotificationRead,
        clearNotifications,
        resetAllAppData,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
