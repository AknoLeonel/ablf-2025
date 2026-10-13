import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listJogos } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { PageHeader, Container, CompeticaoPicker, QueryState } from '../components/common/ui';
import JogoCard from '../components/common/JogoCard';

const FILTROS = [
  ['todos', 'Todos'],
  ['resultados', 'Resultados'],
  ['proximos', 'Próximos'],
];

export default function JogosPage() {
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const [filtro, setFiltro] = useState('todos');

  const jogosQuery = useQuery({
    queryKey: ['jogos', atual?.id],
    queryFn: () => listJogos({ competicaoId: atual.id }),
    enabled: Boolean(atual),
  });

  const grupos = useMemo(() => {
    const jogos = (jogosQuery.data ?? []).filter((j) =>
      filtro === 'todos' ? true : filtro === 'resultados' ? j.status === 'encerrado' : j.status !== 'encerrado' && j.status !== 'cancelado',
    );
    const map = new Map();
    for (const j of jogos) {
      const chave = j.rodada ?? 0;
      if (!map.has(chave)) map.set(chave, []);
      map.get(chave).push(j);
    }
    return [...map.entries()];
  }, [jogosQuery.data, filtro]);

  return (
    <>
      <PageHeader eyebrow="Calendário" title="Jogos e resultados" subtitle={atual?.nome}>
        <div className="flex flex-wrap items-center gap-4">
          <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={setAtual} />
          <div role="group" aria-label="Filtrar jogos" className="inline-flex rounded-lg overflow-hidden border border-gray-700">
            {FILTROS.map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={`px-4 py-2 text-sm font-bold transition-colors ${filtro === valor ? 'bg-ablf-green text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>
      <Container>
        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (
            <QueryState query={jogosQuery} emptyText="Nenhum jogo cadastrado nesta competição.">
              {() =>
                grupos.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">Nenhum jogo neste filtro.</p>
                ) : (
                  <div className="space-y-10">
                    {grupos.map(([rodada, jogos]) => (
                      <section key={rodada}>
                        <h2 className="font-display text-2xl font-bold uppercase text-ablf-green mb-4">
                          {rodada ? `Rodada ${rodada}` : 'Jogos'}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                          {jogos.map((j) => <JogoCard key={j.id} jogo={j} />)}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              }
            </QueryState>
          )}
        </QueryState>
      </Container>
    </>
  );
}
