import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRanking, listDestaquesManuais } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, CompeticaoPicker, QueryState } from '../components/common/ui';
import { Tabs } from '../components/ui';
import { painelProps } from '../components/ui/tabsProps';
import RankingList from '../components/common/RankingList';
import PlayerCard from '../components/common/PlayerCard';

const TITULO_DESTAQUE = { craque_da_rodada: 'Craque da rodada', jogador_em_destaque: 'Em destaque' };
const RANKINGS = [
  { id: 'gols', label: 'Artilharia', titulo: 'Artilharia', campo: 'gols', unidade: 'gols' },
  { id: 'assistencias', label: 'Garçons', titulo: 'Garçons', campo: 'assistencias', unidade: 'assistências' },
  { id: 'amarelos', label: 'Disciplina', titulo: 'Cartões amarelos', campo: 'amarelos', unidade: 'amarelos' },
];

function Ranking({ competicaoId, def }) {
  const q = useQuery({
    queryKey: ['ranking', competicaoId, def.campo, 10],
    queryFn: () => listRanking({ competicaoId, campo: def.campo, limit: 10 }),
  });
  return (
    <QueryState query={q} emptyText="Os números aparecem assim que os primeiros jogos forem encerrados.">
      {(itens) => <RankingList titulo={def.titulo} itens={itens} campo={def.campo} unidade={def.unidade} />}
    </QueryState>
  );
}

export default function DestaquesPage() {
  usePageTitle('Destaques', 'Artilheiros, garçons e craques das competições da ABLF.');
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const [aba, setAba] = useState('gols');
  const manuais = useQuery({
    queryKey: ['destaques-manuais', atual?.id],
    queryFn: () => listDestaquesManuais({ competicaoId: atual.id, limit: 8 }),
    enabled: Boolean(atual),
  });
  const def = RANKINGS.find((r) => r.id === aba);

  return (
    <>
      <PageHeader eyebrow="Os melhores" title="Destaques" subtitle="Artilheiros, garçons e craques das competições da ABLF.">
        <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={setAtual} />
      </PageHeader>
      <Container className="max-w-4xl">
        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (
            <>
              {manuais.data?.length > 0 && (
                <section className="mb-10" aria-labelledby="escolhidos">
                  <h2 id="escolhidos" className="text-white font-display text-3xl font-black italic uppercase mb-3">Escolhidos pela ABLF</h2>
                  <ul className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
                    {manuais.data.map((d) => (
                      <li key={d.id} className="shrink-0 w-[60%] sm:w-48 snap-start md:w-auto">
                        <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-wider text-ablf-green">
                          {TITULO_DESTAQUE[d.tipo]}{d.rodada ? ` · Rodada ${d.rodada}` : ''}
                        </div>
                        <PlayerCard jogador={d.jogador} />
                        {d.texto && <p className="mt-2 text-sm text-gray-400">{d.texto}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <Tabs tabs={RANKINGS} value={aba} onChange={setAba} label="Rankings" />
              <div {...painelProps(RANKINGS, aba)} className="mt-5">
                {atual && <Ranking key={`${atual.id}-${def.id}`} competicaoId={atual.id} def={def} />}
              </div>
            </>
          )}
        </QueryState>
      </Container>
    </>
  );
}
