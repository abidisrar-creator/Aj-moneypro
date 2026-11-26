import React, { useState } from 'react';
import { Eye, EyeOff, Bell, ShieldCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../constants/defaultData';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    settings,
    togglePrivacyHideBalance,
    notifications,
    updateSettings,
  } = useFinance();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white">AJ Money</h1>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/60 px-1.5 py-0.2 rounded shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Take Control of Your Money</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacyHideBalance}
            title={settings.privacyHideBalance ? 'Show balance' : 'Hide balance'}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
            aria-label="Toggle balance privacy"
          >
            {settings.privacyHideBalance ? (
              <EyeOff className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
            >
              <span>{settings.currency}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">({settings.currencySymbol})</span>
            </button>

            {showCurrencyDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCurrencyDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
                    Select Currency
                  </div>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        updateSettings({
                          currency: curr.code,
                          currencySymbol: curr.symbol,
                        });
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer ${
                        settings.currency === curr.code
                          ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-semibold">{curr.code}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-1.5">({curr.name})</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {curr.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            title="Notifications"
            className="relative w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
