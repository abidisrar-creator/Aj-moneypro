import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  CreditCard,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExportService } from '../../services/exportService';
import { IconRenderer } from '../common/IconRenderer';
import { Transaction } from '../../types';
import { BudgetsScreen } from '../budgets/BudgetsScreen';

type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export const ReportsScreen: React.FC = () => {
  const { transactions, categories, accounts, settings } = useFinance();

  const [activeSection, setActiveSection] = useState<'analytics' | 'budgets'>('analytics');
  const [preset, setPreset] = useState<DatePreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Compute date range based on preset
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        return { startDate: todayStr, endDate: todayStr, dateRangeLabel: 'Today' };
      case 'yesterday': {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        const yStr = formatDate(yest);
        return { startDate: yStr, endDate: yStr, dateRangeLabel: 'Yesterday' };
      }
      case 'this_week': {
        const day = now.getDay() || 7;
        const mon = new Date(now);
        mon.setDate(now.getDate() - day + 1);
        return { startDate: formatDate(mon), endDate: todayStr, dateRangeLabel: 'This Week' };
      }
      case 'last_week': {
        const day = now.getDay() || 7;
        const endLastWeek = new Date(now);
        endLastWeek.setDate(now.getDate() - day);
        const startLastWeek = new Date(endLastWeek);
        startLastWeek.setDate(endLastWeek.getDate() - 6);
        return {
          startDate: formatDate(startLastWeek),
          endDate: formatDate(endLastWeek),
          dateRangeLabel: 'Last Week',
        };
      }
      case 'this_month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: formatDate(firstDay),
          endDate: todayStr,
          dateRangeLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        };
      }
      case 'last_month': {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: formatDate(firstDayLastMonth),
          endDate: formatDate(lastDayLastMonth),
          dateRangeLabel: firstDayLastMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
        };
      }
      case 'last_3_months': {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return {
          startDate: formatDate(threeMonthsAgo),
          endDate: todayStr,
          dateRangeLabel: 'Last 3 Months',
        };
      }
      case 'last_6_months': {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        return {
          startDate: formatDate(sixMonthsAgo),
          endDate: todayStr,
          dateRangeLabel: 'Last 6 Months',
        };
      }
      case 'this_year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: formatDate(startOfYear),
          endDate: todayStr,
          dateRangeLabel: `Year ${now.getFullYear()}`,
        };
      }
      case 'custom':
        return {
          startDate: customStart || '2000-01-01',
          endDate: customEnd || '2099-12-31',
          dateRangeLabel: customStart && customEnd ? `${customStart} to ${customEnd}` : 'Custom Date Range',
        };
      default:
        return { startDate: '2000-01-01', endDate: '2099-12-31', dateRangeLabel: 'All Time' };
    }
  }, [preset, customStart, customEnd]);

  // Filter transactions within selected range
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  // Analytics Calculations
  const {
    totalIncome,
    totalExpense,
    netSavings,
    avgDailySpending,
    highestExpense,
    lowestExpense,
    categoryBreakdown,
    paymentMethodBreakdown,
  } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let maxExp = 0;
    let minExp = Infinity;

    const catMap = new Map(categories.map((c) => [c.id, c]));
    const catTotals: Record<string, number> = {};
    const pmTotals: Record<string, number> = {};

    periodTransactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
      } else if (t.type === 'expense') {
        exp += t.amount;
        if (t.amount > maxExp) maxExp = t.amount;
        if (t.amount < minExp) minExp = t.amount;

        catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
        const pm = t.paymentMethod || 'Cash';
        pmTotals[pm] = (pmTotals[pm] || 0) + t.amount;
      }
    });

    if (minExp === Infinity) minExp = 0;

    // Number of days in range
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const avgDaily = exp / diffDays;

    const catBreakdown = Object.entries(catTotals)
      .map(([catId, amount]) => {
        const cat = catMap.get(catId);
        return {
          id: catId,
          name: cat ? cat.name : 'Other',
          color: cat ? cat.color : '#64748b',
          icon: cat ? cat.icon : 'CircleDollarSign',
          amount,
          percentage: exp > 0 ? (amount / exp) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const pmBreakdown = Object.entries(pmTotals)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: exp > 0 ? (amount / exp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome: inc,
      totalExpense: exp,
      netSavings: inc - exp,
      avgDailySpending: avgDaily,
      highestExpense: maxExp,
      lowestExpense: minExp,
      categoryBreakdown: catBreakdown,
      paymentMethodBreakdown: pmBreakdown,
    };
  }, [periodTransactions, categories, startDate, endDate]);

  // Export handlers
  const handleExportPDF = () => {
    ExportService.exportToPDF({
      title: 'Financial Statement',
      dateRangeLabel,
      totalIncome,
      totalExpense,
      netSavings,
      currencySymbol: settings.currencySymbol,
      categoryBreakdown,
      transactions: periodTransactions,
      categories,
      accounts,
    });
  };

  const handleExportCSV = () => {
    ExportService.exportToCSV({
      title: 'Financial Statement',
      dateRangeLabel,
      totalIncome,
      totalExpense,
      netSavings,
      currencySymbol: settings.currencySymbol,
      categoryBreakdown,
      transactions: periodTransactions,
      categories,
      accounts,
    });
  };

  const handleExportExcel = () => {
    ExportService.exportToExcel({
      title: 'Financial Statement',
      dateRangeLabel,
      totalIncome,
      totalExpense,
      netSavings,
      currencySymbol: settings.currencySymbol,
      categoryBreakdown,
      transactions: periodTransactions,
      categories,
      accounts,
    });
  };

  // Drilldown transactions for selected category
  const drilldownList = useMemo(() => {
    if (!drilldownCategory) return [];
    return periodTransactions.filter(
      (t) => t.type === 'expense' && t.categoryId === drilldownCategory
    );
  }, [periodTransactions, drilldownCategory]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Toggle: Analytics vs Budgets & Goals */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSection('analytics')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSection === 'analytics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Reports</span>
        </button>

        <button
          onClick={() => setActiveSection('budgets')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSection === 'budgets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Budgets & Goals</span>
        </button>
      </div>

      {activeSection === 'budgets' ? (
        <BudgetsScreen />
      ) : (
        <>
          {/* 1. Date Range Preset Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'this_week', label: 'This Week' },
          { id: 'last_week', label: 'Last Week' },
          { id: 'this_month', label: 'This Month' },
          { id: 'last_month', label: 'Last Month' },
          { id: 'last_3_months', label: '3 Months' },
          { id: 'last_6_months', label: '6 Months' },
          { id: 'this_year', label: 'This Year' },
          { id: 'custom', label: 'Custom' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPreset(item.id as DatePreset)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              preset === item.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {preset === 'custom' && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
            />
          </div>
        </div>
      )}

      {/* 2. Export Actions Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/40 flex items-center justify-between gap-2">
        <div className="text-xs">
          <span className="font-bold text-white block">{dateRangeLabel}</span>
          <span className="text-[11px] text-slate-400">
            {periodTransactions.length} transaction{periodTransactions.length === 1 ? '' : 's'} included
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportPDF}
            className="h-8 px-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-semibold flex items-center gap-1 transition shadow-xs"
            title="Download PDF Financial Statement"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="h-8 px-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 transition shadow-xs"
            title="Download Excel / XLSX Statement"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-8 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition border border-slate-700"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Financial Overview Cards for Selected Period */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Income</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white mt-1 truncate">
            {formatMoney(totalIncome)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Expenses</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white mt-1 truncate">
            {formatMoney(totalExpense)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
            <span>Net Savings</span>
          </div>
          <div
            className={`text-sm sm:text-base font-extrabold mt-1 truncate ${
              netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatMoney(netSavings)}
          </div>
        </div>
      </div>

      {/* 4. Secondary Analytics Metrics */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Daily Average</span>
          <div className="text-xs font-bold text-slate-200 mt-0.5">
            {formatMoney(avgDailySpending)}
          </div>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500">Highest Expense</span>
          <div className="text-xs font-bold text-red-400 mt-0.5">
            {formatMoney(highestExpense)}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Lowest Expense</span>
          <div className="text-xs font-bold text-slate-300 mt-0.5">
            {formatMoney(lowestExpense)}
          </div>
        </div>
      </div>

      {/* 5. Income vs Expense Comparison Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Income vs. Expense Ratio</span>
          <span className="text-slate-400 text-[11px]">
            {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : '0'}% of income spent
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-1">
          <div
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50}%`,
            }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
            title={`Income: ${formatMoney(totalIncome)}`}
          />
          <div
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50}%`,
            }}
            className="h-full bg-red-500 rounded-r-full transition-all duration-300"
            title={`Expense: ${formatMoney(totalExpense)}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income ({formatMoney(totalIncome)})
          </span>
          <span className="text-red-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Expense ({formatMoney(totalExpense)})
          </span>
        </div>
      </div>

      {/* 6. Category-wise Spending Breakdown with Interactive Tap-to-Drilldown */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-blue-400" />
            Category-Wise Breakdown
          </h3>
          <span className="text-[10px] text-slate-400">Tap category to view items</span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No expenses in this period.</p>
        ) : (
          <div className="space-y-2">
            {categoryBreakdown.map((cat) => {
              const isSelected = drilldownCategory === cat.id;
              return (
                <div key={cat.id} className="space-y-1">
                  <div
                    onClick={() => setDrilldownCategory(isSelected ? null : cat.id)}
                    className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-blue-950/40 border border-blue-800/80'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <IconRenderer name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-slate-200 font-bold truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-white">{formatMoney(cat.amount)}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({cat.percentage.toFixed(1)}%)</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isSelected ? 'rotate-90 text-blue-400' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drilldown modal or sublist */}
      {drilldownCategory && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-blue-900/60 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-400">
              Transactions for Category: {categories.find((c) => c.id === drilldownCategory)?.name}
            </span>
            <button
              onClick={() => setDrilldownCategory(null)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {drilldownList.map((tx) => (
              <div
                key={tx.id}
                className="p-2 rounded-lg bg-slate-900/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white block">{tx.title}</span>
                  <span className="text-[10px] text-slate-500">{tx.date} • {tx.paymentMethod}</span>
                </div>
                <span className="font-bold text-red-400">-{formatMoney(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Payment Methods Breakdown */}
      {paymentMethodBreakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Payment Method Distribution
          </h3>
          <div className="space-y-2">
            {paymentMethodBreakdown.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{pm.method}</span>
                  <span className="font-bold text-white">
                    {formatMoney(pm.amount)} ({pm.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pm.percentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
