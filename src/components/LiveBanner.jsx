import React from 'react';
import { Link } from 'react-router-dom';

// Faixa fixa abaixo da barra superior quando há jogo em andamento.
export default function LiveBanner({ jogos }) {
  if (!jogos?.length) return null;
  const j = jogos[0];
  const placar = j.gols_mandante != null ? `${j.gols_mandante} × ${j.gols_visitante}` : 'vs';
  return (
    <Link
      to={`/jogos/${j.id}`}
      className="no-print fixed top-16 inset-x-0 z-40 h-9 flex items-center justify-center gap-3 px-4 bg-ablf-live text-white text-sm font-bold hover:bg-red-500 transition-colors"
    >
      <span className="live-dot inline-block w-2 h-2 rounded-full bg-white shrink-0" aria-hidden="true" />
      <span className="uppercase tracking-wider text-xs shrink-0">Ao vivo</span>
      <span className="truncate">{j.mandante.nome} <span className="tabular-nums">{placar}</span> {j.visitante.nome}</span>
      {jogos.length > 1 && <span className="shrink-0 text-xs font-medium opacity-90">+{jogos.length - 1}</span>}
    </Link>
  );
}
