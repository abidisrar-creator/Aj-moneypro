import React, { useState } from 'react';
import {
  Wallet,
  HandCoins,
  PiggyBank,
  Repeat,
  Calendar,
  Download,
  Settings,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallPhoneModal } from '../common/InstallPhoneModal';

export const MoreScreen: React.FC = () => {
  const { setSubScreen, accounts, debts, recurring, savingsGoals } = useFinance();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleInstallToPhone = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted' || outcome === 'dismissed') {
        return;
      }
    }
    setShowInstallModal(true);
  };

  const totalOwed = debts
    .filter((d) => d.type === 'lent' && d.status === 'active')
    .reduce((sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)), 0);

  const totalDebt = debts
    .filter((d) => d.type === 'borrowed' && d.status === 'active')
    .reduce((sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)), 0);

  const menuSections = [
    {
      title: 'Financial Assets & Management',
      items: [
        {
          id: 'accounts',
          title: 'Wallets & Accounts',
          subtitle: `${accounts.length} active wallets (Bank, Cash, JazzCash, Easypaisa)`,
          icon: Wallet,
          color: 'bg-blue-600',
        },
        {
          id: 'debts',
          title: 'Loans & Debt Tracker',
          subtitle: `Owed to you: ${totalOwed > 0 ? 'Active' : 'None'} • Debts: ${totalDebt > 0 ? 'Active' : 'None'}`,
          icon: HandCoins,
          color: 'bg-emerald-600',
        },
        {
          id: 'savings',
          title: 'Savings Goals',
          subtitle: `${savingsGoals.length} target milestones`,
          icon: PiggyBank,
          color: 'bg-purple-600',
        },
        {
          id: 'recurring',
          title: 'Recurring Transactions',
          subtitle: `${recurring.length} automated schedules (Rent, Bills, Salary)`,
          icon: Repeat,
          color: 'bg-amber-600',
        },
        {
          id: 'calendar',
          title: 'Financial Calendar',
          subtitle: 'Daily net summary & date-based tracking',
          icon: Calendar,
          color: 'bg-indigo-600',
        },
      ],
    },
    {
      title: 'Android App & System Delivery',
      items: [
        {
          id: 'apk-hub',
          title: 'Android APK & Studio Project',
          subtitle: 'Download Release APK, Android Studio Project (.ZIP) & Gradle guide',
          icon: Download,
          color: 'bg-gradient-to-r from-blue-600 to-emerald-500',
          badge: 'APK & ZIP',
        },
        {
          id: 'settings',
          title: 'Settings & Security',
          subtitle: 'Currency, PIN Lock, Biometrics, Backup & Restore JSON',
          icon: Settings,
          color: 'bg-slate-700',
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* PWA / Native APK Android Promo Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/80 shadow-xl text-white relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold">Install on Android Smartphone</h3>
              <span className="text-[9px] font-bold uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                Official
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Run offline with 100% data privacy. No bank logins needed.
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={handleInstallToPhone}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isInstalled
                ? 'Installed on Device'
                : isInstallable
                  ? 'Install PWA to Home Screen'
                  : 'Install to Phone'}
            </span>
          </button>

          <button
            onClick={() => setSubScreen('apk-hub')}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
          >
            Open APK Hub →
          </button>
        </div>
      </div>

      {/* Menu Groups */}
      {menuSections.map((sec) => (
        <div key={sec.title} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            {sec.title}
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/60 shadow-xs">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSubScreen(item.id as any)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <InstallPhoneModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
