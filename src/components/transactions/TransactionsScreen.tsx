import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  X,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Camera,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    settings,
    openAddModal,
    duplicateTransaction,
    deleteTransaction,
  } = useFinance();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Selected transaction for details view
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    if (settings.privacyHideBalance) return '••••••';
    return `${settings.currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchDesc = (tx.description || '').toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchAmt = tx.amount.toString().includes(q);
          const cat = categoryMap.get(tx.categoryId);
          const matchCat = cat?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchNotes && !matchAmt && !matchCat) {
            return false;
          }
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

        // Account filter
        if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) return false;

        // Payment method filter
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;

        // Date range
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || '');
        } else if (sortBy === 'date_asc') {
          return a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '');
        } else if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        } else if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    accountFilter,
    paymentFilter,
    startDate,
    endDate,
    sortBy,
    categoryMap,
  ]);

  // Daily Totals calculation for filtered results
  const totalExpenseFiltered = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalIncomeFiltered = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const hasActiveFilters =
    categoryFilter !== 'all' ||
    accountFilter !== 'all' ||
    paymentFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    typeFilter !== 'all';

  const resetFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Search Bar & Filter trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, note, category, amount..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className={`h-10 px-3 rounded-2xl border flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            hasActiveFilters
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* 2. Type Filter Tabs (All / Expenses / Income / Transfers) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'expense', 'income', 'transfer'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
              typeFilter === t
                ? t === 'expense'
                  ? 'bg-red-600 text-white shadow-sm'
                  : t === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : t === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'all' ? 'All Transactions' : `${t}s`}
          </button>
        ))}
      </div>

      {/* 3. Summary Ribbon for Filtered Results */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">
            {filteredTransactions.length} Record{filteredTransactions.length === 1 ? '' : 's'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-red-400 font-bold">
            Exp: {formatMoney(totalExpenseFiltered)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">
            Inc: {formatMoney(totalIncomeFiltered)}
          </span>
        </div>

        {/* Sort selector dropdown */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-slate-300 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* 4. Filter Drawer / Modal */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Filter Transactions</h3>
              </div>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Account */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Account / Wallet
                </label>
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">All Wallets & Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Wallet">Mobile Wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterSheet(false)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-300">No transactions found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs font-bold text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const acc = accountMap.get(tx.accountId);
            const toAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3 shadow-xs group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{
                      backgroundColor:
                        tx.type === 'transfer' ? '#2563eb' : cat?.color || '#64748b',
                    }}
                  >
                    <IconRenderer
                      name={tx.type === 'transfer' ? 'ArrowRightLeft' : cat?.icon || 'CircleDollarSign'}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{tx.title}</span>
                      {tx.receiptImage && (
                        <span title="Receipt attached">
                          <Camera className="w-3 h-3 text-amber-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">
                        {tx.type === 'transfer'
                          ? `${acc?.name} → ${toAcc?.name}`
                          : `${cat?.name || 'General'} (${acc?.name})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Quick Actions */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-extrabold ${
                      tx.type === 'income'
                        ? 'text-emerald-400'
                        : tx.type === 'expense'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatMoney(tx.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Bar */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Transaction Details
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="text-center py-2">
                <div
                  className={`text-2xl font-extrabold ${
                    selectedTx.type === 'income'
                      ? 'text-emerald-400'
                      : selectedTx.type === 'expense'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}
                >
                  {selectedTx.type === 'income' ? '+' : selectedTx.type === 'expense' ? '-' : ''}
                  {formatMoney(selectedTx.amount)}
                </div>
                <div className="text-sm font-bold text-white mt-1">{selectedTx.title}</div>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {selectedTx.type}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-200">
                    {categoryMap.get(selectedTx.categoryId)?.name || 'General / None'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Wallet / Account:</span>
                  <span className="font-semibold text-slate-200">
                    {accountMap.get(selectedTx.accountId)?.name}
                  </span>
                </div>

                {selectedTx.toAccountId && (
                  <div className="flex justify-between text-slate-400">
                    <span>Destination Wallet:</span>
                    <span className="font-semibold text-slate-200">
                      {accountMap.get(selectedTx.toAccountId)?.name}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-slate-200">{selectedTx.paymentMethod}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Date & Time:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedTx.date} {selectedTx.time ? `• ${selectedTx.time}` : ''}
                  </span>
                </div>

                {selectedTx.description && (
                  <div className="pt-2 border-t border-slate-800 text-slate-400">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Description
                    </span>
                    <p className="text-slate-300">{selectedTx.description}</p>
                  </div>
                )}

                {selectedTx.notes && (
                  <div className="pt-1 text-slate-400">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Notes
                    </span>
                    <p className="text-slate-300">{selectedTx.notes}</p>
                  </div>
                )}

                {selectedTx.receiptImage && (
                  <div className="pt-2">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Receipt Photo
                    </span>
                    <img
                      src={selectedTx.receiptImage}
                      alt="Receipt"
                      onClick={() => setPreviewReceipt(selectedTx.receiptImage!)}
                      className="w-full h-32 object-cover rounded-xl border border-slate-700 cursor-pointer hover:opacity-90 transition"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    duplicateTransaction(selectedTx);
                    setSelectedTx(null);
                  }}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>

                <button
                  onClick={() => {
                    openAddModal(selectedTx.type, selectedTx);
                    setSelectedTx(null);
                  }}
                  className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this transaction?')) {
                      deleteTransaction(selectedTx.id);
                      setSelectedTx(null);
                    }
                  }}
                  className="py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold flex items-center justify-center gap-1.5 transition text-xs border border-red-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Fullscreen Receipt Zoom Modal */}
      {previewReceipt && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewReceipt(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setPreviewReceipt(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewReceipt}
              alt="Receipt Preview"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
