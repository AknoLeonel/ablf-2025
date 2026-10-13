import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTime, listJogadores, listJogos } from '../lib/api';
import { PageHeader, Container, QueryState, Crest, BackLink } from '../components/common/ui';
import PlayerCard from '../components/common/PlayerCard';
import JogoCard from '../components/common/JogoCard';
import Galeria from '../components/common/Galeria';
import { parseEntityId } from '../lib/format';

export default function TimePage() {
  const id = parseEntityId(useParams().id);
  const time = useQuery({ queryKey: ['time', id], queryFn: () => getTime(id), enabled: id != null });
  const elenco = useQuery({ queryKey: ['elenco', id], queryFn: () => listJogadores({ timeId: id }), enabled: id != null });
  const jogos = useQuery({ queryKey: ['jogos-time', id], queryFn: () => listJogos({ timeId: id }), enabled: id != null });

  return (
    <QueryState query={time} emptyText="Time não encontrado.">
      {(t) => (
        <>
          <PageHeader
            eyebrow={t.liga?.nome ?? 'Time'}
            title={t.nome}
            subtitle={[t.cidade, t.uf].filter(Boolean).join(' / ') || undefined}
          >
            <Crest src={t.escudo_url} nome={t.nome} size={96} />
          </PageHeader>
          <Container>
            <BackLink to="/times">Todos os times</BackLink>

            <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Elenco</h2>
            <QueryState query={elenco} emptyText="Elenco ainda não cadastrado.">
              {(jogadores) => (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {jogadores.filter((j) => j.ativo).map((j) => <PlayerCard key={j.id} jogador={j} time={t} />)}
                </div>
              )}
            </QueryState>

            <h2 className="text-white font-display text-3xl font-bold uppercase mt-12 mb-4">Jogos</h2>
            <QueryState query={jogos} emptyText="Nenhum jogo deste time ainda.">
              {(lista) => (
                <div className="grid gap-4 md:grid-cols-2">
                  {lista.map((j) => <JogoCard key={j.id} jogo={j} mostrarCompeticao />)}
                </div>
              )}
            </QueryState>

            <Galeria timeId={t.id} titulo="Fotos do time" />
          </Container>
        </>
      )}
    </QueryState>
  );
}
