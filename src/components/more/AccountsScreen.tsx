import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  ArrowRightLeft,
  Edit2,
  Trash2,
  Wallet,
  Building,
  Smartphone,
  PiggyBank,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const AccountsScreen: React.FC = () => {
  const {
    accounts,
    transactions,
    settings,
    setSubScreen,
    addAccount,
    updateAccount,
    deleteAccount,
    openTransferModal,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [icon, setIcon] = useState('Building');
  const [errorMessage, setErrorMessage] = useState('');

  // Selected account for transaction history view
  const [selectedAccHistory, setSelectedAccHistory] = useState<Account | null>(null);

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleOpenAdd = (accToEdit?: Account) => {
    setErrorMessage('');
    if (accToEdit) {
      setEditingAcc(accToEdit);
      setName(accToEdit.name);
      setType(accToEdit.type);
      setOpeningBalance(accToEdit.openingBalance.toString());
      setAccountNumber(accToEdit.accountNumber || '');
      setColor(accToEdit.color);
      setIcon(accToEdit.icon);
    } else {
      setEditingAcc(null);
      setName('');
      setType('bank');
      setOpeningBalance('0');
      setAccountNumber('');
      setColor('#2563eb');
      setIcon('Building');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(openingBalance);
    if (!name.trim() || isNaN(bal)) return;

    if (editingAcc) {
      updateAccount({
        ...editingAcc,
        name: name.trim(),
        type,
        openingBalance: bal,
        accountNumber: accountNumber.trim() || undefined,
        color,
        icon,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        openingBalance: bal,
        accountNumber: accountNumber.trim() || undefined,
        color,
        icon,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (acc: Account) => {
    if (confirm(`Are you sure you want to delete "${acc.name}"?`)) {
      const success = deleteAccount(acc.id);
      if (!success) {
        alert(
          `Cannot delete "${acc.name}" because it contains associated transactions. Reassign or delete those transactions first to protect your financial ledger.`
        );
      }
    }
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

        <div className="flex items-center gap-2">
          <button
            onClick={openTransferModal}
            className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => handleOpenAdd()}
            className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-white">Wallets & Financial Accounts</h2>
          <p className="text-xs text-slate-400">
            Internal transfers do not affect income or expense reports.
          </p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.map((acc) => {
          const accTxCount = transactions.filter(
            (t) => t.accountId === acc.id || t.toAccountId === acc.id
          ).length;

          return (
            <div
              key={acc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <IconRenderer name={acc.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize">{acc.type.replace('_', ' ')}</span>
                      {acc.accountNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{acc.accountNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenAdd(acc)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                    title="Edit account"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc)}
                    className="w-8 h-8 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center transition"
                    title="Delete account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Balance information */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Opening Balance
                  </span>
                  <div className="text-slate-300 font-semibold mt-0.5">
                    {formatMoney(acc.openingBalance)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Current Balance
                  </span>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {formatMoney(acc.balance)}
                  </div>
                </div>
              </div>

              {/* History button */}
              <button
                onClick={() => setSelectedAccHistory(acc)}
                className="w-full py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Receipt className="w-3.5 h-3.5 text-blue-400" />
                <span>View Transactions ({accTxCount})</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Account History Modal */}
      {selectedAccHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedAccHistory.name}</h3>
                <span className="text-xs text-emerald-400 font-extrabold">
                  Balance: {formatMoney(selectedAccHistory.balance)}
                </span>
              </div>
              <button
                onClick={() => setSelectedAccHistory(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {transactions.filter(
                (t) =>
                  t.accountId === selectedAccHistory.id ||
                  t.toAccountId === selectedAccHistory.id
              ).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No transactions associated with this account.
                </p>
              ) : (
                transactions
                  .filter(
                    (t) =>
                      t.accountId === selectedAccHistory.id ||
                      t.toAccountId === selectedAccHistory.id
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{t.title}</span>
                        <span className="text-[10px] text-slate-500">{t.date} • {t.paymentMethod}</span>
                      </div>
                      <span
                        className={`font-bold ${
                          t.type === 'income'
                            ? 'text-emerald-400'
                            : t.type === 'expense'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                        {formatMoney(t.amount)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingAcc ? 'Edit Wallet / Account' : 'Add New Wallet / Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meezan Bank, Cash, JazzCash, Easypaisa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as Account['type'];
                    setType(t);
                    if (t === 'cash') setIcon('Wallet');
                    else if (t === 'bank') setIcon('Building');
                    else if (t === 'mobile_wallet') setIcon('Smartphone');
                    else if (t === 'savings') setIcon('PiggyBank');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="cash">Cash Wallet</option>
                  <option value="bank">Bank Account</option>
                  <option value="mobile_wallet">Mobile Wallet (JazzCash / Easypaisa)</option>
                  <option value="savings">Savings Account</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Opening Balance ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Account Number / Details (Optional)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0300 1234567 or •••• 9812"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {['#2563eb', '#10b981', '#dc2626', '#7c3aed', '#f59e0b', '#06b6d4'].map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === col ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
