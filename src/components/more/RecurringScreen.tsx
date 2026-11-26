import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Repeat,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  Calendar,
  Wallet,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringTransaction } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const RecurringScreen: React.FC = () => {
  const {
    recurring,
    categories,
    accounts,
    settings,
    setSubScreen,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    processRecurringSchedule,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const handleOpenAdd = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    const defaultCat = categories.find((c) => c.type === 'expense');
    setCategoryId(defaultCat?.id || '');
    setAccountId(accounts[0]?.id || '');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) return;

    addRecurring({
      title: title.trim(),
      amount: amt,
      type,
      categoryId,
      accountId,
      frequency,
      startDate,
      nextDueDate: startDate,
      autoProcess: true,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSubScreen(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          onClick={handleOpenAdd}
          className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Schedule</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-white">Recurring Schedules</h2>
          <p className="text-xs text-slate-400">
            Automate salary, bills, subscriptions, and rent payments.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {recurring.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <Repeat className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-xs">No recurring schedules set up yet.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 text-xs font-bold text-blue-400 hover:underline"
            >
              + Add your first schedule
            </button>
          </div>
        ) : (
          recurring.map((item) => {
            const cat = categoryMap.get(item.categoryId);
            const acc = accountMap.get(item.accountId);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition space-y-3 shadow-xs ${
                  item.isActive
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/70 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#2563eb' }}
                    >
                      <IconRenderer name={cat?.icon || 'Repeat'} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{item.frequency}</span>
                        <span>•</span>
                        <span>{acc?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-extrabold ${
                        item.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {formatMoney(item.amount)}
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">{item.type}</span>
                  </div>
                </div>

                {/* Due date info */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Next Due: <strong className="text-slate-200">{item.nextDueDate}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Process Now button */}
                    <button
                      onClick={() => processRecurringSchedule(item.id)}
                      className="h-7 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                      title="Post transaction now"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Post Now</span>
                    </button>

                    {/* Toggle Active / Pause */}
                    <button
                      onClick={() => toggleRecurring(item.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                        item.isActive
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-emerald-950 text-emerald-400'
                      }`}
                      title={item.isActive ? 'Pause schedule' : 'Resume schedule'}
                    >
                      {item.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete recurring schedule "${item.title}"?`)) {
                          deleteRecurring(item.id);
                        }
                      }}
                      className="w-7 h-7 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create Recurring Schedule</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    const c = categories.find((cat) => cat.type === 'expense');
                    if (c) setCategoryId(c.id);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense Schedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    const c = categories.find((cat) => cat.type === 'income');
                    if (c) setCategoryId(c.id);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income Schedule
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Salary, House Rent, Internet Bill"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {categories
                    .filter((c) => c.type === type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  First Due Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Start Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
