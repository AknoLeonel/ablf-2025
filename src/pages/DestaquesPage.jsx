import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRanking, listDestaquesManuais } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { PageHeader, Container, CompeticaoPicker, QueryState } from '../components/common/ui';
import RankingList from '../components/common/RankingList';
import PlayerCard from '../components/common/PlayerCard';

const TITULO_DESTAQUE = { craque_da_rodada: 'Craque da rodada', jogador_em_destaque: 'Em destaque' };

function Rankings({ competicaoId }) {
  const gols = useQuery({ queryKey: ['ranking', competicaoId, 'gols'], queryFn: () => listRanking({ competicaoId, campo: 'gols' }) });
  const assist = useQuery({ queryKey: ['ranking', competicaoId, 'assistencias'], queryFn: () => listRanking({ competicaoId, campo: 'assistencias' }) });
  const amarelos = useQuery({ queryKey: ['ranking', competicaoId, 'amarelos'], queryFn: () => listRanking({ competicaoId, campo: 'amarelos', limit: 3 }) });

  const vazio = [gols, assist, amarelos].every((q) => q.isSuccess && !q.data.length);
  return (
    <QueryState
      query={{ isPending: gols.isPending, isError: gols.isError, error: gols.error, data: vazio ? [] : [1] }}
      emptyText="As estatísticas aparecem assim que os primeiros jogos forem encerrados."
    >
      {() => (
        <div className="grid lg:grid-cols-2 gap-6">
          <RankingList titulo="Artilharia" itens={gols.data} campo="gols" unidade="gols" />
          <RankingList titulo="Garçons" itens={assist.data} campo="assistencias" unidade="assistências" />
          <RankingList titulo="Cartões amarelos" itens={amarelos.data} campo="amarelos" unidade="amarelos" />
        </div>
      )}
    </QueryState>
  );
}

export default function DestaquesPage() {
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const manuais = useQuery({ queryKey: ['destaques-manuais'], queryFn: () => listDestaquesManuais({ limit: 8 }) });

  return (
    <>
      <PageHeader eyebrow="Os melhores" title="Destaques" subtitle="Artilheiros, garçons e craques das competições da ABLF.">
        <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={setAtual} />
      </PageHeader>
      <Container>
        {manuais.data?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Escolhidos pela ABLF</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {manuais.data.map((d) => (
                <div key={d.id}>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-ablf-green">
                    {TITULO_DESTAQUE[d.tipo]}{d.rodada ? ` · Rodada ${d.rodada}` : ''}
                  </div>
                  <PlayerCard jogador={d.jogador} />
                  {d.texto && <p className="mt-2 text-sm text-gray-400">{d.texto}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (atual ? <Rankings competicaoId={atual.id} /> : null)}
        </QueryState>
      </Container>
    </>
  );
}
