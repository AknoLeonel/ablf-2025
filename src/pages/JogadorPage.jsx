import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getJogador,
  getEstatisticasCarreira,
  listEstatisticasPorCompeticao,
  listEventosJogador,
} from '../lib/api';
import { Container, QueryState, Crest, Avatar, BackLink, StatBox } from '../components/common/ui';
import Galeria from '../components/common/Galeria';
import { PES, POSICOES, TIPOS_EVENTO, entityPath, media, nomeJogador, parseEntityId } from '../lib/format';

function Ficha({ rotulo, valor }) {
  if (valor == null || valor === '') return null;
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-800 text-sm">
      <dt className="text-gray-500 uppercase tracking-wider">{rotulo}</dt>
      <dd className="text-white font-medium text-right">{valor}</dd>
    </div>
  );
}

export default function JogadorPage() {
  const id = parseEntityId(useParams().id);
  const jogador = useQuery({ queryKey: ['jogador', id], queryFn: () => getJogador(id), enabled: id != null });
  const carreira = useQuery({ queryKey: ['carreira', id], queryFn: () => getEstatisticasCarreira(id), enabled: id != null });
  const porCompeticao = useQuery({ queryKey: ['stats-competicao', id], queryFn: () => listEstatisticasPorCompeticao(id), enabled: id != null });
  const eventos = useQuery({ queryKey: ['eventos-jogador', id], queryFn: () => listEventosJogador(id), enabled: id != null });

  return (
    <QueryState query={jogador} emptyText="Jogador não encontrado.">
      {(j) => {
        const c = carreira.data ?? { jogos: 0, gols: 0, assistencias: 0, amarelos: 0, vermelhos: 0 };
        const lances = (eventos.data ?? [])
          .filter((e) => e.jogo && (e.tipo === 'gol' || e.tipo === 'assistencia'))
          .sort((a, b) => new Date(b.jogo.data_hora ?? 0) - new Date(a.jogo.data_hora ?? 0))
          .slice(0, 15);
        return (
          <div className="pt-24">
            <Container>
              <BackLink to={j.time ? entityPath('times', j.time.id, j.time.nome) : '/times'}>
                {j.time ? j.time.nome : 'Times'}
              </BackLink>

              <div className="grid md:grid-cols-[320px_1fr] gap-8">
                <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 aspect-[4/5] self-start">
                  <Avatar src={j.foto_url} nome={j.nome} className="w-full h-full" />
                  {j.numero != null && (
                    <span className="absolute top-3 left-4 font-display font-black italic text-7xl text-white/90 drop-shadow">{j.numero}</span>
                  )}
                </div>

                <div>
                  <span className="text-ablf-yellow font-display uppercase tracking-widest text-lg font-bold">
                    Ficha técnica
                  </span>
                  <h1 className="text-white font-display text-5xl md:text-6xl font-black italic uppercase leading-none mt-1">
                    {nomeJogador(j)}
                  </h1>
                  {j.apelido && <p className="text-gray-500 mt-1">{j.nome}</p>}
                  {j.time && (
                    <Link to={entityPath('times', j.time.id, j.time.nome)} className="inline-flex items-center gap-2 mt-4 text-gray-300 hover:text-ablf-yellow">
                      <Crest src={j.time.escudo_url} nome={j.time.nome} size={28} />
                      <span className="font-display text-xl font-bold uppercase">{j.time.nome}</span>
                    </Link>
                  )}

                  <dl className="mt-6 grid sm:grid-cols-2 gap-x-8">
                    <Ficha rotulo="Posição" valor={POSICOES[j.posicao]} />
                    <Ficha rotulo="Pé dominante" valor={PES[j.pe_dominante]} />
                    <Ficha rotulo="Altura" valor={j.altura_cm && `${(j.altura_cm / 100).toFixed(2).replace('.', ',')} m`} />
                    <Ficha rotulo="Peso" valor={j.peso_kg && `${String(j.peso_kg).replace('.', ',')} kg`} />
                    <Ficha rotulo="Nascimento" valor={j.ano_nascimento} />
                    <Ficha rotulo="Naturalidade" valor={j.naturalidade} />
                  </dl>

                  {j.bio && <p className="mt-6 text-gray-300 leading-relaxed whitespace-pre-line">{j.bio}</p>}
                </div>
              </div>

              <section className="mt-12">
                <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Números da carreira</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <StatBox label="Jogos" value={c.jogos} />
                  <StatBox label="Gols" value={c.gols} destaque />
                  <StatBox label="Assistências" value={c.assistencias} />
                  <StatBox label="Gols/jogo" value={media(c.gols, c.jogos)} />
                  <StatBox label="Amarelos" value={c.amarelos} />
                  <StatBox label="Vermelhos" value={c.vermelhos} />
                </div>
              </section>

              {porCompeticao.data?.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Por competição</h2>
                  <div className="overflow-x-auto rounded-xl border border-gray-800">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
                        <tr>
                          <th scope="col" className="py-3 px-4 text-left">Competição</th>
                          {['J', 'Gols', 'Assist.', 'CA', 'CV'].map((h) => <th key={h} scope="col" className="py-3 px-3 text-center">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {porCompeticao.data.map((s) => (
                          <tr key={s.competicao_id} className="border-t border-gray-800">
                            <td className="py-3 px-4 text-white">{s.competicao?.nome} <span className="text-gray-500">({s.competicao?.ano})</span></td>
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
                <section className="mt-12">
                  <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">Últimos gols e assistências</h2>
                  <ul className="space-y-2">
                    {lances.map((e) => (
                      <li key={e.id}>
                        <Link to={`/jogos/${e.jogo.id}`} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-900/60 border border-gray-800 rounded-lg hover:border-ablf-green/60 text-sm">
                          <span className="text-white">
                            {e.jogo.mandante.nome} <span className="text-ablf-yellow font-bold">{e.jogo.gols_mandante ?? ''} × {e.jogo.gols_visitante ?? ''}</span> {e.jogo.visitante.nome}
                          </span>
                          <span className="text-gray-500">{TIPOS_EVENTO[e.tipo]}{e.minuto != null ? ` · ${e.minuto}'` : ''}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Galeria jogadorId={j.id} titulo="Fotos" />
            </Container>
          </div>
        );
      }}
    </QueryState>
  );
}
