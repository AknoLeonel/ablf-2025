import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Share2, X } from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- Botão (mínimo 44px de altura no toque) ---------- */
const BTN = {
  primary: 'bg-ablf-yellow text-ablf-blue hover:bg-white',
  success: 'bg-green-700 text-white hover:bg-green-800',
  secondary: 'border border-white/20 text-white hover:bg-white/10',
  ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};
const BTN_SIZE = { md: 'min-h-11 px-5 text-sm', sm: 'min-h-9 px-3 text-sm', lg: 'min-h-12 px-6 text-base' };

export function Button({ as: Tag = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  const tipo = Tag === 'button' && !props.type ? { type: 'button' } : {};
  return (
    <Tag
      {...tipo}
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        BTN[variant], BTN_SIZE[size], className,
      )}
    />
  );
}

/* ---------- Selo / status ---------- */
const BADGE = {
  neutral: 'bg-white/10 text-gray-300',
  success: 'bg-ablf-green/20 text-green-400',
  warn: 'bg-yellow-500/15 text-yellow-300',
  danger: 'bg-red-500/15 text-red-300',
  live: 'bg-ablf-live text-white',
  info: 'bg-sky-500/15 text-sky-300',
};
export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider whitespace-nowrap', BADGE[tone], className)}>
      {tone === 'live' && <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-lg bg-white/5', className)} />;
}

export function Card({ as: Tag = 'div', className = '', ...props }) {
  return <Tag {...props} className={cx('rounded-2xl border border-ablf-line bg-ablf-surface', className)} />;
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        {eyebrow && <div className="text-ablf-yellow font-display uppercase tracking-widest text-sm font-bold">{eyebrow}</div>}
        <h2 className="text-white font-display text-3xl md:text-4xl font-black italic uppercase leading-none">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------- Abas acessíveis (setas do teclado trocam de aba) ---------- */
export function Tabs({ tabs, value, onChange, label = 'Seções', className = '' }) {
  const base = useId();
  // Padrão WAI-ARIA: setas/Home/End movem a seleção E o foco para a aba nova.
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    const alvo = tabs[(destino + tabs.length) % tabs.length];
    onChange(alvo.id);
    requestAnimationFrame(() => document.getElementById(`${base}-${alvo.id}`)?.focus());
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey}
      className={cx('flex gap-1 overflow-x-auto no-scrollbar border-b border-ablf-line', className)}>
      {tabs.map((t) => {
        const ativo = t.id === value;
        return (
          <button key={t.id} role="tab" type="button" id={`${base}-${t.id}`} aria-selected={ativo}
            tabIndex={ativo ? 0 : -1} onClick={() => onChange(t.id)}
            className={cx('relative shrink-0 min-h-11 px-4 text-sm font-bold uppercase tracking-wider transition-colors',
              ativo ? 'text-ablf-yellow' : 'text-gray-400 hover:text-white')}>
            {t.label}{t.count != null && <span className="ml-1.5 text-xs text-gray-400">{t.count}</span>}
            {ativo && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-ablf-yellow" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Chips roláveis (rodadas, categorias) ---------- */
export function Chips({ items, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 snap-x">
      {items.map((it) => (
        <button key={it.id} type="button" aria-pressed={it.id === value} onClick={() => onChange(it.id)}
          className={cx('snap-start shrink-0 min-h-10 px-4 rounded-full text-sm font-bold border transition-colors',
            it.id === value ? 'bg-green-700 border-green-700 text-white' : 'border-ablf-line text-gray-300 hover:border-gray-500')}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Folha (bottom sheet no celular, diálogo no desktop) ---------- */
export function Sheet({ open, onClose, title, children, footer }) {
  const painel = useRef(null);
  const tituloId = useId();
  // onClose costuma ser uma função nova a cada render do pai; guardá-la num ref evita refazer o
  // efeito (e roubar o foco de quem está digitando) sempre que o pai re-renderiza.
  const fecharRef = useRef(onClose);
  useEffect(() => { fecharRef.current = onClose; });
  useEffect(() => {
    if (!open) return;
    const anterior = document.activeElement;
    const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const onKey = (e) => {
      if (e.key === 'Escape') { fecharRef.current(); return; }
      if (e.key !== 'Tab' || !painel.current) return;
      // prende o foco dentro do diálogo
      const itens = [...painel.current.querySelectorAll(FOCAVEIS)];
      if (!itens.length) { e.preventDefault(); return; }
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === painel.current)) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    painel.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      anterior?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={painel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={tituloId}
        className="relative w-full md:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl md:rounded-2xl border border-ablf-line bg-ablf-card shadow-2xl outline-none">
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 border-b border-ablf-line">
          <h2 id={tituloId} className="font-display text-2xl font-bold uppercase text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2 -mr-2 text-gray-400 hover:text-white"><X size={22} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-ablf-line pb-safe">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Compartilhar (Web Share no celular; copia o link no desktop) ---------- */
export function ShareButton({ title, text, className = '' }) {
  const [copiado, setCopiado] = useState(false);
  const compartilhar = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch { /* usuário cancelou */ }
  };
  return (
    <Button variant="secondary" size="sm" onClick={compartilhar} className={className}>
      {copiado ? <Check size={16} /> : <Share2 size={16} />}
      <span role="status">{copiado ? 'Link copiado' : 'Compartilhar'}</span>
    </Button>
  );
}
