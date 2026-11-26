import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { PinLockModal } from './components/common/PinLockModal';
import { NotificationModal } from './components/common/NotificationModal';
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { TransferModal } from './components/transactions/TransferModal';

// Screens
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TransactionsScreen } from './components/transactions/TransactionsScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { BudgetsScreen } from './components/budgets/BudgetsScreen';
import { MoreScreen } from './components/more/MoreScreen';

// Sub-screens
import { AccountsScreen } from './components/more/AccountsScreen';
import { DebtsScreen } from './components/more/DebtsScreen';
import { RecurringScreen } from './components/more/RecurringScreen';
import { CalendarScreen } from './components/more/CalendarScreen';
import { ApkDownloadScreen } from './components/more/ApkDownloadScreen';
import { SettingsScreen } from './components/more/SettingsScreen';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    subScreen,
    isPinLocked,
    isAddModalOpen,
    addModalInitialType,
    editingTransaction,
    closeAddModal,
    isTransferModalOpen,
    closeTransferModal,
  } = useFinance();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If app is PIN-locked, show secure PIN keypad
  if (isPinLocked) {
    return <PinLockModal />;
  }

  // Router logic
  const renderScreen = () => {
    if (subScreen) {
      switch (subScreen) {
        case 'accounts':
          return <AccountsScreen />;
        case 'debts':
          return <DebtsScreen />;
        case 'savings':
          return <BudgetsScreen />;
        case 'recurring':
          return <RecurringScreen />;
        case 'calendar':
          return <CalendarScreen />;
        case 'apk-hub':
          return <ApkDownloadScreen />;
        case 'settings':
          return <SettingsScreen />;
        default:
          return <MoreScreen />;
      }
    }

    switch (activeTab) {
      case 'home':
        return <DashboardScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'more':
        return <MoreScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-150">
      {/* Top Header */}
      <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />

      {/* Main Content Area (Mobile smartphone container optimized) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4">
        {renderScreen()}
      </main>

      {/* Material 3 Bottom Navigation with FAB */}
      <BottomNav />

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        initialType={addModalInitialType}
        editingTransaction={editingTransaction}
      />

      {/* Internal Wallet Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={closeTransferModal}
      />

      {/* Notification Center */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
