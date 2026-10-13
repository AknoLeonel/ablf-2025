import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { getJogo, listEventosJogo, listEscalacao } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Container, ErrorBlock, Loading, QueryState, BackLink } from '../components/common/ui';
import { Button } from '../components/ui';
import logoAblf from '../assets/logo.png';
import { formatDataJogo, nomeJogador, parseEntityId, PERIODOS, TIPOS_EVENTO } from '../lib/format';

// Súmula oficial em folha de papel: "Imprimir / Salvar como PDF" usa o diálogo do navegador.
export default function SumulaPage() {
  const id = parseEntityId(useParams().id);
  const jogoQuery = useQuery({ queryKey: ['jogo', id], queryFn: () => getJogo(id), enabled: id != null });
  const eventos = useQuery({ queryKey: ['eventos', id], queryFn: () => listEventosJogo(id), enabled: id != null });
  const escalacao = useQuery({ queryKey: ['escalacao', id], queryFn: () => listEscalacao(id), enabled: id != null });
  const jogo = jogoQuery.data;
  usePageTitle(jogo ? `Súmula – ${jogo.mandante.nome} × ${jogo.visitante.nome}` : 'Súmula');

  return (
    <div className="pt-20">
      <Container className="max-w-4xl !pt-4">
        <QueryState query={jogoQuery} emptyText="Jogo não encontrado.">
          {() => {
            if (jogo.status !== 'encerrado') {
              return (
                <>
                  <BackLink to={`/jogos/${jogo.id}`}>Voltar ao jogo</BackLink>
                  <p className="py-12 text-center text-gray-700">A súmula oficial fica disponível depois do encerramento da partida.</p>
                </>
              );
            }
            // documento oficial: nunca mostrar versão incompleta enquanto lances/escalação carregam ou falham
            if (eventos.isPending || escalacao.isPending) return <Loading />;
            if (eventos.isError || escalacao.isError) return <ErrorBlock error={eventos.error ?? escalacao.error} />;
            const evs = [...(eventos.data ?? [])].sort((a, b) => (a.periodo ?? 1) - (b.periodo ?? 1) || (a.minuto ?? 0) - (b.minuto ?? 0) || a.id - b.id);
            const nomeTime = (tid) => (tid === jogo.mandante.id ? jogo.mandante.nome : jogo.visitante.nome);
            const elenco = (tid) => (escalacao.data ?? []).filter((e) => e.time_id === tid);
            return (
              <>
                <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-4">
                  <BackLink to={`/jogos/${jogo.id}`}>Voltar ao jogo</BackLink>
                  <Button variant="primary" onClick={() => window.print()}><Printer size={18} />Imprimir / salvar PDF</Button>
                </div>

                <article className="print-sheet rounded-xl bg-white text-gray-900 p-6 sm:p-10 text-sm leading-relaxed">
                  <header className="flex items-center gap-4 pb-4 border-b-2 border-gray-800">
                    <img src={logoAblf} alt="" width="56" height="56" className="w-14 h-14 object-contain" />
                    <div>
                      <h1 className="font-display text-2xl font-black uppercase leading-none">Associação Brasileira de Ligas de Futsal</h1>
                      <div className="text-xs uppercase tracking-widest text-gray-700 mt-1">Súmula oficial da partida · nº {jogo.id}</div>
                    </div>
                  </header>

                  <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-1">
                    {[['Competição', jogo.competicao ? `${jogo.competicao.nome} (${jogo.competicao.ano})` : '—'],
                      ['Fase / Rodada', [jogo.fase || (jogo.grupo && `Grupo ${jogo.grupo}`), jogo.rodada && `Rodada ${jogo.rodada}`].filter(Boolean).join(' · ') || '—'],
                      ['Data e hora', formatDataJogo(jogo.data_hora)], ['Local', jogo.local || '—'],
                      ['Árbitro principal', jogo.arbitro_principal || '—'], ['Árbitro auxiliar', jogo.arbitro_auxiliar || '—'],
                      ['Anotador', jogo.anotador || '—']].map(([k, v]) => (
                      <div key={k} className="flex gap-2"><dt className="font-bold min-w-32">{k}:</dt><dd>{v}</dd></div>
                    ))}
                  </dl>

                  <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 border-y border-gray-400 text-center">
                    <div className="font-display text-2xl font-black uppercase leading-tight">{jogo.mandante.nome}</div>
                    <div className="font-display text-5xl font-black tabular-nums">{jogo.gols_mandante} × {jogo.gols_visitante}</div>
                    <div className="font-display text-2xl font-black uppercase leading-tight">{jogo.visitante.nome}</div>
                  </div>

                  <section className="mt-6" aria-label="Escalações">
                    <h2 className="font-display text-lg font-black uppercase mb-2">Equipes</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {[jogo.mandante, jogo.visitante].map((t) => (
                        <div key={t.id}>
                          <div className="font-bold uppercase border-b border-gray-400 mb-1">{t.nome}</div>
                          {elenco(t.id).length === 0 ? <p className="text-gray-700">Escalação não informada.</p> : (
                            <ol className="columns-1">
                              {elenco(t.id).map(({ jogador, titular }) => (
                                <li key={jogador.id} className="flex gap-2"><span className="w-7 text-right font-mono">{jogador.numero ?? '–'}</span><span>{nomeJogador(jogador)}{titular ? '' : ' (res.)'}</span></li>
                              ))}
                            </ol>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-6" aria-label="Ocorrências">
                    <h2 className="font-display text-lg font-black uppercase mb-2">Ocorrências</h2>
                    {evs.length === 0 ? <p className="text-gray-700">Nenhuma ocorrência registrada.</p> : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left border-b border-gray-600"><th className="py-1 pr-2">Tempo</th><th className="pr-2">Min</th><th className="pr-2">Equipe</th><th className="pr-2">Atleta</th><th>Ocorrência</th></tr>
                        </thead>
                        <tbody>
                          {evs.map((e) => (
                            <tr key={e.id} className="border-b border-gray-300 align-top">
                              <td className="py-1 pr-2">{PERIODOS[e.periodo ?? 1]}</td><td className="pr-2">{e.minuto != null ? `${e.minuto}'` : '–'}</td>
                              <td className="pr-2">{nomeTime(e.time_id)}</td><td className="pr-2">{nomeJogador(e.jogador)}</td>
                              <td>{TIPOS_EVENTO[e.tipo]}{e.motivo ? ` – ${e.motivo}` : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>

                  {jogo.observacoes && <section className="mt-6"><h2 className="font-display text-lg font-black uppercase mb-1">Observações</h2><p>{jogo.observacoes}</p></section>}

                  <section className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs" aria-label="Assinaturas">
                    {['Árbitro principal', 'Anotador', `Capitão ${jogo.mandante.nome}`, `Capitão ${jogo.visitante.nome}`].map((r) => (
                      <div key={r}><div className="border-t border-gray-800 pt-1">{r}</div></div>
                    ))}
                  </section>

                  <footer className="mt-8 pt-3 border-t border-gray-300 text-xs text-gray-700">
                    {jogo.sumula_fechada && jogo.fechada_em ? `Súmula fechada em ${new Date(jogo.fechada_em).toLocaleString('pt-BR')}. ` : 'Súmula ainda não fechada oficialmente. '}
                    Documento gerado pelo sistema da ABLF em {new Date().toLocaleString('pt-BR')}.
                  </footer>
                </article>
              </>
            );
          }}
        </QueryState>
      </Container>
    </div>
  );
}
