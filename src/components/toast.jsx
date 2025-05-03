"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    
    // Auto dismiss
    setTimeout(() => {
      dismissToast(id);
    }, duration);
    
    return id;
  };

  const dismissToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismissToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} dismissToast={dismissToast} />
      ))}
    </div>
  );
}

function Toast({ toast, dismissToast }) {
  const { id, message, type } = toast;
  
  // Define toast color based on type
  let toastClass = "bg-primary text-white";
  if (type === "error") toastClass = "bg-destructive text-white";
  if (type === "success") toastClass = "bg-green-500 text-white";
  if (type === "warning") toastClass = "bg-yellow-500 text-white";

  return (
    <div 
      className={`rounded-lg shadow-lg p-4 pr-8 min-w-[300px] max-w-md animate-in fade-in slide-in-from-bottom-5 ${toastClass}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p>{message}</p>
        <button
          onClick={() => dismissToast(id)}
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const useToast = () => {
  return useContext(ToastContext);
}; 