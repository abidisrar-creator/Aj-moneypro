import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Target,
  BarChart2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Wallet,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { IconRenderer } from '../common/IconRenderer';

export const DashboardScreen: React.FC = () => {
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
    accounts,
    transactions,
    categories,
    budgets,
    debts,
    settings,
    openAddModal,
    openTransferModal,
    setActiveTab,
    setSubScreen,
  } = useFinance();

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) {
      return '••••••';
    }
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Category breakdown for current month
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
  );

  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((t) => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, amt]) => {
      const cat = categoryMap.get(catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        color: cat?.color || '#64748b',
        icon: cat?.icon || 'CircleDollarSign',
        amount: amt,
        percentage: thisMonthExpense > 0 ? (amt / thisMonthExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Overall monthly budget status
  const overallBudget = budgets.find((b) => b.categoryId === 'all');
  const budgetProgress =
    overallBudget && overallBudget.amount > 0
      ? Math.min(100, Math.round((thisMonthExpense / overallBudget.amount) * 100))
      : null;
  const remainingBudget = overallBudget ? overallBudget.amount - thisMonthExpense : null;

  // Active debts overview
  const totalOwedToMe = debts
    .filter((d) => d.type === 'lent' && d.status === 'active')
    .reduce((sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)), 0);

  const totalIOwe = debts
    .filter((d) => d.type === 'borrowed' && d.status === 'active')
    .reduce((sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)), 0);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* 1. Hero Financial Overview Card (Fintech Signature Metallic Card) */}
      <div className="fintech-hero-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 border border-blue-900/60 p-5 shadow-xl text-white">
        {/* Glow ambient background elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
            <span className="font-semibold text-slate-200">Total Available Balance</span>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full shadow-xs">
              Live Safe-Balance
            </span>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatMoney(totalBalance)}
          </div>

          {/* Income vs Expenses Mini Grid (Frosted Glass Cards, always crisp and legible) */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/10">
            {/* Income */}
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Income</span>
              </div>
              <div className="mt-1 text-sm sm:text-base font-extrabold text-white truncate">
                {formatMoney(totalIncome)}
              </div>
            </div>

            {/* Expenses */}
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
              <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-bold">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Expenses</span>
              </div>
              <div className="mt-1 text-sm sm:text-base font-extrabold text-white truncate">
                {formatMoney(totalExpense)}
              </div>
            </div>

            {/* Net Savings */}
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-300 text-[11px] font-bold">
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Savings</span>
              </div>
              <div className={`mt-1 text-sm sm:text-base font-extrabold truncate ${netSavings >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatMoney(netSavings)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Shortcuts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Add Expense */}
          <button
            onClick={() => openAddModal('expense')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-slate-800 dark:text-slate-200 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ArrowDownCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold mt-2 text-center text-slate-800 dark:text-slate-200">
              Expense
            </span>
          </button>

          {/* Add Income */}
          <button
            onClick={() => openAddModal('income')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-800 dark:text-slate-200 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ArrowUpCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold mt-2 text-center text-slate-800 dark:text-slate-200">
              Income
            </span>
          </button>

          {/* Transfer */}
          <button
            onClick={openTransferModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-800 dark:text-slate-200 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ArrowRightLeft className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold mt-2 text-center text-slate-800 dark:text-slate-200">
              Transfer
            </span>
          </button>

          {/* Budgets */}
          <button
            onClick={() => setActiveTab('budgets')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-800 dark:text-slate-200 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold mt-2 text-center text-slate-800 dark:text-slate-200">
              Budgets
            </span>
          </button>
        </div>
      </div>

      {/* 3. Expense Analytics Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today & This Week */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Today's Spending
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(todayExpense)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>This Week:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMoney(thisWeekExpense)}</span>
          </div>
        </div>

        {/* This Month & Daily Average */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Monthly Spending
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(thisMonthExpense)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Daily Avg:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMoney(averageDailySpending)}</span>
          </div>
        </div>
      </div>

      {/* 4. Automatic Financial Insights & Warnings */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">
            Smart Financial Insights
          </h3>
        </div>

        {/* Highest spending category insight */}
        {highestSpendingCategory ? (
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Highest category this month:</span>
            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: highestSpendingCategory.color }} />
              {highestSpendingCategory.name} ({formatMoney(highestSpendingCategory.amount)})
            </span>
          </div>
        ) : null}

        {/* Budget warning insight */}
        {overallBudget && remainingBudget !== null && (
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Remaining monthly budget:</span>
            <span className={`font-bold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatMoney(remainingBudget)} ({budgetProgress}% spent)
            </span>
          </div>
        )}

        {/* Debts summary */}
        {(totalOwedToMe > 0 || totalIOwe > 0) && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200/60 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Loan & Debt position:</span>
            <button
              onClick={() => setSubScreen('debts')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>Owed: {formatMoney(totalOwedToMe)} / Debt: {formatMoney(totalIOwe)}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Wallets & Accounts Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Wallets & Accounts ({accounts.length})
          </h2>
          <button
            onClick={() => setSubScreen('accounts')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSubScreen('accounts')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: acc.color }}
                >
                  <IconRenderer name={acc.icon} className="w-4 h-4" />
                </div>
                {acc.accountNumber && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {acc.accountNumber}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.name}</div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatMoney(acc.balance)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Monthly Category Expense Breakdown Chart */}
      {sortedCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Category Breakdown (This Month)
            </h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Reports
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented color bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            {sortedCategories.slice(0, 6).map((cat) => (
              <div
                key={cat.id}
                style={{ width: `${Math.max(2, cat.percentage)}%`, backgroundColor: cat.color }}
                title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85"
              />
            ))}
          </div>

          {/* Category List */}
          <div className="space-y-2 pt-1">
            {sortedCategories.slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconRenderer name={cat.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-300 font-medium truncate">{cat.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white">{formatMoney(cat.amount)}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">({cat.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Transactions
          </h2>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All ({transactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 shadow-xs">
              <p className="text-xs">No transactions recorded yet.</p>
              <button
                onClick={() => openAddModal('expense')}
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + Record your first expense
              </button>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab('transactions')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{
                        backgroundColor:
                          tx.type === 'transfer' ? '#2563eb' : cat?.color || '#64748b',
                      }}
                    >
                      <IconRenderer
                        name={tx.type === 'transfer' ? 'ArrowRightLeft' : cat?.icon || 'CircleDollarSign'}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{tx.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-extrabold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatMoney(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{tx.type}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
