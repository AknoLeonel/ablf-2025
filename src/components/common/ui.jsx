import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Inbox, User, Shield } from 'lucide-react';
import { Skeleton } from '../ui';
import { iniciais } from '../../lib/format';

export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="pt-24 pb-6 md:pt-28 md:pb-10 bg-ablf-card border-b border-gray-800 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 text-[14rem] font-display font-bold text-white/5 leading-none select-none pointer-events-none hidden md:block before:content-['ABLF']"
      />
      <div className="container mx-auto px-4 relative z-10">
        {eyebrow && (
          <span className="text-ablf-yellow font-display uppercase tracking-widest text-lg font-bold">
            {eyebrow}
          </span>
        )}
        <h1 className="text-white font-display text-4xl sm:text-5xl md:text-7xl font-black italic uppercase mt-1 leading-[0.95]">
          {title}
        </h1>
        {subtitle && <p className="text-gray-400 mt-2 md:mt-3 max-w-2xl">{subtitle}</p>}
        {children && <div className="mt-4 md:mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function Container({ children, className = '' }) {
  return <div className={`container mx-auto px-4 py-8 md:py-12 ${className}`}>{children}</div>;
}

export function Loading({ label = 'Carregando…' }) {
  return (
    <div role="status" aria-live="polite" className="py-4 space-y-3">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24 opacity-60" />
    </div>
  );
}

export function ErrorBlock({ error }) {
  return (
    <div role="alert" className="flex items-start gap-3 p-4 border border-red-900/60 bg-red-950/30 rounded-lg text-red-200 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-bold">Não foi possível carregar os dados.</p>
        {error?.message && <p className="text-red-300/70 mt-1">{error.message}</p>}
      </div>
    </div>
  );
}

export function Empty({ children = 'Nada por aqui ainda.' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-gray-400 text-center">
      <Inbox size={32} />
      <p>{children}</p>
    </div>
  );
}

// Renderiza loading / erro / vazio / conteúdo para uma query do TanStack Query.
export function QueryState({ query, emptyText, isEmpty, children }) {
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorBlock error={query.error} />;
  const empty = isEmpty ? isEmpty(query.data) : !query.data || (Array.isArray(query.data) && !query.data.length);
  if (empty) return <Empty>{emptyText}</Empty>;
  return children(query.data);
}

export function Crest({ src, nome, size = 40, className = '' }) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={nome ? `Escudo ${nome}` : ''}
        style={style}
        loading="lazy"
        decoding="async"
        className={`object-contain shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      style={style}
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-gray-800 text-gray-400 ${className}`}
    >
      {nome ? (
        <span className="font-display font-bold" style={{ fontSize: size * 0.4 }}>{iniciais(nome)}</span>
      ) : (
        <Shield size={size * 0.5} />
      )}
    </span>
  );
}

export function Avatar({ src, nome, className = '' }) {
  if (src) {
    return (
      <img src={src} alt={nome || ''} loading="lazy" decoding="async" className={`object-cover ${className}`} />
    );
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-gray-800 text-gray-400 ${className}`}>
      <User size={40} />
    </div>
  );
}

export function CompeticaoPicker({ competicoes, atual, onChange }) {
  if (!competicoes?.length) return null;
  return (
    <label className="flex w-full sm:inline-flex sm:w-auto items-center gap-3 text-sm text-gray-400">
      <span className="uppercase tracking-wider font-bold">Competição</span>
      <select
        value={atual?.id ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 min-w-0 min-h-11 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-ablf-green"
      >
        {competicoes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome} ({c.ano})
          </option>
        ))}
      </select>
    </label>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center min-h-10 text-sm text-gray-400 hover:text-ablf-yellow transition-colors mb-2">
      ← {children}
    </Link>
  );
}

export function StatBox({ label, value, destaque = false }) {
  return (
    <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl text-center">
      <div className={`font-display font-bold text-4xl ${destaque ? 'text-ablf-yellow' : 'text-white'}`}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">{label}</div>
    </div>
  );
}
