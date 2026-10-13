import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClassificacao, listJogos } from '../lib/api';
import { useCompeticao } from '../lib/useCompeticao';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, CompeticaoPicker, QueryState, Crest } from '../components/common/ui';
import JogoCard from '../components/common/JogoCard';
import { entityPath } from '../lib/format';

// `mobile: false` esconde a coluna no celular (a tabela rola na horizontal mesmo assim).
const COLUNAS = [
  { chave: 'pontos', sigla: 'P', nome: 'Pontos', mobile: true },
  { chave: 'jogos', sigla: 'J', nome: 'Jogos', mobile: true },
  { chave: 'vitorias', sigla: 'V', nome: 'Vitórias', mobile: true },
  { chave: 'empates', sigla: 'E', nome: 'Empates', mobile: false },
  { chave: 'derrotas', sigla: 'D', nome: 'Derrotas', mobile: false },
  { chave: 'gols_pro', sigla: 'GP', nome: 'Gols pró', mobile: false },
  { chave: 'gols_contra', sigla: 'GC', nome: 'Gols contra', mobile: false },
  { chave: 'saldo_gols', sigla: 'SG', nome: 'Saldo de gols', mobile: true },
];

function Tabela({ linhas, titulo, competicao }) {
  return (
    <section aria-label={titulo || 'Classificação'}>
      {titulo && <h2 className="font-display text-2xl font-bold uppercase text-ablf-green mb-2">{titulo}</h2>}
      <div className="overflow-x-auto rounded-2xl border border-ablf-line bg-ablf-surface">
        <table className="w-full text-sm">
          <caption className="sr-only">Classificação de {competicao}{titulo ? ` – ${titulo}` : ''}</caption>
          <thead className="text-gray-400 uppercase text-xs tracking-wider">
            <tr className="border-b border-ablf-line">
              <th scope="col" className="py-3 pl-3 pr-1 text-left w-9">#</th>
              <th scope="col" className="py-3 px-2 text-left sticky left-9 bg-ablf-surface">Time</th>
              {COLUNAS.map((c) => (
                <th key={c.chave} scope="col" title={c.nome} className={`py-3 px-2 text-center ${c.mobile ? '' : 'hidden sm:table-cell'} ${c.chave === 'pontos' ? 'text-ablf-yellow' : ''}`}>{c.sigla}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.time_id} className="border-b border-ablf-line/60 last:border-0 hover:bg-ablf-raised">
                <td className={`py-3 pl-3 pr-1 font-display font-bold text-lg ${l.posicao === 1 ? 'text-ablf-yellow border-l-4 border-ablf-yellow -ml-px' : 'text-gray-400'}`}>{l.posicao}</td>
                <td className="py-2 px-2 sticky left-9 bg-ablf-surface">
                  <Link to={entityPath('times', l.time_id, l.time_nome)} className="flex items-center gap-2.5 text-white hover:text-ablf-yellow min-w-[8.5rem]">
                    <Crest src={l.escudo_url} nome={l.time_nome} size={28} />
                    <span className="font-display text-lg font-bold uppercase leading-tight line-clamp-2">{l.time_nome}</span>
                  </Link>
                </td>
                {COLUNAS.map((c) => (
                  <td key={c.chave} className={`py-3 px-2 text-center tabular-nums ${c.mobile ? '' : 'hidden sm:table-cell'} ${c.chave === 'pontos' ? 'font-bold text-white text-base' : 'text-gray-400'}`}>
                    {c.chave === 'saldo_gols' && l[c.chave] > 0 ? `+${l[c.chave]}` : l[c.chave]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function TabelaPage() {
  usePageTitle('Tabela de classificação', 'Classificação atualizada das competições da ABLF.');
  const { query: compQuery, competicoes, atual, setAtual } = useCompeticao();
  const tabela = useQuery({
    queryKey: ['classificacao', atual?.id],
    queryFn: () => getClassificacao(atual.id),
    enabled: Boolean(atual),
  });
  // mesma consulta da página de jogos (fica em cache): usada para a fase de mata-mata
  const jogos = useQuery({ queryKey: ['jogos', atual?.id], queryFn: () => listJogos({ competicaoId: atual.id }), enabled: Boolean(atual) });
  const mataMata = (jogos.data ?? []).filter((j) => j.tipo_fase === 'mata_mata');
  const fases = [...new Set(mataMata.map((j) => j.fase || 'Mata-mata'))];

  return (
    <>
      <PageHeader eyebrow="Classificação" title="Tabela" subtitle={atual ? [atual.nome, atual.formato].filter(Boolean).join(' · ') : undefined}>
        <CompeticaoPicker competicoes={competicoes} atual={atual} onChange={setAtual} />
      </PageHeader>
      <Container className="max-w-5xl">
        <QueryState query={compQuery} emptyText="Nenhuma competição cadastrada ainda.">
          {() => (
            <QueryState query={tabela} emptyText="Nenhum time inscrito nesta competição.">
              {(linhas) => {
                const grupos = [...new Set(linhas.map((l) => l.grupo ?? ''))].sort();
                return (
                  <div className="space-y-8">
                    {grupos.map((g) => (
                      <Tabela key={g} titulo={g ? `Grupo ${g}` : ''} competicao={atual.nome} linhas={linhas.filter((l) => (l.grupo ?? '') === g)} />
                    ))}
                  </div>
                );
              }}
            </QueryState>
          )}
        </QueryState>

        {fases.length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-white font-display text-3xl md:text-4xl font-black italic uppercase">Fase final</h2>
            {fases.map((f) => (
              <section key={f} aria-label={f}>
                <h3 className="font-display text-2xl font-bold uppercase text-ablf-green mb-3">{f}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {mataMata.filter((j) => (j.fase || 'Mata-mata') === f).map((j) => <JogoCard key={j.id} jogo={j} />)}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          P pontos · J jogos · V vitórias · E empates · D derrotas · GP gols pró · GC gols contra · SG saldo de gols.
          Desempate: vitórias, saldo de gols, gols pró. Considera só jogos encerrados da fase classificatória.
        </p>
      </Container>
    </>
  );
}
