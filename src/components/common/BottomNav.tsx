import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Target,
  Menu,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Calculator,
  X,
  Settings,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddModal, openTransferModal, setSubScreen } = useFinance();
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ReceiptText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <>
      {/* Speed Dial Backdrop */}
      {speedDialOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setSpeedDialOpen(false)}
        />
      )}

      {/* Speed Dial Options Menu */}
      {speedDialOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Transfer Shortcut */}
          <button
            onClick={() => {
              setSpeedDialOpen(false);
              openTransferModal();
            }}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-full shadow-lg border border-slate-700 transition transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold pr-2">Transfer Money</span>
          </button>

          {/* Add Income */}
          <button
            onClick={() => {
              setSpeedDialOpen(false);
              openAddModal('income');
            }}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-full shadow-lg border border-slate-700 transition transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold pr-2">Record Income</span>
          </button>

          {/* Add Expense (Primary) */}
          <button
            onClick={() => {
              setSpeedDialOpen(false);
              openAddModal('expense');
            }}
            className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-5 py-3 rounded-full shadow-xl shadow-red-500/20 transition transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold pr-2">Record Expense</span>
          </button>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 safe-bottom shadow-lg">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1">Home</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ReceiptText className={`w-5 h-5 transition-transform ${activeTab === 'transactions' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1">History</span>
          </button>

          {/* Center Floating Action Button */}
          <div className="relative -top-4 flex justify-center">
            <button
              onClick={() => setSpeedDialOpen(!speedDialOpen)}
              title="Add Transaction"
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 cursor-pointer ${
                speedDialOpen
                  ? 'bg-slate-700 text-white rotate-45 scale-105 ring-4 ring-white dark:ring-slate-800'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-blue-500/25 ring-4 ring-white dark:ring-slate-900 hover:scale-105'
              }`}
            >
              {speedDialOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7 stroke-[2.5]" />}
            </button>
          </div>

          {/* Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className={`w-5 h-5 transition-transform ${activeTab === 'reports' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1">Reports</span>
          </button>

          {/* Settings (Bottom Right Corner) */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 transition-transform ${activeTab === 'settings' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};
