import React from 'react';
import { X, CheckCheck, Trash2, AlertTriangle, AlertCircle, Bell, Trophy, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useFinance();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'budget_warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'savings_milestone':
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'bill_reminder':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Notifications & Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>{notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}
                className="hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={clearNotifications}
                className="hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No alerts or unread notifications.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                  item.read
                    ? 'bg-slate-900/60 border-slate-800/60 opacity-70'
                    : 'bg-slate-800/80 border-slate-700 shadow-sm'
                }`}
              >
                <div className="shrink-0 mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate ${item.read ? 'text-slate-300' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
