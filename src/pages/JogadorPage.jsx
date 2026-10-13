import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Footprints, MapPin, Ruler, Scale, Shirt } from 'lucide-react';
import { getJogador, getEstatisticasCarreira, listEstatisticasPorCompeticao, listEventosJogador } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Container, QueryState, Crest, Avatar, BackLink, StatBox } from '../components/common/ui';
import { Badge, ShareButton } from '../components/ui';
import Galeria from '../components/common/Galeria';
import { PES, POSICOES, TIPOS_EVENTO, entityPath, media, nomeJogador, parseEntityId } from '../lib/format';

function Fato({ icone: Icone, rotulo, valor }) {
  if (valor == null || valor === '') return null;
  return (
    <div className="p-3 rounded-xl border border-ablf-line bg-ablf-surface min-w-0">
      <dt className="flex items-center gap-2 text-[0.68rem] uppercase tracking-wider text-gray-400">
        <Icone size={14} className="text-ablf-yellow shrink-0" aria-hidden="true" />{rotulo}
      </dt>
      <dd className="mt-0.5 text-white font-medium truncate">{valor}</dd>
    </div>
  );
}

export default function JogadorPage() {
  const id = parseEntityId(useParams().id);
  const jogador = useQuery({ queryKey: ['jogador', id], queryFn: () => getJogador(id), enabled: id != null });
  const carreira = useQuery({ queryKey: ['carreira', id], queryFn: () => getEstatisticasCarreira(id), enabled: id != null });
  const porCompeticao = useQuery({ queryKey: ['stats-competicao', id], queryFn: () => listEstatisticasPorCompeticao(id), enabled: id != null });
  const eventos = useQuery({ queryKey: ['eventos-jogador', id], queryFn: () => listEventosJogador(id), enabled: id != null });
  const j = jogador.data;
  usePageTitle(j ? nomeJogador(j) : 'Jogador', j && `Ficha técnica e estatísticas de ${nomeJogador(j)}.`);

  return (
    <div className="pt-20">
      <Container className="max-w-4xl !pt-4">
        <QueryState query={jogador} emptyText="Jogador não encontrado.">
          {() => {
            const c = carreira.data ?? { jogos: 0, gols: 0, assistencias: 0, amarelos: 0, vermelhos: 0 };
            const idade = j.ano_nascimento ? new Date().getFullYear() - j.ano_nascimento : null;
            const lances = (eventos.data ?? [])
              .filter((e) => e.jogo && (e.tipo === 'gol' || e.tipo === 'assistencia'))
              .sort((a, b) => new Date(b.jogo.data_hora ?? 0) - new Date(a.jogo.data_hora ?? 0))
              .slice(0, 12);
            return (
              <>
                <BackLink to={j.time ? entityPath('times', j.time.id, j.time.nome) : '/times'}>{j.time ? j.time.nome : 'Times'}</BackLink>

                <section className="grid sm:grid-cols-[240px_1fr] md:grid-cols-[280px_1fr] gap-5 sm:gap-8">
                  <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-none aspect-[4/5] rounded-3xl overflow-hidden border border-ablf-line bg-ablf-surface self-start">
                    <Avatar src={j.foto_url} nome={j.nome} className="w-full h-full" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
                    {j.numero != null && (
                      <span aria-label={`Camisa ${j.numero}`} className="absolute bottom-1 left-4 font-display font-black italic text-7xl sm:text-8xl text-white leading-none drop-shadow">{j.numero}</span>
                    )}
                    {j.time && <Crest src={j.time.escudo_url} nome={j.time.nome} size={44} className="absolute top-3 right-3" />}
                  </div>

                  <div className="min-w-0">
                    <span className="text-ablf-yellow font-display uppercase tracking-widest text-sm font-bold">Ficha técnica</span>
                    <h1 className="text-white font-display text-4xl sm:text-5xl md:text-6xl font-black italic uppercase leading-[0.95] break-words">{nomeJogador(j)}</h1>
                    {j.apelido && <p className="text-gray-400 mt-1">{j.nome}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {j.posicao && <Badge tone="success">{POSICOES[j.posicao]}</Badge>}
                      {!j.ativo && <Badge tone="warn">Inativo</Badge>}
                      {j.time && (
                        <Link to={entityPath('times', j.time.id, j.time.nome)} className="inline-flex items-center gap-2 text-gray-300 hover:text-ablf-yellow min-h-10">
                          <Crest src={j.time.escudo_url} nome={j.time.nome} size={22} />
                          <span className="font-display text-lg font-bold uppercase">{j.time.nome}</span>
                        </Link>
                      )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-2">
                      <Fato icone={Shirt} rotulo="Camisa" valor={j.numero} />
                      <Fato icone={Footprints} rotulo="Pé dominante" valor={PES[j.pe_dominante]} />
                      <Fato icone={Ruler} rotulo="Altura" valor={j.altura_cm && `${(j.altura_cm / 100).toFixed(2).replace('.', ',')} m`} />
                      <Fato icone={Scale} rotulo="Peso" valor={j.peso_kg && `${String(j.peso_kg).replace('.', ',')} kg`} />
                      <Fato icone={Calendar} rotulo="Nascimento" valor={j.ano_nascimento && `${j.ano_nascimento} (~${idade} anos)`} />
                      <Fato icone={MapPin} rotulo="Naturalidade" valor={j.naturalidade} />
                    </dl>
                    {j.bio && <p className="mt-4 text-gray-300 leading-relaxed whitespace-pre-line">{j.bio}</p>}
                    <div className="mt-4"><ShareButton title={nomeJogador(j)} text={`Ficha técnica de ${nomeJogador(j)} na ABLF`} /></div>
                  </div>
                </section>

                <section className="mt-10" aria-labelledby="carreira">
                  <h2 id="carreira" className="text-white font-display text-3xl font-black italic uppercase mb-3">Números da carreira</h2>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <StatBox label="Jogos" value={c.jogos} />
                    <StatBox label="Gols" value={c.gols} destaque />
                    <StatBox label="Assistências" value={c.assistencias} />
                    <StatBox label="Gols/jogo" value={media(c.gols, c.jogos)} />
                    <StatBox label="Amarelos" value={c.amarelos} />
                    <StatBox label="Vermelhos" value={c.vermelhos} />
                  </div>
                </section>

                {porCompeticao.data?.length > 0 && (
                  <section className="mt-10" aria-labelledby="por-comp">
                    <h2 id="por-comp" className="text-white font-display text-3xl font-black italic uppercase mb-3">Por competição</h2>
                    <div className="overflow-x-auto rounded-2xl border border-ablf-line bg-ablf-surface">
                      <table className="w-full text-sm">
                        <thead className="text-gray-400 uppercase text-xs tracking-wider">
                          <tr className="border-b border-ablf-line">
                            <th scope="col" className="py-3 px-4 text-left">Competição</th>
                            {[['J', 'Jogos'], ['G', 'Gols'], ['A', 'Assistências'], ['CA', 'Amarelos'], ['CV', 'Vermelhos']].map(([h, t]) => <th key={h} scope="col" title={t} className="py-3 px-3 text-center">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {porCompeticao.data.map((s) => (
                            <tr key={s.competicao_id} className="border-b border-ablf-line/60 last:border-0">
                              <td className="py-3 px-4 text-white min-w-[10rem]">{s.competicao?.nome} <span className="text-gray-400">({s.competicao?.ano})</span></td>
                              <td className="py-3 px-3 text-center text-gray-300">{s.jogos}</td>
                              <td className="py-3 px-3 text-center font-bold text-ablf-yellow">{s.gols}</td>
                              <td className="py-3 px-3 text-center text-gray-300">{s.assistencias}</td>
                              <td className="py-3 px-3 text-center text-gray-300">{s.amarelos}</td>
                              <td className="py-3 px-3 text-center text-gray-300">{s.vermelhos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {lances.length > 0 && (
                  <section className="mt-10" aria-labelledby="ult-lances">
                    <h2 id="ult-lances" className="text-white font-display text-3xl font-black italic uppercase mb-3">Últimos gols e assistências</h2>
                    <ul className="space-y-2">
                      {lances.map((e) => (
                        <li key={e.id}>
                          <Link to={`/jogos/${e.jogo.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3 min-h-12 rounded-xl border border-ablf-line bg-ablf-surface hover:border-ablf-green/60 text-sm">
                            <span className="text-white">{e.jogo.mandante.nome} <span className="text-ablf-yellow font-bold tabular-nums">{e.jogo.gols_mandante ?? ''}–{e.jogo.gols_visitante ?? ''}</span> {e.jogo.visitante.nome}</span>
                            <span className="text-gray-400">{TIPOS_EVENTO[e.tipo]}{e.minuto != null ? ` · ${e.minuto}'` : ''}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <Galeria jogadorId={j.id} titulo="Fotos" />
              </>
            );
          }}
        </QueryState>
      </Container>
    </div>
  );
}
