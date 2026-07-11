import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
}

export interface ToastProps {
  key?: React.Key;
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
  theme?: "light" | "dark";
}

export default function Toast({
  id,
  message,
  type = "success",
  duration = 5000,
  onClose,
  theme = "light",
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const config = {
    success: {
      bg: theme === "dark" ? "bg-slate-900/95 border-emerald-800 text-emerald-300 shadow-emerald-950/20" : "bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-100/30",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
      accent: "bg-emerald-500",
    },
    error: {
      bg: theme === "dark" ? "bg-slate-900/95 border-red-900 text-red-400 shadow-red-950/20" : "bg-red-50/95 border-red-200 text-red-900 shadow-red-100/30",
      icon: <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
      accent: "bg-red-500",
    },
    info: {
      bg: theme === "dark" ? "bg-slate-900/95 border-blue-900 text-blue-300 shadow-blue-950/20" : "bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-100/30",
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
      accent: "bg-blue-500",
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-3 border rounded-xl p-4 shadow-xl pointer-events-auto backdrop-blur-md max-w-sm w-full relative overflow-hidden ${config.bg}`}
      id={`toast-${id}`}
    >
      {/* Visual Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`} />
      
      {config.icon}
      
      <div className="flex-1 text-xs font-semibold pr-4 text-left leading-relaxed">
        {message}
      </div>

      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg hover:bg-slate-500/15 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  theme?: "light" | "dark";
}

export function ToastContainer({ toasts, onClose, theme = "light" }: ToastContainerProps) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0" id="toast-notifications-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onClose}
            theme={theme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
