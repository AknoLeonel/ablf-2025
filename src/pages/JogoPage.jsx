import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, FileText, MapPin, UserCheck } from 'lucide-react';
import { getJogo, listEventosJogo, listEscalacao } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Container, QueryState, Crest, BackLink } from '../components/common/ui';
import { Button, Badge, Chips, ShareButton, Tabs } from '../components/ui';
import { painelProps } from '../components/ui/tabsProps';
import JogoStatus from '../components/common/JogoStatus';
import Galeria from '../components/common/Galeria';
import { entityPath, formatDataJogo, nomeJogador, parseEntityId, PERIODOS, POSICOES, TIPOS_EVENTO } from '../lib/format';

const TABS = [
  { id: 'lances', label: 'Lances' },
  { id: 'escalacoes', label: 'Escalações' },
  { id: 'fotos', label: 'Fotos' },
];
const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'gols', label: 'Gols' },
  { id: 'cartoes', label: 'Cartões' },
  { id: 'faltas', label: 'Faltas' },
];
const PASSA = {
  todos: () => true,
  gols: (e) => e.tipo === 'gol' || e.tipo === 'gol_contra' || e.tipo === 'assistencia',
  cartoes: (e) => e.tipo === 'amarelo' || e.tipo === 'vermelho',
  faltas: (e) => e.tipo === 'falta',
};

function Icone({ tipo }) {
  if (tipo === 'amarelo' || tipo === 'vermelho')
    return <span aria-hidden="true" className={`inline-block w-3.5 h-5 rounded-sm ${tipo === 'amarelo' ? 'bg-yellow-400' : 'bg-red-600'}`} />;
  if (tipo === 'gol' || tipo === 'gol_contra') return <span aria-hidden="true" className="text-lg leading-none">⚽</span>;
  return (
    <span aria-hidden="true" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[0.6rem] font-black text-gray-300">
      {tipo === 'assistencia' ? 'A' : 'F'}
    </span>
  );
}

function Evento({ ev, lado }) {
  const texto = (
    <div className={lado === 'mandante' ? 'text-right' : 'text-left'}>
      <Link to={entityPath('jogadores', ev.jogador.id, ev.jogador.nome)} className="font-medium text-white hover:text-ablf-yellow">
        {nomeJogador(ev.jogador)}
      </Link>
      <div className="text-xs text-gray-500">
        {TIPOS_EVENTO[ev.tipo]}{ev.motivo ? ` · ${ev.motivo}` : ''}
      </div>
    </div>
  );
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 border-b border-ablf-line/70 text-sm">
      <div>{lado === 'mandante' && texto}</div>
      <div className="flex flex-col items-center gap-1 w-11">
        <Icone tipo={ev.tipo} />
        <span className="font-mono text-xs text-gray-500">{ev.minuto != null ? `${ev.minuto}'` : ''}</span>
      </div>
      <div>{lado === 'visitante' && texto}</div>
    </li>
  );
}

function Comparativo({ rotulo, a, b }) {
  const total = a + b || 1;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-white tabular-nums w-6">{a}</span>
        <span className="text-xs uppercase tracking-wider text-gray-400">{rotulo}</span>
        <span className="font-bold text-white tabular-nums w-6 text-right">{b}</span>
      </div>
      <div className="mt-1 flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <div className="bg-ablf-green" style={{ width: `${(a / total) * 100}%` }} />
        <div className="bg-ablf-yellow" style={{ width: `${(b / total) * 100}%` }} />
      </div>
    </div>
  );
}

function Elenco({ time, itens }) {
  if (!itens.length) return null;
  const titulares = itens.filter((i) => i.titular);
  const reservas = itens.filter((i) => !i.titular);
  const lista = (arr) => (
    <ul className="space-y-1">
      {arr.map(({ jogador }) => (
        <li key={jogador.id} className="flex items-center gap-3 min-h-9 text-sm">
          <span className="w-7 text-right font-mono text-gray-500">{jogador.numero ?? ''}</span>
          <Link to={entityPath('jogadores', jogador.id, jogador.nome)} className="text-white hover:text-ablf-yellow">{nomeJogador(jogador)}</Link>
          <span className="text-xs text-gray-600">{POSICOES[jogador.posicao] ?? ''}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-ablf-green mb-2">
        <Crest src={time.escudo_url} nome={time.nome} size={24} />{time.nome}
      </h3>
      {lista(titulares)}
      {reservas.length > 0 && (<><div className="mt-3 mb-1 text-xs uppercase tracking-wider text-gray-500">Reservas</div>{lista(reservas)}</>)}
    </div>
  );
}

export default function JogoPage() {
  const id = parseEntityId(useParams().id);
  const [aba, setAba] = useState('lances');
  const [filtro, setFiltro] = useState('todos');

  const jogoQuery = useQuery({
    queryKey: ['jogo', id],
    queryFn: () => getJogo(id),
    enabled: id != null,
    refetchInterval: (q) => (q.state.data?.status === 'ao_vivo' ? 15_000 : false),
  });
  const aoVivo = jogoQuery.data?.status === 'ao_vivo';
  const vivo = { refetchInterval: aoVivo ? 15_000 : false };
  const eventos = useQuery({ queryKey: ['eventos', id], queryFn: () => listEventosJogo(id), enabled: id != null, ...vivo });
  const escalacao = useQuery({ queryKey: ['escalacao', id], queryFn: () => listEscalacao(id), enabled: id != null, ...vivo });

  const jogo = jogoQuery.data;
  usePageTitle(jogo ? `${jogo.mandante.nome} × ${jogo.visitante.nome}` : 'Jogo', jogo && `Placar, lances e escalações de ${jogo.mandante.nome} × ${jogo.visitante.nome}.`);

  const dados = useMemo(() => {
    if (!jogo) return null;
    const evs = [...(eventos.data ?? [])].sort((a, b) => (a.periodo ?? 1) - (b.periodo ?? 1) || (a.minuto ?? 0) - (b.minuto ?? 0) || a.id - b.id);
    const conta = (timeId, tipo) => evs.filter((e) => e.time_id === timeId && e.tipo === tipo).length;
    const m = jogo.mandante.id;
    const v = jogo.visitante.id;
    return { evs, stats: [['Faltas', conta(m, 'falta'), conta(v, 'falta')], ['Cartões amarelos', conta(m, 'amarelo'), conta(v, 'amarelo')], ['Cartões vermelhos', conta(m, 'vermelho'), conta(v, 'vermelho')]] };
  }, [jogo, eventos.data]);

  return (
    <div className="pt-20">
      <Container className="max-w-3xl !pt-4">
        <QueryState query={jogoQuery} emptyText="Jogo não encontrado.">
          {() => {
            const placar = jogo.gols_mandante != null && jogo.gols_visitante != null;
            const lado = (ev) => (ev.time_id === jogo.mandante.id ? 'mandante' : 'visitante');
            const elenco = (timeId) => (escalacao.data ?? []).filter((e) => e.time_id === timeId);
            const visiveis = dados.evs.filter(PASSA[filtro]);
            const periodos = [...new Set(visiveis.map((e) => e.periodo ?? 1))];
            const equipe = [jogo.arbitro_principal && `Árbitro: ${jogo.arbitro_principal}`, jogo.arbitro_auxiliar && `Auxiliar: ${jogo.arbitro_auxiliar}`, jogo.anotador && `Anotador: ${jogo.anotador}`].filter(Boolean);
            return (
              <>
                <BackLink to={`/jogos?c=${jogo.competicao_id}`}>Todos os jogos</BackLink>
                <section aria-label="Placar" className="rounded-3xl border border-ablf-line bg-gradient-to-b from-ablf-raised to-ablf-surface p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 truncate">
                      {[jogo.competicao?.nome, jogo.fase || (jogo.grupo && `Grupo ${jogo.grupo}`), jogo.rodada && `Rodada ${jogo.rodada}`].filter(Boolean).join(' · ')}
                    </span>
                    <JogoStatus jogo={jogo} />
                  </div>

                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
                    {[jogo.mandante, jogo.visitante].map((t, i) => (
                      <Link key={t.id} to={entityPath('times', t.id, t.nome)} style={{ gridColumn: i === 0 ? 1 : 3, gridRow: 1 }}
                        className="flex flex-col items-center gap-2 text-center min-w-0 group">
                        <Crest src={t.escudo_url} nome={t.nome} size={72} />
                        <span className="font-display text-xl sm:text-2xl font-bold uppercase leading-tight text-white group-hover:text-ablf-yellow line-clamp-3 break-words">{t.nome}</span>
                      </Link>
                    ))}
                    <div style={{ gridColumn: 2, gridRow: 1 }} className="pt-4 text-center">
                      <div aria-label={placar ? `Placar ${jogo.gols_mandante} a ${jogo.gols_visitante}` : 'Jogo ainda não começou'}
                        className="font-display font-black text-5xl sm:text-6xl text-ablf-yellow tabular-nums whitespace-nowrap">
                        {placar ? `${jogo.gols_mandante}–${jogo.gols_visitante}` : 'vs'}
                      </div>
                      {aoVivo && jogo.periodo_atual && <div className="mt-1 text-xs font-bold uppercase tracking-wider text-ablf-live">{PERIODOS[jogo.periodo_atual]}</div>}
                    </div>
                  </div>

                  <dl className="mt-5 pt-4 border-t border-ablf-line grid gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" /><dt className="sr-only">Data</dt><dd>{formatDataJogo(jogo.data_hora)}</dd></div>
                    {jogo.local && <div className="flex items-center gap-2"><MapPin size={16} aria-hidden="true" /><dt className="sr-only">Local</dt><dd>{jogo.local}</dd></div>}
                    {equipe.length > 0 && <div className="flex items-start gap-2"><UserCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><dt className="sr-only">Arbitragem</dt><dd>{equipe.join(' · ')}</dd></div>}
                  </dl>
                  {aoVivo && <p className="mt-3 text-xs text-gray-500">Atualiza automaticamente a cada 15 segundos.</p>}
                </section>

                <div className="mt-3 flex flex-wrap gap-2">
                  <ShareButton title={`${jogo.mandante.nome} × ${jogo.visitante.nome}`} text={placar ? `${jogo.mandante.nome} ${jogo.gols_mandante} × ${jogo.gols_visitante} ${jogo.visitante.nome}` : undefined} />
                  {jogo.status === 'encerrado' && (
                    <Button as={Link} to={`/jogos/${jogo.id}/sumula`} variant="secondary" size="sm"><FileText size={16} />Súmula oficial</Button>
                  )}
                  {jogo.sumula_fechada && <Badge tone="success" className="self-center">Súmula fechada</Badge>}
                </div>
                {jogo.observacoes && <p className="mt-4 text-sm text-gray-400">{jogo.observacoes}</p>}

                <Tabs tabs={TABS} value={aba} onChange={setAba} label="Detalhes do jogo" className="mt-6" />
                <div {...painelProps(TABS, aba)} className="mt-5">
                  {aba === 'lances' && (
                    dados.evs.length === 0 ? (
                      <p className="py-10 text-center text-gray-500">Nenhum lance registrado ainda.</p>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6">
                          {dados.stats.map(([r, a, b]) => <Comparativo key={r} rotulo={r} a={a} b={b} />)}
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider pt-1">
                            <span className="text-ablf-green truncate">{jogo.mandante.nome}</span><span className="text-ablf-yellow truncate text-right">{jogo.visitante.nome}</span>
                          </div>
                        </div>
                        <Chips items={FILTROS} value={filtro} onChange={setFiltro} label="Filtrar lances" />
                        {visiveis.length === 0 ? <p className="py-8 text-center text-gray-500">Nenhum lance neste filtro.</p> : periodos.map((p) => (
                          <section key={p} aria-label={PERIODOS[p]} className="mt-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{PERIODOS[p]}</h3>
                            <ul>{visiveis.filter((e) => (e.periodo ?? 1) === p).map((ev) => <Evento key={ev.id} ev={ev} lado={lado(ev)} />)}</ul>
                          </section>
                        ))}
                      </>
                    )
                  )}
                  {aba === 'escalacoes' && (
                    escalacao.data?.length ? (
                      <div className="grid sm:grid-cols-2 gap-8">
                        <Elenco time={jogo.mandante} itens={elenco(jogo.mandante.id)} />
                        <Elenco time={jogo.visitante} itens={elenco(jogo.visitante.id)} />
                      </div>
                    ) : <p className="py-10 text-center text-gray-500">Escalações ainda não informadas.</p>
                  )}
                  {aba === 'fotos' && <Galeria jogoId={jogo.id} titulo="" mensagemVazio="Ainda não há fotos deste jogo." />}
                </div>
              </>
            );
          }}
        </QueryState>
      </Container>
    </div>
  );
}
