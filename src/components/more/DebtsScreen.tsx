import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  History,
  Coins,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Debt } from '../../types';

export const DebtsScreen: React.FC = () => {
  const { debts, accounts, settings, setSubScreen, addDebt, recordDebtRepayment } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Repayment modal
  const [repayDebt, setRepayDebt] = useState<Debt | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentAccount, setRepaymentAccount] = useState(accounts[0]?.id || '');
  const [repaymentNote, setRepaymentNote] = useState('');

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Totals
  const totalLent = debts
    .filter((d) => d.type === 'lent' && d.status === 'active')
    .reduce(
      (sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)),
      0
    );

  const totalBorrowed = debts
    .filter((d) => d.type === 'borrowed' && d.status === 'active')
    .reduce(
      (sum, d) => sum + (d.principalAmount - d.repayments.reduce((r, p) => r + p.amount, 0)),
      0
    );

  const netDebtPosition = totalLent - totalBorrowed;

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'lent') return d.type === 'lent';
    if (activeTab === 'borrowed') return d.type === 'borrowed';
    return true;
  });

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(principalAmount);
    if (!personName.trim() || isNaN(amt) || amt <= 0) return;

    addDebt({
      type: debtType,
      personName: personName.trim(),
      principalAmount: amt,
      date,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setPersonName('');
    setPrincipalAmount('');
    setNotes('');
  };

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(repaymentAmount);
    if (!repayDebt || isNaN(amt) || amt <= 0) return;

    recordDebtRepayment(repayDebt.id, amt, repaymentAccount, repaymentNote);
    setRepayDebt(null);
    setRepaymentAmount('');
    setRepaymentNote('');
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
          onClick={() => setIsAddModalOpen(true)}
          className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Loan / Debt</span>
        </button>
      </div>

      {/* Header summaries */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Owed to Me</span>
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            {formatMoney(totalLent)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>I Owe Others</span>
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            {formatMoney(totalBorrowed)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
            <span>Net Balance</span>
          </div>
          <div
            className={`text-sm font-extrabold mt-1 ${
              netDebtPosition >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatMoney(netDebtPosition)}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-1.5 rounded-xl transition ${
            activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Records
        </button>
        <button
          onClick={() => setActiveTab('lent')}
          className={`py-1.5 rounded-xl transition ${
            activeTab === 'lent' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Money Lent
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`py-1.5 rounded-xl transition ${
            activeTab === 'borrowed' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Money Borrowed
        </button>
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <HandCoins className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-xs">No debt or loan records found.</p>
          </div>
        ) : (
          filteredDebts.map((item) => {
            const totalRepaid = item.repayments.reduce((sum, r) => sum + r.amount, 0);
            const remaining = Math.max(0, item.principalAmount - totalRepaid);
            const isSettled = item.status === 'settled' || remaining === 0;
            const isOverdue = !isSettled && item.dueDate < todayStr;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                        item.type === 'lent' ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    >
                      {item.type === 'lent' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.personName}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-300">
                          {item.type === 'lent' ? 'Lent to person' : 'Borrowed from person'}
                        </span>
                        <span>•</span>
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {isSettled ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    ) : isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount details */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Principal</span>
                    <div className="font-bold text-white mt-0.5">
                      {formatMoney(item.principalAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Repaid</span>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      {formatMoney(totalRepaid)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Remaining</span>
                    <div className="font-extrabold text-red-400 mt-0.5">
                      {formatMoney(remaining)}
                    </div>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-xl">
                    "{item.notes}"
                  </p>
                )}

                {/* Repayment Log and Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {item.repayments.length} repayment record{item.repayments.length === 1 ? '' : 's'}
                  </span>

                  {!isSettled && (
                    <button
                      onClick={() => {
                        setRepayDebt(item);
                        setRepaymentAmount('');
                      }}
                      className="h-8 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===================== RECORD DEBT MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Record Loan or Debt</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDebtType('lent')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    debtType === 'lent'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I Lent Money
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('borrowed')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    debtType === 'borrowed'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I Borrowed
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Person's Name *
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Tariq Khan, Ali Raza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Principal Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Emergency support, laptop installment"
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== RECORD REPAYMENT MODAL ===================== */}
      {repayDebt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Record Repayment</h3>
                <span className="text-[10px] text-slate-400">
                  {repayDebt.personName} ({repayDebt.type === 'lent' ? 'Received from' : 'Paid to'})
                </span>
              </div>
              <button
                onClick={() => setRepayDebt(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordRepayment} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Repayment Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-lg text-center"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {repayDebt.type === 'lent' ? 'Deposit Into Wallet' : 'Pay From Wallet'}
                </label>
                <select
                  value={repaymentAccount}
                  onChange={(e) => setRepaymentAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({settings.currencySymbol} {acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Repayment Note
                </label>
                <input
                  type="text"
                  value={repaymentNote}
                  onChange={(e) => setRepaymentNote(e.target.value)}
                  placeholder="e.g. Bank transfer, installment 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRepayDebt(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
