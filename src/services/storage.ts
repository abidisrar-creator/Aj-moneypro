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
} from '../types';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_DEBTS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_RECURRING,
  DEFAULT_SETTINGS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_TRANSACTIONS,
} from '../constants/defaultData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'aj_moneypro_transactions_v1',
  CATEGORIES: 'aj_moneypro_categories_v1',
  ACCOUNTS: 'aj_moneypro_accounts_v1',
  BUDGETS: 'aj_moneypro_budgets_v1',
  SAVINGS: 'aj_moneypro_savings_v1',
  DEBTS: 'aj_moneypro_debts_v1',
  RECURRING: 'aj_moneypro_recurring_v1',
  SETTINGS: 'aj_moneypro_settings_v1',
  NOTIFICATIONS: 'aj_moneypro_notifications_v1',
  INITIALIZED: 'aj_moneypro_initialized_v1',
};

export class StorageService {
  static isInitialized(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  }

  static initializeDefaults(): void {
    if (!this.isInitialized()) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES])
      );
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(DEFAULT_DEBTS));
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEFAULT_RECURRING));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      
      const welcomeNotification: AppNotification = {
        id: 'notif_welcome',
        title: 'Welcome to AJ MoneyPro',
        message: 'Take control of your money! Your premium fintech dashboard is active and 100% offline-ready.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([welcomeNotification]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Transactions
  static getTransactions(): Transaction[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : DEFAULT_TRANSACTIONS;
  }

  static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    this.recalculateAllAccountBalances();
  }

  // Categories
  static getCategories(): Category[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // Accounts
  static getAccounts(): Account[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;
  }

  static saveAccounts(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  // Budgets
  static getBudgets(): Budget[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : DEFAULT_BUDGETS;
  }

  static saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  // Savings
  static getSavingsGoals(): SavingsGoal[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SAVINGS_GOALS;
  }

  static saveSavingsGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(goals));
  }

  // Debts
  static getDebts(): Debt[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return raw ? JSON.parse(raw) : DEFAULT_DEBTS;
  }

  static saveDebts(debts: Debt[]): void {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }

  // Recurring
  static getRecurring(): RecurringTransaction[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return raw ? JSON.parse(raw) : DEFAULT_RECURRING;
  }

  static saveRecurring(recurring: RecurringTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }

  // Settings
  static getSettings(): AppSettings {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Notifications
  static getNotifications(): AppNotification[] {
    this.initializeDefaults();
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveNotifications(notifications: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static addNotification(notif: Omit<AppNotification, 'id' | 'date' | 'read'>): void {
    const list = this.getNotifications();
    const newEntry: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      date: new Date().toISOString(),
      read: false,
    };
    this.saveNotifications([newEntry, ...list]);
  }

  // Recalculate Account Balances with strict financial rules:
  // Account Balance = Opening Balance + Income - Expenses + Incoming Transfers - Outgoing Transfers
  static recalculateAllAccountBalances(): Account[] {
    const accounts = this.getAccounts();
    const transactions = this.getTransactions();

    const updated = accounts.map((account) => {
      let balance = Number(account.openingBalance) || 0;

      for (const tx of transactions) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income' && tx.accountId === account.id) {
          balance += amt;
        } else if (tx.type === 'expense' && tx.accountId === account.id) {
          balance -= amt;
        } else if (tx.type === 'transfer') {
          if (tx.accountId === account.id) {
            // Source account
            balance -= amt;
          }
          if (tx.toAccountId === account.id) {
            // Target account
            balance += amt;
          }
        }
      }

      return {
        ...account,
        balance: Math.round(balance * 100) / 100,
      };
    });

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return updated;
  }

  // Backup and Restore
  static exportFullBackup(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'AJ MoneyPro – Premium Personal Finance Manager',
      accounts: this.getAccounts(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      savings: this.getSavingsGoals(),
      debts: this.getDebts(),
      recurring: this.getRecurring(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullBackup(jsonContent: string): boolean {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid backup schema');
      }

      if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
      if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
      if (data.savings) localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(data.savings));
      if (data.debts) localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(data.debts));
      if (data.recurring) localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(data.recurring));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));

      this.recalculateAllAccountBalances();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.initializeDefaults();
  }
}
