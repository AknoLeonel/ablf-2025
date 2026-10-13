import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { Crest } from './ui';
import JogoStatus from './JogoStatus';
import { formatDataJogo } from '../../lib/format';

function Linha({ time, gols, perdeu }) {
  return (
    <div className={`flex items-center gap-3 ${perdeu ? 'opacity-60' : ''}`}>
      <Crest src={time.escudo_url} nome={time.nome} size={32} />
      <span className="flex-1 min-w-0 font-display text-xl font-bold uppercase leading-tight text-white line-clamp-2">
        {time.nome}
      </span>
      <span className="font-display text-3xl font-black tabular-nums text-white w-8 text-right">{gols ?? '–'}</span>
    </div>
  );
}

// Cartão de jogo no formato de placar de aplicativo: um time por linha, nomes completos.
export default function JogoCard({ jogo, mostrarCompeticao = false, className = '' }) {
  const encerrado = jogo.status === 'encerrado';
  const gm = jogo.gols_mandante;
  const gv = jogo.gols_visitante;
  const contexto = [
    mostrarCompeticao && jogo.competicao && `${jogo.competicao.nome}`,
    jogo.fase || (jogo.grupo ? `Grupo ${jogo.grupo}` : null),
    jogo.rodada ? `Rodada ${jogo.rodada}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/jogos/${jogo.id}`}
      className={`block p-4 rounded-2xl border border-ablf-line bg-ablf-surface hover:border-ablf-green/60 active:bg-ablf-raised transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 min-h-6">
        <span className="text-xs text-gray-400 truncate">{contexto}</span>
        <JogoStatus jogo={jogo} />
      </div>
      <div className="mt-3 space-y-2.5">
        <Linha time={jogo.mandante} gols={gm} perdeu={encerrado && gm < gv} />
        <Linha time={jogo.visitante} gols={gv} perdeu={encerrado && gv < gm} />
      </div>
      <div className="mt-3 pt-3 border-t border-ablf-line flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{formatDataJogo(jogo.data_hora)}</span>
        {jogo.local && <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin size={14} aria-hidden="true" className="shrink-0" /><span className="truncate">{jogo.local}</span></span>}
      </div>
    </Link>
  );
}
