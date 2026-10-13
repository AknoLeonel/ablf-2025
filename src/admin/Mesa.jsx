import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, FileText, Lock, Pause, Play, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { PERIODOS, STATUS_JOGO, formatDataJogo, nomeJogador, parseEntityId } from '../lib/format';
import { Badge, Button, Sheet, Skeleton, Tabs } from '../components/ui';
import { painelProps } from '../components/ui/tabsProps';
import { Crest } from '../components/common/ui';
import { useAuth } from './authContext';
import { useToast } from './toastContext';
import { useCronometro } from './useCronometro';
import { mensagemErro } from './erros';

const LANCES = [
  { tipo: 'gol', rotulo: 'Gol', classe: 'bg-green-700 text-white hover:bg-green-800' },
  { tipo: 'assistencia', rotulo: 'Assistência', classe: 'bg-sky-600 text-white hover:bg-sky-500' },
  { tipo: 'amarelo', rotulo: 'Amarelo', classe: 'bg-yellow-400 text-black hover:bg-yellow-300' },
  { tipo: 'vermelho', rotulo: 'Vermelho', classe: 'bg-red-600 text-white hover:bg-red-500' },
  { tipo: 'falta', rotulo: 'Falta', classe: 'bg-ablf-raised text-white border border-ablf-line hover:bg-ablf-line' },
  { tipo: 'gol_contra', rotulo: 'Gol contra', classe: 'bg-ablf-raised text-red-300 border border-red-900 hover:bg-ablf-line' },
];
const ROTULO_LANCE = Object.fromEntries(LANCES.map((l) => [l.tipo, l.rotulo]));

async function carregar(id) {
  const sb = await getSupabase();
  const unico = async (q) => { const { data, error } = await q; if (error) throw error; return data; };
  const jogo = await unico(sb.from('jogos')
    .select('*, mandante:times!mandante_id(id, nome, escudo_url), visitante:times!visitante_id(id, nome, escudo_url), competicao:competicoes(nome)')
    .eq('id', id).maybeSingle());
  if (!jogo) return null;
  const [eventos, escalacao] = await Promise.all([
    unico(sb.from('eventos_jogo').select('id, tipo, minuto, periodo, motivo, time_id, jogador_id, jogador:jogadores(id, nome, apelido, numero)').eq('jogo_id', id).order('id')),
    unico(sb.from('escalacoes').select('jogador_id, time_id, titular').eq('jogo_id', id)),
  ]);
  // elenco atual dos dois times + quem já aparece na súmula (mesmo que tenha trocado de time depois)
  const naSumula = [...new Set([...eventos, ...escalacao].map((x) => x.jogador_id))];
  const filtro = [`time_id.in.(${jogo.mandante.id},${jogo.visitante.id})`, naSumula.length && `id.in.(${naSumula.join(',')})`].filter(Boolean).join(',');
  const jogadores = await unico(sb.from('jogadores').select('id, nome, apelido, numero, time_id, ativo').or(filtro).order('numero', { nullsFirst: false }).order('nome'));
  const timeNoJogo = new Map([...escalacao, ...eventos].map((x) => [x.jogador_id, x.time_id]));
  return {
    jogo, eventos, escalacao,
    jogadores: jogadores.filter((j) => j.ativo || naSumula.includes(j.id)).map((j) => ({ ...j, time_no_jogo: timeNoJogo.get(j.id) ?? j.time_id })),
  };
}

const golsDe = (eventos, timeId, outroId) =>
  eventos.filter((e) => (e.tipo === 'gol' && e.time_id === timeId) || (e.tipo === 'gol_contra' && e.time_id === outroId)).length;

export default function Mesa() {
  const id = parseEntityId(useParams().id);
  const qc = useQueryClient();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const relogio = useCronometro(id);
  const [lado, setLado] = useState('mandante');
  const [jogadorAberto, setJogadorAberto] = useState(null);
  const [confirmar, setConfirmar] = useState(null); // 'encerrar' | 'fechar'
  const [minuto, setMinuto] = useState('');
  const [periodoLance, setPeriodoLance] = useState('');
  const [motivo, setMotivo] = useState('');

  const q = useQuery({ queryKey: ['admin-mesa', id], queryFn: () => carregar(id), enabled: id != null, refetchInterval: 30_000 });
  const dados = q.data;
  const jogo = dados?.jogo;
  const bloqueada = Boolean(jogo?.sumula_fechada) && !isAdmin;

  const atualizar = () => qc.invalidateQueries();
  const falha = (e) => toast.show(mensagemErro(e), { tom: 'erro' });

  const patchJogo = useMutation({
    mutationFn: async (patch) => {
      const sb = await getSupabase();
      const { error } = await sb.from('jogos').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: falha,
  });

  // O placar acompanha os gols lançados (gol e gol contra).
  const sincronizarPlacar = async () => {
    const sb = await getSupabase();
    const { data, error } = await sb.from('eventos_jogo').select('tipo, time_id').eq('jogo_id', id);
    if (error) throw error;
    const gm = golsDe(data, jogo.mandante.id, jogo.visitante.id);
    const gv = golsDe(data, jogo.visitante.id, jogo.mandante.id);
    if (gm !== jogo.gols_mandante || gv !== jogo.gols_visitante) {
      const { error: e2 } = await sb.from('jogos').update({ gols_mandante: gm, gols_visitante: gv }).eq('id', id);
      if (e2) throw e2;
    }
  };

  const addEvento = useMutation({
    mutationFn: async (ev) => {
      const sb = await getSupabase();
      const { data, error } = await sb.from('eventos_jogo').insert(ev).select('id').single();
      if (error) throw error;
      await sincronizarPlacar();
      return data.id;
    },
    onSuccess: atualizar,
    onError: falha,
  });

  const delEvento = useMutation({
    mutationFn: async (ev) => {
      const sb = await getSupabase();
      const { error } = await sb.from('eventos_jogo').delete().eq('id', ev.id);
      if (error) throw error;
      await sincronizarPlacar();
    },
    onSuccess: atualizar,
    onError: falha,
  });

  const setEscalacao = useMutation({
    mutationFn: async ({ jogador, estado }) => {
      const sb = await getSupabase();
      const { error } = estado === 'fora'
        ? await sb.from('escalacoes').delete().match({ jogo_id: id, jogador_id: jogador.id })
        : await sb.from('escalacoes').upsert({ jogo_id: id, jogador_id: jogador.id, time_id: jogador.time_no_jogo, titular: estado === 'titular' }, { onConflict: 'jogo_id,jogador_id' });
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: falha,
  });

  const registrar = (tipo) => {
    const j = jogadorAberto;
    const ev = {
      jogo_id: id, jogador_id: j.id, time_id: j.time_no_jogo, tipo,
      minuto: minuto === '' ? null : Number(minuto),
      periodo: Number(periodoLance || jogo.periodo_atual || 1),
      motivo: (tipo === 'amarelo' || tipo === 'vermelho' || tipo === 'falta') && motivo.trim() ? motivo.trim() : null,
    };
    setJogadorAberto(null);
    addEvento.mutate(ev, {
      onSuccess: (novoId) => toast.show(`${ROTULO_LANCE[tipo]}: ${nomeJogador(j)}`, { acao: 'Desfazer', onAcao: () => delEvento.mutate({ id: novoId }) }),
    });
  };

  const apagarEvento = (ev) => {
    const { id: _id, jogador: _jogador, ...copia } = ev;
    delEvento.mutate(ev, {
      onSuccess: () => toast.show(`${ROTULO_LANCE[ev.tipo]} removido`, { acao: 'Desfazer', onAcao: () => addEvento.mutate({ ...copia, jogo_id: id }) }),
    });
  };

  const abrirJogador = (j) => {
    setMinuto(jogo.status === 'ao_vivo' && relogio.ms > 0 ? String(relogio.minuto) : '');
    setPeriodoLance(String(jogo.periodo_atual || 1));
    setMotivo('');
    setJogadorAberto(j);
  };

  const equipes = useMemo(() => {
    if (!dados) return [];
    return ['mandante', 'visitante'].map((k) => {
      const time = dados.jogo[k];
      const elenco = dados.jogadores.filter((j) => j.time_no_jogo === time.id);
      const escalados = elenco.filter((j) => dados.escalacao.some((e) => e.jogador_id === j.id));
      return { chave: k, time, elenco, escalados, noJogo: escalados.length ? escalados : elenco };
    });
  }, [dados]);

  if (q.isPending) return <div className="space-y-3" role="status"><span className="sr-only">Carregando</span><Skeleton className="h-40" /><Skeleton className="h-24" /></div>;
  if (q.isError) return <p role="alert" className="text-red-300">{q.error.message}</p>;
  if (!dados) return <p className="text-gray-400">Jogo não encontrado.</p>;

  const { eventos, escalacao } = dados;
  const estado = jogo.sumula_fechada ? 'fechada' : jogo.status;
  const placarOk = jogo.gols_mandante != null;
  const calc = [golsDe(eventos, jogo.mandante.id, jogo.visitante.id), golsDe(eventos, jogo.visitante.id, jogo.mandante.id)];
  const divergente = placarOk && (calc[0] !== jogo.gols_mandante || calc[1] !== jogo.gols_visitante);
  const podeLancar = !bloqueada && (jogo.status === 'ao_vivo' || jogo.status === 'encerrado');
  const TABS = equipes.map((e) => ({ id: e.chave, label: e.time.nome }));
  const contagem = (jogadorId, tipo) => eventos.filter((e) => e.jogador_id === jogadorId && e.tipo === tipo).length;
  const stateEsc = (jogadorId) => { const e = escalacao.find((x) => x.jogador_id === jogadorId); return !e ? 'fora' : e.titular ? 'titular' : 'reserva'; };

  const iniciar = () => {
    patchJogo.mutate({ status: 'ao_vivo', periodo_atual: 1, gols_mandante: jogo.gols_mandante ?? 0, gols_visitante: jogo.gols_visitante ?? 0 });
    relogio.reiniciar();
  };
  const mudarPeriodo = (p) => { patchJogo.mutate({ periodo_atual: p }); relogio.zerar(); };

  return (
    <div className="space-y-5 max-w-4xl">
      <h1 className="sr-only">Mesa de súmula: {jogo.mandante.nome} × {jogo.visitante.nome}</h1>
      <div>
        <Link to="/admin/jogos" className="inline-flex items-center gap-1 min-h-10 text-sm text-gray-400 hover:text-ablf-yellow"><ArrowLeft size={16} />Jogos</Link>
        <p className="text-xs uppercase tracking-wider text-gray-400">{jogo.competicao?.nome}{jogo.rodada ? ` · Rodada ${jogo.rodada}` : ''} · {formatDataJogo(jogo.data_hora)}</p>
      </div>

      {/* Placar */}
      <section aria-label="Placar" className="rounded-3xl border border-ablf-line bg-gradient-to-b from-ablf-raised to-ablf-surface p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          {jogo.status === 'ao_vivo' ? <Badge tone="live">Ao vivo{jogo.periodo_atual ? ` · ${PERIODOS[jogo.periodo_atual]}` : ''}</Badge> : <Badge tone={estado === 'fechada' ? 'success' : 'neutral'}>{estado === 'fechada' ? 'Súmula fechada' : STATUS_JOGO[jogo.status]}</Badge>}
          {jogo.sumula_fechada && <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Lock size={14} />{jogo.fechada_em ? new Date(jogo.fechada_em).toLocaleString('pt-BR') : ''}</span>}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {[jogo.mandante, jogo.visitante].map((t, i) => (
            <div key={t.id} style={{ gridColumn: i === 0 ? 1 : 3, gridRow: 1 }} className="flex flex-col items-center gap-2 text-center min-w-0">
              <Crest src={t.escudo_url} nome={t.nome} size={56} />
              <span className="font-display text-lg sm:text-2xl font-bold uppercase leading-tight text-white line-clamp-2 break-words">{t.nome}</span>
            </div>
          ))}
          <div style={{ gridColumn: 2, gridRow: 1 }} className="font-display font-black text-5xl sm:text-6xl text-ablf-yellow tabular-nums whitespace-nowrap" aria-label={placarOk ? `Placar ${jogo.gols_mandante} a ${jogo.gols_visitante}` : 'Sem placar'}>
            {placarOk ? `${jogo.gols_mandante}–${jogo.gols_visitante}` : 'vs'}
          </div>
        </div>

        {/* Cronômetro */}
        {jogo.status === 'ao_vivo' && !bloqueada && (
          <div className="mt-5 pt-4 border-t border-ablf-line flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-4xl font-bold text-white tabular-nums" aria-label={`Tempo de jogo ${relogio.texto}`}>{relogio.texto}</div>
            <div className="flex gap-2">
              {relogio.rodando
                ? <Button variant="secondary" onClick={relogio.pausar}><Pause size={18} />Pausar</Button>
                : <Button variant="success" onClick={relogio.iniciar}><Play size={18} />{relogio.ms ? 'Continuar' : 'Iniciar'}</Button>}
              <Button variant="ghost" onClick={relogio.zerar} aria-label="Zerar cronômetro"><RotateCcw size={18} /></Button>
            </div>
            <div className="w-full flex gap-2" role="group" aria-label="Período">
              {[1, 2, 3].map((p) => (
                <button key={p} type="button" aria-pressed={jogo.periodo_atual === p} onClick={() => mudarPeriodo(p)}
                  className={`flex-1 min-h-11 rounded-lg text-sm font-bold border transition-colors ${jogo.periodo_atual === p ? 'bg-ablf-yellow text-ablf-blue border-ablf-yellow' : 'border-ablf-line text-gray-300 hover:border-gray-500'}`}>
                  {p === 3 ? 'Prorrog.' : `${p}º tempo`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fluxo da partida */}
        <div className="mt-5 flex flex-wrap gap-2">
          {(estado === 'agendado' || estado === 'adiado' || estado === 'cancelado') && !bloqueada && (
            <Button variant="success" size="lg" className="flex-1" disabled={patchJogo.isPending} onClick={iniciar}><Play size={20} />Iniciar jogo</Button>
          )}
          {estado === 'ao_vivo' && <Button variant="primary" size="lg" className="flex-1" onClick={() => setConfirmar('encerrar')}>Encerrar jogo</Button>}
          {estado === 'encerrado' && (
            <>
              <Button variant="success" size="lg" className="flex-1" onClick={() => setConfirmar('fechar')}><Lock size={18} />Fechar súmula</Button>
              <Button variant="secondary" size="lg" onClick={() => patchJogo.mutate({ status: 'ao_vivo' })}>Reabrir jogo</Button>
            </>
          )}
          {estado === 'fechada' && isAdmin && <Button variant="secondary" size="lg" onClick={() => patchJogo.mutate({ sumula_fechada: false })}>Reabrir súmula (admin)</Button>}
        </div>
        {estado === 'fechada' && !isAdmin && <p className="mt-3 text-sm text-gray-400">Súmula fechada: só um administrador pode alterá-la.</p>}
        {estado === 'fechada' && isAdmin && <p className="mt-3 text-sm text-yellow-300">Você é administrador: alterações em súmula fechada ficam registradas no Histórico.</p>}
        {divergente && <p className="mt-3 text-sm text-yellow-300">Atenção: o placar ({jogo.gols_mandante}–{jogo.gols_visitante}) difere dos gols lançados ({calc[0]}–{calc[1]}). Lançar um gol sincroniza o placar.</p>}
      </section>

      {/* Jogadores / lances */}
      <section aria-label="Lances">
        <h2 className="font-display text-2xl font-bold uppercase text-white mb-2">Toque no jogador para lançar</h2>
        {!podeLancar && !bloqueada && <p className="mb-3 text-sm text-yellow-300">Inicie o jogo para lançar gols, cartões e faltas.</p>}
        <Tabs tabs={TABS} value={lado} onChange={setLado} label="Time" className="md:hidden mb-3" />
        <div className="grid md:grid-cols-2 gap-6">
          {equipes.map((e) => (
            <div key={e.chave} {...(e.chave === lado ? painelProps(TABS, lado) : {})} className={e.chave === lado ? 'block' : 'hidden md:block'}>
              <h3 className="hidden md:flex items-center gap-2 font-display text-xl font-bold uppercase text-ablf-green mb-2"><Crest src={e.time.escudo_url} nome={e.time.nome} size={24} />{e.time.nome}</h3>
              {e.noJogo.length === 0 ? <p className="text-gray-400 text-sm py-4">Time sem jogadores. Cadastre em Jogadores.</p> : (
                <ul className="grid grid-cols-2 gap-2">
                  {e.noJogo.map((j) => (
                    <li key={j.id}>
                      <button type="button" disabled={!podeLancar} onClick={() => abrirJogador(j)}
                        className="w-full min-h-16 flex items-center gap-3 p-3 rounded-xl border border-ablf-line bg-ablf-surface text-left hover:border-ablf-green/60 active:bg-ablf-raised disabled:opacity-50">
                        <span className="font-display font-black text-3xl text-ablf-yellow w-9 text-center shrink-0">{j.numero ?? '–'}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-white font-medium leading-tight line-clamp-2">{nomeJogador(j)}</span>
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {contagem(j.id, 'gol') > 0 && <span className="mr-2">⚽{contagem(j.id, 'gol')}</span>}
                            {contagem(j.id, 'amarelo') > 0 && <span className="mr-2">🟨{contagem(j.id, 'amarelo')}</span>}
                            {contagem(j.id, 'vermelho') > 0 && <span className="mr-2">🟥</span>}
                            {contagem(j.id, 'falta') > 0 && <span>F{contagem(j.id, 'falta')}</span>}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Linha do tempo */}
      <section aria-label="Lances registrados">
        <h2 className="font-display text-2xl font-bold uppercase text-white mb-2">Lances registrados ({eventos.length})</h2>
        {eventos.length === 0 ? <p className="text-gray-400 text-sm">Nenhum lance ainda.</p> : (
          <ul className="rounded-2xl border border-ablf-line divide-y divide-ablf-line overflow-hidden">
            {[...eventos].sort((a, b) => b.id - a.id).map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 px-4 min-h-14 bg-ablf-surface">
                <span className="w-12 font-mono text-sm text-gray-400">{ev.minuto != null ? `${ev.minuto}'` : '–'}<span className="block text-[0.6rem] text-gray-400">{PERIODOS[ev.periodo ?? 1].slice(0, 2)}</span></span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-bold text-white">{ROTULO_LANCE[ev.tipo]}</span> · {nomeJogador(ev.jogador)}
                  <span className="block text-xs text-gray-400">{ev.time_id === jogo.mandante.id ? jogo.mandante.nome : jogo.visitante.nome}{ev.motivo ? ` · ${ev.motivo}` : ''}</span>
                </span>
                {!bloqueada && <button type="button" onClick={() => apagarEvento(ev)} aria-label={`Remover ${ROTULO_LANCE[ev.tipo]} de ${nomeJogador(ev.jogador)}`} className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"><Trash2 size={18} /></button>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Escalação */}
      <details className="rounded-2xl border border-ablf-line bg-ablf-surface">
        <summary className="px-4 min-h-14 flex items-center cursor-pointer font-display text-xl font-bold uppercase text-white">Escalação ({escalacao.length} atletas)</summary>
        <div className="px-4 pb-4 grid md:grid-cols-2 gap-6">
          {equipes.map((e) => (
            <div key={e.chave}>
              <h3 className="font-display text-lg font-bold uppercase text-ablf-green mb-2">{e.time.nome}</h3>
              <ul className="space-y-2">
                {e.elenco.map((j) => (
                  <li key={j.id} className="flex items-center gap-2">
                    <span className="w-7 text-right font-mono text-gray-400">{j.numero ?? ''}</span>
                    <span className="flex-1 min-w-0 text-sm text-white truncate">{nomeJogador(j)}</span>
                    <span role="group" aria-label={`Escalação de ${nomeJogador(j)}`} className="inline-flex rounded-lg overflow-hidden border border-ablf-line">
                      {[['fora', 'Fora'], ['titular', 'Tit.'], ['reserva', 'Res.']].map(([v, l]) => (
                        <button key={v} type="button" aria-pressed={stateEsc(j.id) === v} disabled={bloqueada || setEscalacao.isPending}
                          onClick={() => stateEsc(j.id) !== v && setEscalacao.mutate({ jogador: j, estado: v })}
                          className={`min-h-10 px-3 text-xs font-bold ${stateEsc(j.id) === v ? (v === 'fora' ? 'bg-ablf-line text-white' : 'bg-green-700 text-white') : 'text-gray-400'}`}>{l}</button>
                      ))}
                    </span>
                  </li>
                ))}
                {e.elenco.length === 0 && <li className="text-sm text-gray-400">Sem jogadores cadastrados.</li>}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <DadosPartida key={`${jogo.arbitro_principal}|${jogo.arbitro_auxiliar}|${jogo.anotador}`} jogo={jogo} bloqueada={bloqueada} salvar={(p) => patchJogo.mutate(p, { onSuccess: () => toast.show('Dados da partida salvos') })} salvando={patchJogo.isPending} />

      <div className="flex flex-wrap gap-3 pb-6">
        <Button as={Link} to={`/jogos/${jogo.id}`} variant="secondary" size="sm"><ExternalLink size={16} />Página pública</Button>
        {jogo.status === 'encerrado' && <Button as={Link} to={`/jogos/${jogo.id}/sumula`} variant="secondary" size="sm"><FileText size={16} />Súmula para imprimir</Button>}
      </div>

      {/* Folha: lance do jogador */}
      <Sheet open={Boolean(jogadorAberto)} onClose={() => setJogadorAberto(null)} title={jogadorAberto ? `${jogadorAberto.numero ?? ''} ${nomeJogador(jogadorAberto)}`.trim() : ''}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Minuto
            <input type="number" inputMode="numeric" min="0" max="120" value={minuto} onChange={(e) => setMinuto(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl bg-ablf-surface border border-ablf-line px-4 text-white" />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Período
            <select value={periodoLance} onChange={(e) => setPeriodoLance(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl bg-ablf-surface border border-ablf-line px-3 text-white">
              {Object.entries(PERIODOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Motivo (cartão/falta, opcional)
          <input type="text" value={motivo} maxLength={80} onChange={(e) => setMotivo(e.target.value)} className="mt-1.5 w-full min-h-12 rounded-xl bg-ablf-surface border border-ablf-line px-4 text-white" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          {LANCES.map((l) => (
            <button key={l.tipo} type="button" onClick={() => registrar(l.tipo)} className={`min-h-16 rounded-xl text-lg font-bold transition-colors ${l.classe}`}>{l.rotulo}</button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400 flex items-center gap-1"><Undo2 size={14} />Errou? Use “Desfazer” no aviso que aparece depois.</p>
      </Sheet>

      {/* Folha: confirmações */}
      <Sheet open={Boolean(confirmar)} onClose={() => setConfirmar(null)} title={confirmar === 'encerrar' ? 'Encerrar o jogo?' : 'Fechar a súmula?'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmar(null)}>Voltar</Button>
            <Button variant="success" className="flex-1" onClick={async () => {
              const acao = confirmar;
              setConfirmar(null);
              if (acao === 'encerrar') { relogio.pausar(); patchJogo.mutate({ status: 'encerrado' }, { onSuccess: () => toast.show('Jogo encerrado. Revise e feche a súmula.') }); }
              else patchJogo.mutate({ sumula_fechada: true }, { onSuccess: () => toast.show('Súmula fechada e travada') });
            }}>{confirmar === 'encerrar' ? 'Encerrar' : 'Fechar súmula'}</Button>
          </div>
        }>
        <p className="font-display text-4xl font-black text-ablf-yellow text-center tabular-nums">{jogo.mandante.nome} {jogo.gols_mandante ?? 0}–{jogo.gols_visitante ?? 0} {jogo.visitante.nome}</p>
        <p className="mt-4 text-gray-300">
          {confirmar === 'encerrar'
            ? 'O resultado passa a valer na tabela e nas estatísticas. Você ainda poderá corrigir lances antes de fechar a súmula.'
            : 'Depois de fechada, só um administrador consegue alterar. Confira placar, lances e escalação.'}
        </p>
        {confirmar === 'fechar' && !jogo.arbitro_principal && <p className="mt-3 text-sm text-yellow-300">Dica: informe o árbitro principal em “Dados da partida” antes de fechar.</p>}
      </Sheet>
    </div>
  );
}

function DadosPartida({ jogo, bloqueada, salvar, salvando }) {
  const [v, setV] = useState({ arbitro_principal: jogo.arbitro_principal ?? '', arbitro_auxiliar: jogo.arbitro_auxiliar ?? '', anotador: jogo.anotador ?? '', observacoes: jogo.observacoes ?? '' });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const campo = 'mt-1.5 w-full min-h-12 rounded-xl bg-ablf-card border border-ablf-line px-4 text-white disabled:opacity-60';
  return (
    <details className="rounded-2xl border border-ablf-line bg-ablf-surface">
      <summary className="px-4 min-h-14 flex items-center cursor-pointer font-display text-xl font-bold uppercase text-white">Dados da partida</summary>
      <form className="px-4 pb-4 grid md:grid-cols-3 gap-4" onSubmit={(e) => { e.preventDefault(); salvar(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim() || null]))); }}>
        {[['arbitro_principal', 'Árbitro principal'], ['arbitro_auxiliar', 'Árbitro auxiliar'], ['anotador', 'Anotador']].map(([k, l]) => (
          <label key={k} className="block text-xs font-bold uppercase tracking-wider text-gray-300">{l}<input type="text" disabled={bloqueada} value={v[k]} onChange={set(k)} className={campo} /></label>
        ))}
        <label className="md:col-span-3 block text-xs font-bold uppercase tracking-wider text-gray-300">Observações<textarea rows={3} disabled={bloqueada} value={v.observacoes} onChange={set('observacoes')} className={`${campo} py-3`} /></label>
        <div className="md:col-span-3"><Button type="submit" disabled={bloqueada || salvando}>Salvar dados</Button></div>
      </form>
    </details>
  );
}
