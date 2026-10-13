import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJogo, listEventosJogo, listEscalacao } from '../lib/api';
import { PageHeader, Container, QueryState, Crest, BackLink } from '../components/common/ui';
import Galeria from '../components/common/Galeria';
import { entityPath, formatDataJogo, nomeJogador, parseEntityId, POSICOES, STATUS_JOGO, TIPOS_EVENTO } from '../lib/format';

const ICONE = { gol: '⚽', gol_contra: '⚽', assistencia: '👟', amarelo: '🟨', vermelho: '🟥' };

function Evento({ ev, lado }) {
  const texto = (
    <span className="text-gray-200">
      <span aria-hidden="true">{ICONE[ev.tipo]} </span>
      <Link to={entityPath('jogadores', ev.jogador.id, ev.jogador.nome)} className="hover:text-ablf-yellow font-medium">
        {nomeJogador(ev.jogador)}
      </Link>
      <span className="text-gray-500 text-xs"> · {TIPOS_EVENTO[ev.tipo]}</span>
    </span>
  );
  return (
    <li className="grid grid-cols-[1fr_3rem_1fr] items-center gap-2 py-2 border-b border-gray-800/60 text-sm">
      <div className="text-right">{lado === 'mandante' && texto}</div>
      <div className="text-center font-mono text-gray-500">{ev.minuto != null ? `${ev.minuto}'` : ''}</div>
      <div>{lado === 'visitante' && texto}</div>
    </li>
  );
}

function Elenco({ titulo, itens }) {
  if (!itens.length) return null;
  return (
    <div>
      <h3 className="font-display text-xl font-bold uppercase text-ablf-green mb-2">{titulo}</h3>
      <ul className="space-y-1 text-sm">
        {itens.map(({ jogador, titular }) => (
          <li key={jogador.id} className="flex items-center gap-2 text-gray-300">
            <span className="w-6 text-gray-500 font-mono text-right">{jogador.numero ?? ''}</span>
            <Link to={entityPath('jogadores', jogador.id, jogador.nome)} className="hover:text-ablf-yellow">
              {nomeJogador(jogador)}
            </Link>
            <span className="text-xs text-gray-600">{POSICOES[jogador.posicao] ?? ''}{titular ? '' : ' · reserva'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function JogoPage() {
  const id = parseEntityId(useParams().id);
  const jogoQuery = useQuery({ queryKey: ['jogo', id], queryFn: () => getJogo(id), enabled: id != null });
  const eventos = useQuery({ queryKey: ['eventos', id], queryFn: () => listEventosJogo(id), enabled: id != null });
  const escalacao = useQuery({ queryKey: ['escalacao', id], queryFn: () => listEscalacao(id), enabled: id != null });

  return (
    <QueryState query={jogoQuery} emptyText="Jogo não encontrado.">
      {(jogo) => {
        const placar = jogo.gols_mandante != null && jogo.gols_visitante != null;
        const lado = (ev) => (ev.time_id === jogo.mandante.id ? 'mandante' : 'visitante');
        const elenco = (timeId) => (escalacao.data ?? []).filter((e) => e.time_id === timeId);
        return (
          <>
            <PageHeader eyebrow={jogo.competicao?.nome} title={`${jogo.mandante.nome} × ${jogo.visitante.nome}`}
              subtitle={`${formatDataJogo(jogo.data_hora)}${jogo.local ? ` · ${jogo.local}` : ''}`} />
            <Container>
              <BackLink to={`/jogos?c=${jogo.competicao_id}`}>Todos os jogos</BackLink>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-6 bg-gray-900/60 border border-gray-800 rounded-2xl">
                <Link to={entityPath('times', jogo.mandante.id, jogo.mandante.nome)} className="flex flex-col items-center gap-2 text-center hover:text-ablf-yellow">
                  <Crest src={jogo.mandante.escudo_url} nome={jogo.mandante.nome} size={72} />
                  <span className="font-display text-2xl font-bold uppercase text-white">{jogo.mandante.nome}</span>
                </Link>
                <div className="text-center">
                  <div className="font-display font-black text-6xl text-ablf-yellow tabular-nums">
                    {placar ? `${jogo.gols_mandante} × ${jogo.gols_visitante}` : 'vs'}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                    {STATUS_JOGO[jogo.status]}{jogo.rodada ? ` · Rodada ${jogo.rodada}` : ''}{jogo.fase ? ` · ${jogo.fase}` : ''}
                  </div>
                </div>
                <Link to={entityPath('times', jogo.visitante.id, jogo.visitante.nome)} className="flex flex-col items-center gap-2 text-center hover:text-ablf-yellow">
                  <Crest src={jogo.visitante.escudo_url} nome={jogo.visitante.nome} size={72} />
                  <span className="font-display text-2xl font-bold uppercase text-white">{jogo.visitante.nome}</span>
                </Link>
              </div>

              {jogo.observacoes && <p className="mt-6 text-gray-400 text-sm">{jogo.observacoes}</p>}

              {eventos.data?.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-white font-display text-3xl font-bold uppercase mb-2">Lances</h2>
                  <ul>
                    {eventos.data.map((ev) => <Evento key={ev.id} ev={ev} lado={lado(ev)} />)}
                  </ul>
                </section>
              )}

              {escalacao.data?.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Escalações</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Elenco titulo={jogo.mandante.nome} itens={elenco(jogo.mandante.id)} />
                    <Elenco titulo={jogo.visitante.nome} itens={elenco(jogo.visitante.id)} />
                  </div>
                </section>
              )}

              <Galeria jogoId={jogo.id} titulo="Fotos do jogo" />
            </Container>
          </>
        );
      }}
    </QueryState>
  );
}
