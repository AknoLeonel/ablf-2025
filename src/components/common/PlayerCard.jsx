import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Crest } from './ui';
import { POSICOES, entityPath, nomeJogador } from '../../lib/format';

export default function PlayerCard({ jogador, time }) {
  const t = time ?? jogador.time;
  return (
    <Link
      to={entityPath('jogadores', jogador.id, jogador.nome)}
      className="group block bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-ablf-yellow/70 transition-colors"
    >
      <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
        <Avatar
          src={jogador.foto_url}
          nome={jogador.nome}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {jogador.numero != null && (
          <span className="absolute top-2 left-3 font-display font-black italic text-5xl text-white/90 drop-shadow">
            {jogador.numero}
          </span>
        )}
        {t && (
          <Crest src={t.escudo_url} nome={t.nome} size={32} className="absolute top-3 right-3" />
        )}
      </div>
      <div className="p-3 border-t-4 border-ablf-green">
        <div className="font-display text-xl font-bold uppercase text-white leading-tight group-hover:text-ablf-yellow transition-colors">
          {nomeJogador(jogador)}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
          {POSICOES[jogador.posicao] ?? 'Atleta'}
          {t ? ` · ${t.nome}` : ''}
        </div>
      </div>
    </Link>
  );
}
