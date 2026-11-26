import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Trash2,
  Calendar,
  Clock,
  Wallet,
  CreditCard,
  FileText,
  Repeat,
  Image as ImageIcon,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Mobile Wallet',
  'Other',
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction,
}) => {
  const { categories, accounts, settings, addTransaction, updateTransaction, addRecurring } = useFinance();

  const [type, setType] = useState<'expense' | 'income'>(initialType === 'income' ? 'income' : 'expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form fields
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type === 'income' ? 'income' : 'expense');
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setPaymentMethod(editingTransaction.paymentMethod || 'Cash');
      setDescription(editingTransaction.description || '');
      setNotes(editingTransaction.notes || '');
      setReceiptImage(editingTransaction.receiptImage);
      setIsRecurring(!!editingTransaction.isRecurring);
    } else {
      const targetType = initialType === 'income' ? 'income' : 'expense';
      setType(targetType);
      setTitle('');
      setAmount('');
      const defaultAcc = accounts.find((a) => a.id === settings.defaultAccountId) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');

      const availableCats = categories.filter((c) => c.type === targetType);
      setCategoryId(availableCats[0]?.id || '');

      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().slice(0, 5));
      setPaymentMethod('Cash');
      setDescription('');
      setNotes('');
      setReceiptImage(undefined);
      setIsRecurring(false);
    }
  }, [editingTransaction, initialType, accounts, categories, settings.defaultAccountId, isOpen]);

  // When type changes (expense/income), switch category selection
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    const availableCats = categories.filter((c) => c.type === newType);
    if (!availableCats.some((c) => c.id === categoryId)) {
      setCategoryId(availableCats[0]?.id || '');
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        type,
        title: title.trim(),
        amount: numAmount,
        categoryId,
        accountId,
        date,
        time,
        paymentMethod,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptImage,
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        title: title.trim(),
        amount: numAmount,
        categoryId,
        accountId,
        date,
        time,
        paymentMethod,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptImage,
        isRecurring,
      });

      // If scheduled as recurring, create schedule entry
      if (isRecurring) {
        addRecurring({
          title: title.trim(),
          amount: numAmount,
          type,
          categoryId,
          accountId,
          frequency: recurringFrequency,
          startDate: date,
          nextDueDate: date,
          autoProcess: false,
        });
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              {editingTransaction ? 'Edit Transaction' : type === 'expense' ? 'Record Expense' : 'Record Income'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Expense / Income Segmented Toggle */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income (+)
              </button>
            </div>
          )}

          {/* Amount Input with big numeric display */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {type === 'expense' ? 'Amount Spent' : 'Amount Received'} ({settings.currency})
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-400">{settings.currencySymbol}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-44 text-3xl font-extrabold text-white bg-transparent outline-hidden text-center placeholder:text-slate-600 focus:ring-0"
                autoFocus={!editingTransaction}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Transaction Title / Payee *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'e.g. Grocery store, Fuel pump, Coffee' : 'e.g. October Salary, Freelance project'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Category Selector (Visual Grid) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Select Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800/80">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/20 text-white shadow-xs'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-1 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconRenderer name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account / Wallet & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                Account / Wallet
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({settings.currencySymbol} {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-blue-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dinner with team, warranty included"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Receipt Attachment Photo */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Receipt Photo Attachment
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleReceiptUpload}
            />

            {receiptImage ? (
              <div className="relative mt-1 inline-block">
                <img
                  src={receiptImage}
                  alt="Receipt preview"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl bg-slate-950/40 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Receipt Photo</span>
              </button>
            )}
          </div>

          {/* Recurring Schedule Option */}
          {!editingTransaction && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white">Repeat Transaction</span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </div>

              {isRecurring && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Frequency:</span>
                  <select
                    value={recurringFrequency}
                    onChange={(e) =>
                      setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')
                    }
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
              }`}
            >
              {editingTransaction ? 'Save Changes' : type === 'expense' ? 'Add Expense' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
