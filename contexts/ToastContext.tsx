"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/* ── Tipos ─────────────────────────────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
}

interface AddToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (opts: AddToastOptions) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

/* ── Global bridge via CustomEvent (funciona fuera del árbol React) ── */

const TOAST_EVENT = "__erp_toast__";

export function addToastGlobal(opts: AddToastOptions) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: opts }));
}

/* ── Provider ──────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, action }: AddToastOptions) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, title, message, action }]);
      // Auto-dismiss
      setTimeout(() => removeToast(id), type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000);
    },
    [removeToast],
  );

  // Escuchar eventos globales de toast (disparados desde fuera de React, ej: QueryClient)
  useEffect(() => {
    const handler = (e: Event) => {
      addToast((e as CustomEvent<AddToastOptions>).detail);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────── */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe estar dentro de <ToastProvider>");
  return ctx;
}

/* ── UI ────────────────────────────────────────────────── */

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const COLORS: Record<ToastType, string> = {
  success: "bg-green-50 border-green-300 text-green-800",
  error: "bg-red-50 border-red-300 text-red-800",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
  info: "bg-blue-50 border-blue-300 text-blue-800",
};

const ICON_BG: Record<ToastType, string> = {
  success: "bg-green-200 text-green-700",
  error: "bg-red-200 text-red-700",
  warning: "bg-yellow-200 text-yellow-700",
  info: "bg-blue-200 text-blue-700",
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-in ${COLORS[t.type]}`}
          role="alert"
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ICON_BG[t.type]}`}
          >
            {ICONS[t.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t.title}</p>
            {t.message && (
              <p className="text-xs mt-0.5 opacity-80">{t.message}</p>
            )}
            {t.action && (
              <button
                onClick={t.action.onClick}
                className="mt-1 text-xs font-medium underline underline-offset-2 hover:opacity-80"
              >
                {t.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
