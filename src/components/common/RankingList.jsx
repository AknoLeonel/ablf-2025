import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Crest } from './ui';
import { entityPath, nomeJogador } from '../../lib/format';

// O 1º colocado ganha cartaz grande; os demais vão em lista.
export default function RankingList({ titulo, itens, campo, unidade }) {
  if (!itens?.length) return null;
  const [lider, ...resto] = itens;
  return (
    <section aria-label={titulo} className="bg-ablf-surface border border-ablf-line rounded-2xl overflow-hidden">
      <h2 className="px-5 py-3 bg-ablf-blue/40 border-b border-gray-800 font-display text-2xl font-bold uppercase text-ablf-yellow">
        {titulo}
      </h2>
      <Link
        to={entityPath('jogadores', lider.jogador_id, lider.nome)}
        className="group flex items-center gap-4 p-5 border-b border-gray-800 hover:bg-gray-900"
      >
        <Avatar src={lider.foto_url} nome={lider.nome} className="w-24 h-28 rounded-lg shrink-0 border-b-4 border-ablf-green" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-3xl font-black italic uppercase text-white leading-none group-hover:text-ablf-yellow transition-colors truncate">
            {nomeJogador(lider)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
            <Crest src={lider.time_escudo_url} nome={lider.time_nome} size={20} />
            <span className="truncate">{lider.time_nome}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{lider.jogos} jogo{lider.jogos === 1 ? '' : 's'}</div>
        </div>
        <div className="text-right">
          <div className="font-display font-black text-6xl text-ablf-yellow leading-none">{lider[campo]}</div>
          <div className="text-xs uppercase tracking-wider text-gray-500">{unidade}</div>
        </div>
      </Link>
      <ol className="divide-y divide-gray-800">
        {resto.map((p, i) => (
          <li key={p.jogador_id}>
            <Link to={entityPath('jogadores', p.jogador_id, p.nome)} className="flex items-center gap-3 px-5 py-3 min-h-14 hover:bg-gray-900">
              <span className="w-6 font-display text-xl text-gray-500">{i + 2}</span>
              <Avatar src={p.foto_url} nome={p.nome} className="w-9 h-9 rounded-full shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-white font-medium truncate">{nomeJogador(p)}</span>
                <span className="block text-xs text-gray-500 truncate">{p.time_nome}</span>
              </span>
              <span className="font-display text-2xl font-bold text-white">{p[campo]}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
