import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };
  const value = useMemo(() => ({ showToast }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-950/90 px-4 py-3 text-sm shadow-glass border border-white/10">
          {toast}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
