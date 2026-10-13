import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listJogos } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, CompeticaoPicker, QueryState } from '../components/common/ui';
import { Chips, Tabs } from '../components/ui';
import { painelProps } from '../components/ui/tabsProps';
import JogoCard from '../components/common/JogoCard';

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'proximos', label: 'Próximos' },
];

const chaveGrupo = (j) => (j.tipo_fase === 'mata_mata' ? `fase:${j.fase || 'Mata-mata'}` : `rodada:${j.rodada ?? 0}`);
const rotuloGrupo = (chave) => {
  const [tipo, valor] = [chave.slice(0, chave.indexOf(':')), chave.slice(chave.indexOf(':') + 1)];
  return tipo === 'fase' ? valor : Number(valor) ? `Rodada ${valor}` : 'Jogos';
};

export default function JogosPage() {
  usePageTitle('Jogos e resultados', 'Calendário, placares ao vivo e resultados das competições da ABLF.');
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const [filtro, setFiltro] = useState('todos');
  const [escolhida, setEscolhida] = useState(null);

  const jogosQuery = useQuery({
    queryKey: ['jogos', atual?.id],
    queryFn: () => listJogos({ competicaoId: atual.id }),
    enabled: Boolean(atual),
    refetchInterval: (q) => (q.state.data?.some((j) => j.status === 'ao_vivo') ? 20_000 : false),
  });

  const grupos = useMemo(() => {
    const jogos = (jogosQuery.data ?? []).filter((j) =>
      filtro === 'todos' ? true : filtro === 'resultados' ? j.status === 'encerrado' : j.status !== 'encerrado' && j.status !== 'cancelado',
    );
    const map = new Map();
    for (const j of jogos) {
      const k = chaveGrupo(j);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(j);
    }
    return [...map.entries()].map(([chave, lista]) => ({ chave, lista }));
  }, [jogosQuery.data, filtro]);

  // grupo exibido: o escolhido; senão o que tem jogo ao vivo/agendado; senão o último
  const padrao = grupos.find((g) => g.lista.some((j) => j.status === 'ao_vivo' || j.status === 'agendado'))?.chave ?? grupos.at(-1)?.chave;
  const ativa = escolhida === 'todas' || grupos.some((g) => g.chave === escolhida) ? escolhida : padrao;
  const visiveis = ativa === 'todas' ? grupos : grupos.filter((g) => g.chave === ativa);
  const chips = [{ id: 'todas', label: 'Todas' }, ...grupos.map((g) => ({ id: g.chave, label: rotuloGrupo(g.chave) }))];

  return (
    <>
      <PageHeader eyebrow="Calendário" title="Jogos e resultados" subtitle={atual?.nome}>
        <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={(id) => { setEscolhida(null); setAtual(id); }} />
      </PageHeader>
      <Container className="max-w-5xl">
        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (
            <QueryState query={jogosQuery} emptyText="Nenhum jogo cadastrado nesta competição.">
              {() => (
                <>
                  <Tabs tabs={FILTROS} value={filtro} onChange={(f) => { setFiltro(f); setEscolhida(null); }} label="Filtrar jogos" />
                  <div className="mt-4"><Chips items={chips} value={ativa} onChange={setEscolhida} label="Rodada" /></div>
                  <div {...painelProps(FILTROS, filtro)} className="mt-6">
                    {visiveis.length === 0 ? (
                      <p className="text-gray-400 text-center py-12">Nenhum jogo neste filtro.</p>
                    ) : (
                      <div className="space-y-10">
                        {visiveis.map(({ chave, lista }) => (
                          <section key={chave} aria-label={rotuloGrupo(chave)}>
                            <h2 className="font-display text-2xl font-bold uppercase text-ablf-green mb-3">{rotuloGrupo(chave)}</h2>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {lista.map((j) => <JogoCard key={j.id} jogo={j} />)}
                            </div>
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </QueryState>
          )}
        </QueryState>
      </Container>
    </>
  );
}
