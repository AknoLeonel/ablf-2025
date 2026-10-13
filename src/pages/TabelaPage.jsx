import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClassificacao } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { PageHeader, Container, CompeticaoPicker, QueryState, Crest } from '../components/common/ui';
import { entityPath } from '../lib/format';

const COLUNAS = [
  ['pontos', 'P', 'Pontos'],
  ['jogos', 'J', 'Jogos'],
  ['vitorias', 'V', 'Vitórias'],
  ['empates', 'E', 'Empates'],
  ['derrotas', 'D', 'Derrotas'],
  ['gols_pro', 'GP', 'Gols pró'],
  ['gols_contra', 'GC', 'Gols contra'],
  ['saldo_gols', 'SG', 'Saldo de gols'],
];

export default function TabelaPage() {
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const tabela = useQuery({
    queryKey: ['classificacao', atual?.id],
    queryFn: () => getClassificacao(atual.id),
    enabled: Boolean(atual),
  });

  return (
    <>
      <PageHeader eyebrow="Classificação" title="Tabela" subtitle={atual ? `${atual.nome} · ${atual.formato ?? ''}` : undefined}>
        <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={setAtual} />
      </PageHeader>
      <Container>
        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (
            <QueryState query={tabela} emptyText="Nenhum time inscrito nesta competição.">
              {(linhas) => (
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Classificação de {atual.nome}</caption>
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                      <tr>
                        <th scope="col" className="py-3 pl-4 pr-2 text-left w-10">#</th>
                        <th scope="col" className="py-3 px-2 text-left">Time</th>
                        {COLUNAS.map(([chave, sigla, nome]) => (
                          <th key={chave} scope="col" title={nome} className={`py-3 px-2 text-center ${chave === 'pontos' ? 'text-ablf-yellow' : ''}`}>
                            {sigla}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((l) => (
                        <tr key={l.time_id} className="border-t border-gray-800 hover:bg-gray-900/60">
                          <td className={`py-3 pl-4 pr-2 font-display font-bold text-lg ${l.posicao === 1 ? 'text-ablf-yellow' : 'text-gray-400'}`}>{l.posicao}</td>
                          <td className="py-3 px-2">
                            <Link to={entityPath('times', l.time_id, l.time_nome)} className="flex items-center gap-3 text-white font-bold hover:text-ablf-yellow">
                              <Crest src={l.escudo_url} nome={l.time_nome} size={28} />
                              <span className="font-display text-lg uppercase">{l.time_nome}</span>
                            </Link>
                          </td>
                          {COLUNAS.map(([chave]) => (
                            <td key={chave} className={`py-3 px-2 text-center tabular-nums ${chave === 'pontos' ? 'font-bold text-white' : 'text-gray-400'}`}>
                              {chave === 'saldo_gols' && l[chave] > 0 ? `+${l[chave]}` : l[chave]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </QueryState>
          )}
        </QueryState>
        <p className="mt-4 text-xs text-gray-600">
          P pontos · J jogos · V vitórias · E empates · D derrotas · GP gols pró · GC gols contra · SG saldo de gols.
          Critérios de desempate: vitórias, saldo de gols, gols pró. Considera apenas jogos encerrados.
        </p>
      </Container>
    </>
  );
}
