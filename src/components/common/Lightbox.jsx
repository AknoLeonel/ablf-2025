import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Lightbox({ foto, onClose }) {
  useEffect(() => {
    if (!foto) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [foto, onClose]);

  if (!foto) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={foto.legenda || 'Foto ampliada'}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <button type="button" autoFocus aria-label="Fechar" className="absolute top-6 right-6 text-white hover:text-ablf-yellow p-2">
        <X size={36} />
      </button>
      <img
        src={foto.url}
        alt={foto.legenda || ''}
        className="max-w-full max-h-[85vh] rounded shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      />
      {foto.legenda && <p className="mt-3 text-gray-300 text-sm">{foto.legenda}</p>}
    </div>
  );
}
