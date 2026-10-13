import React from 'react';
import { Link } from 'react-router-dom';
import { Crest } from './ui';
import { formatDataJogo, STATUS_JOGO } from '../../lib/format';

const BADGE = {
  ao_vivo: 'bg-red-600 text-white animate-pulse',
  encerrado: 'bg-gray-800 text-gray-300',
  agendado: 'bg-ablf-green/20 text-ablf-green',
  adiado: 'bg-yellow-900/40 text-yellow-300',
  cancelado: 'bg-red-950 text-red-300',
};

export default function JogoCard({ jogo, mostrarCompeticao = false }) {
  const placar = jogo.gols_mandante != null && jogo.gols_visitante != null;
  return (
    <Link
      to={`/jogos/${jogo.id}`}
      className="block p-4 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-ablf-green/60 transition-colors"
    >
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatDataJogo(jogo.data_hora)}{jogo.local ? ` · ${jogo.local}` : ''}</span>
        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${BADGE[jogo.status]}`}>
          {STATUS_JOGO[jogo.status]}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 justify-end text-right min-w-0">
          <span className="font-display text-xl font-bold text-white uppercase leading-tight truncate">{jogo.mandante.nome}</span>
          <Crest src={jogo.mandante.escudo_url} nome={jogo.mandante.nome} size={36} />
        </div>
        <div className="font-display text-3xl font-black text-ablf-yellow tabular-nums min-w-[4.5rem] text-center">
          {placar ? `${jogo.gols_mandante} × ${jogo.gols_visitante}` : 'vs'}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Crest src={jogo.visitante.escudo_url} nome={jogo.visitante.nome} size={36} />
          <span className="font-display text-xl font-bold text-white uppercase leading-tight truncate">{jogo.visitante.nome}</span>
        </div>
      </div>
      {mostrarCompeticao && jogo.competicao && (
        <div className="mt-3 text-xs text-gray-500 text-center uppercase tracking-wider">
          {jogo.competicao.nome} ({jogo.competicao.ano}){jogo.rodada ? ` · Rodada ${jogo.rodada}` : ''}
        </div>
      )}
      {jogo.fase && <div className="mt-3 text-xs text-gray-500 text-center uppercase tracking-wider">{jogo.fase}</div>}
    </Link>
  );
}
