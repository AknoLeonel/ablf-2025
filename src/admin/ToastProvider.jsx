import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toastContext';

// Aviso curto no rodapé, com ação opcional ("Desfazer"). Lido por leitores de tela (role=status).
export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const fechar = useCallback(() => { clearTimeout(timer.current); setToast(null); }, []);
  const show = useCallback((texto, { acao, onAcao, tom = 'ok', duracao = 6000 } = {}) => {
    clearTimeout(timer.current);
    setToast({ texto, acao, onAcao, tom });
    timer.current = setTimeout(() => setToast(null), duracao);
  }, []);
  const value = useMemo(() => ({ show, fechar }), [show, fechar]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="fixed inset-x-0 bottom-20 md:bottom-6 z-[95] flex justify-center px-4 pointer-events-none">
        {toast && (
          <div className={`pointer-events-auto flex items-center gap-4 max-w-md w-full rounded-xl px-4 py-3 shadow-2xl border text-sm font-medium ${toast.tom === 'erro' ? 'bg-red-950 border-red-800 text-red-100' : 'bg-ablf-raised border-ablf-line text-white'}`}>
            <span className="flex-1">{toast.texto}</span>
            {toast.acao && (
              <button type="button" onClick={() => { toast.onAcao?.(); fechar(); }} className="shrink-0 min-h-9 px-3 rounded-lg font-bold uppercase text-xs tracking-wider text-ablf-yellow hover:bg-white/10">
                {toast.acao}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
