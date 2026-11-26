import React, { useState } from 'react';
import {
  Target,
  PiggyBank,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Coins,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget, SavingsGoal } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const BudgetsScreen: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    accounts,
    settings,
    addBudget,
    updateBudget,
    deleteBudget,
    savingsGoals,
    addSavingsGoal,
    contributeToSavings,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'budgets' | 'savings'>('budgets');

  // Budget modal state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('all');
  const [budgetPeriod, setBudgetPeriod] = useState<'monthly' | 'weekly'>('monthly');

  // Savings modal state
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalColor, setGoalColor] = useState('#10b981');
  const [goalIcon, setGoalIcon] = useState('PiggyBank');

  // Contribution modal state
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccount, setContributionAccount] = useState(accounts[0]?.id || '');
  const [contributionNote, setContributionNote] = useState('');

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Current month prefix for expense comparison
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Budget calculations
  const calculateBudgetSpending = (budget: Budget) => {
    let spent = 0;
    if (budget.categoryId === 'all') {
      spent = transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
        .reduce((sum, t) => sum + t.amount, 0);
    } else {
      spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.categoryId === budget.categoryId &&
            t.date.startsWith(currentMonthStr)
        )
        .reduce((sum, t) => sum + t.amount, 0);
    }
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return { spent, remaining, percentage };
  };

  // Handlers for Budgets
  const handleOpenBudgetModal = (budgetToEdit?: Budget) => {
    if (budgetToEdit) {
      setEditingBudget(budgetToEdit);
      setBudgetName(budgetToEdit.name);
      setBudgetAmount(budgetToEdit.amount.toString());
      setBudgetCategory(budgetToEdit.categoryId || 'all');
      setBudgetPeriod(budgetToEdit.period as 'monthly' | 'weekly');
    } else {
      setEditingBudget(null);
      setBudgetName('');
      setBudgetAmount('');
      setBudgetCategory('all');
      setBudgetPeriod('monthly');
    }
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (!budgetName.trim() || isNaN(amt) || amt <= 0) return;

    if (editingBudget) {
      updateBudget({
        ...editingBudget,
        name: budgetName.trim(),
        amount: amt,
        categoryId: budgetCategory,
        period: budgetPeriod,
      });
    } else {
      addBudget({
        name: budgetName.trim(),
        amount: amt,
        categoryId: budgetCategory,
        period: budgetPeriod,
      });
    }
    setIsBudgetModalOpen(false);
  };

  // Handlers for Savings Goals
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (!goalName.trim() || isNaN(amt) || amt <= 0) return;

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: amt,
      targetDate: targetDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      color: goalColor,
      icon: goalIcon,
    });

    setIsSavingsModalOpen(false);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contributionAmount);
    if (!contributeGoal || isNaN(amt) || amt <= 0) return;

    contributeToSavings(contributeGoal.id, amt, contributionAccount, contributionNote);
    setContributeGoal(null);
    setContributionAmount('');
    setContributionNote('');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Sub-Tab Switcher: Budgets vs Savings */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('budgets')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'budgets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Expense Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'savings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Savings Goals</span>
        </button>
      </div>

      {/* ===================== TAB 1: BUDGETS ===================== */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Budgets ({budgets.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Warning triggers: 50% • 75% • 90% • 100%
              </span>
            </div>
            <button
              onClick={() => handleOpenBudgetModal()}
              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Budget</span>
            </button>
          </div>

          <div className="space-y-3">
            {budgets.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                <Target className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-xs">No budgets established yet.</p>
                <button
                  onClick={() => handleOpenBudgetModal()}
                  className="mt-2 text-xs font-bold text-blue-400 hover:underline"
                >
                  + Create your first budget
                </button>
              </div>
            ) : (
              budgets.map((b) => {
                const { spent, remaining, percentage } = calculateBudgetSpending(b);
                const isOver = spent >= b.amount;
                const isWarning = percentage >= 75 && !isOver;

                const category = b.categoryId !== 'all' ? categoryMap.get(b.categoryId || '') : null;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: category?.color || '#2563eb' }}
                        >
                          <IconRenderer
                            name={category?.icon || 'Target'}
                            className="w-4 h-4"
                          />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{b.name}</h3>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {b.period} Budget • {category ? category.name : 'All Categories'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenBudgetModal(b)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${b.name}" budget?`)) {
                              deleteBudget(b.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Numbers: Budget vs Spent vs Remaining */}
                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Planned</span>
                        <div className="font-bold text-white mt-0.5">{formatMoney(b.amount)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Spent</span>
                        <div className={`font-bold mt-0.5 ${isOver ? 'text-red-400' : 'text-slate-200'}`}>
                          {formatMoney(spent)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Remaining</span>
                        <div
                          className={`font-bold mt-0.5 ${
                            remaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {remaining >= 0 ? formatMoney(remaining) : `-${formatMoney(Math.abs(remaining))}`}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, percentage)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver
                              ? 'bg-red-500'
                              : percentage >= 90
                              ? 'bg-orange-500'
                              : percentage >= 75
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isOver
                              ? 'text-red-400'
                              : isWarning
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {isOver ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> Budget Exceeded!
                            </>
                          ) : isWarning ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Warning (75%+ Spent)
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> On Track
                            </>
                          )}
                        </span>
                        <span className="font-mono text-slate-400 font-semibold">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SAVINGS GOALS ===================== */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Savings Goals ({savingsGoals.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Track personal targets & wealth milestones
              </span>
            </div>
            <button
              onClick={() => setIsSavingsModalOpen(true)}
              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Goal</span>
            </button>
          </div>

          <div className="space-y-3">
            {savingsGoals.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                <PiggyBank className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-xs">No savings goals created yet.</p>
                <button
                  onClick={() => setIsSavingsModalOpen(true)}
                  className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                >
                  + Add your first savings goal
                </button>
              </div>
            ) : (
              savingsGoals.map((goal) => {
                const percentage =
                  goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: goal.color }}
                        >
                          <IconRenderer name={goal.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{goal.name}</h3>
                          <span className="text-[10px] text-slate-400">
                            Target Date: {goal.targetDate}
                          </span>
                        </div>
                      </div>

                      {/* Deposit / Contribute button */}
                      <button
                        onClick={() => {
                          setContributeGoal(goal);
                          setContributionAmount('');
                        }}
                        className="h-8 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Add Money</span>
                      </button>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Saved</span>
                        <div className="font-bold text-emerald-400 mt-0.5">
                          {formatMoney(goal.currentAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Target</span>
                        <div className="font-bold text-white mt-0.5">
                          {formatMoney(goal.targetAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Remaining</span>
                        <div className="font-bold text-slate-300 mt-0.5">
                          {formatMoney(remaining)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: goal.color }}
                          className="h-full rounded-full transition-all duration-300"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">
                          {goal.contributions.length} contribution{goal.contributions.length === 1 ? '' : 's'}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {percentage.toFixed(1)}% Achieved
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== BUDGET MODAL ===================== */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Budget Name *
                </label>
                <input
                  type="text"
                  required
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  placeholder="e.g. Monthly Grocery, Fuel, Overall Budget"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Budget Limit ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">Overall (All Expenses)</option>
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Period
                </label>
                <select
                  value={budgetPeriod}
                  onChange={(e) => setBudgetPeriod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== SAVINGS GOAL MODAL ===================== */}
      {isSavingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create Savings Goal</h3>
              <button
                onClick={() => setIsSavingsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Car, Umrah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Target Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Theme color picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#2563eb', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setGoalColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        goalColor === col ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSavingsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CONTRIBUTION MODAL ===================== */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Contribution</h3>
                <span className="text-[10px] text-slate-400">To: {contributeGoal.name}</span>
              </div>
              <button
                onClick={() => setContributeGoal(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Amount to Deposit ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-extrabold text-lg text-center"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Deduct from Wallet (Optional)
                </label>
                <select
                  value={contributionAccount}
                  onChange={(e) => setContributionAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Do not deduct from wallet</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({settings.currencySymbol} {acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={contributionNote}
                  onChange={(e) => setContributionNote(e.target.value)}
                  placeholder="e.g. Monthly salary portion, bonus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Add Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
