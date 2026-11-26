import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { IconRenderer } from '../common/IconRenderer';

export const CalendarScreen: React.FC = () => {
  const { transactions, categories, settings, setSubScreen, openAddModal } = useFinance();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar dates generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate daily transactions
  const dailyTotals = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {};
    transactions.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        map[t.date].income += t.amount;
        map[t.date].count += 1;
      } else if (t.type === 'expense') {
        map[t.date].expense += t.amount;
        map[t.date].count += 1;
      }
    });
    return map;
  }, [transactions]);

  // Selected date transactions
  const selectedDayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const selectedDayIncome = selectedDayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const selectedDayExpense = selectedDayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
          onClick={() => openAddModal('expense')}
          className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add on Date</span>
        </button>
      </div>

      {/* Month Header Navigation */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Day name labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[10px] font-bold text-slate-500 uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty spacer cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 rounded-xl bg-transparent" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const totals = dailyTotals[dateStr];
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 rounded-xl p-1 flex flex-col justify-between items-center transition relative border ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500/50'
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-400' : ''}`}>
                  {dayNum}
                </span>

                {/* Daily Dots / Totals indicator */}
                <div className="w-full flex items-center justify-center gap-1">
                  {totals?.income ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Income" />
                  ) : null}
                  {totals?.expense ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Expense" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary & Transactions */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Transactions on {selectedDate}
            </h3>
            <span className="text-[10px] text-slate-400">
              {selectedDayTransactions.length} activity recorded
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-bold">+{formatMoney(selectedDayIncome)}</span>
            <span className="text-slate-600">•</span>
            <span className="text-red-400 font-bold">-{formatMoney(selectedDayExpense)}</span>
          </div>
        </div>

        {/* List for day */}
        <div className="space-y-2">
          {selectedDayTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No transactions recorded for this day.
            </p>
          ) : (
            selectedDayTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          tx.type === 'transfer' ? '#2563eb' : cat?.color || '#64748b',
                      }}
                    >
                      <IconRenderer
                        name={tx.type === 'transfer' ? 'ArrowRightLeft' : cat?.icon || 'CircleDollarSign'}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{tx.title}</span>
                      <span className="text-[10px] text-slate-500">{tx.paymentMethod} • {tx.time || 'All-day'}</span>
                    </div>
                  </div>

                  <span
                    className={`font-bold shrink-0 ${
                      tx.type === 'income'
                        ? 'text-emerald-400'
                        : tx.type === 'expense'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatMoney(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
