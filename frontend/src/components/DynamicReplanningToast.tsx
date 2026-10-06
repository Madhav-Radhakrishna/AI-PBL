import React from "react";
import { AlertTriangle, RefreshCw, X, ShieldAlert } from "lucide-react";

interface DynamicReplanningToastProps {
  alert: { title: string; message: string; created_at?: string } | null;
  onClose: () => void;
}

export const DynamicReplanningToast: React.FC<DynamicReplanningToastProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2000] max-w-md bg-slate-900 border-2 border-red-500 text-white rounded-xl p-4 shadow-2xl animate-bounce">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          <span>{alert.title}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-300 space-y-1 whitespace-pre-line font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
        {alert.message}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
        <span className="flex items-center text-emerald-400 font-semibold">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Auto-recalculated with A* & CSP
        </span>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};
