import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { STATUS_JOGO, formatDataJogo, nomeJogador, parseEntityId } from '../lib/format';
import ResourceManager from './ResourceManager';
import { EVENTOS } from './resources';
import { mensagemErro } from './erros';

const input = 'bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ablf-green';

async function carregar(id) {
  const sb = await getSupabase();
  const { data: jogo, error } = await sb
    .from('jogos')
    .select('*, mandante:times!mandante_id(id, nome), visitante:times!visitante_id(id, nome), competicao:competicoes(nome)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!jogo) return null;
  const { data: escalacao, error: e3 } = await sb.from('escalacoes').select('jogador_id, time_id').eq('jogo_id', id);
  if (e3) throw e3;
  const { data: eventos, error: e4 } = await sb.from('eventos_jogo').select('tipo, time_id, jogador_id').eq('jogo_id', id);
  if (e4) throw e4;
  // Elenco atual dos dois times + quem já aparece nesta súmula (mesmo que tenha trocado de time depois).
  const jaNaSumula = [...new Set([...escalacao, ...eventos].map((x) => x.jogador_id))];
  const filtro = [`time_id.in.(${jogo.mandante.id},${jogo.visitante.id})`, jaNaSumula.length && `id.in.(${jaNaSumula.join(',')})`].filter(Boolean).join(',');
  const { data: jogadores, error: e2 } = await sb
    .from('jogadores')
    .select('id, nome, apelido, numero, time_id')
    .or(filtro)
    .order('numero', { nullsFirst: false })
    .order('nome');
  if (e2) throw e2;
  // time do jogador NESTE jogo (o da súmula), não o time atual
  const timeNoJogo = new Map([...escalacao, ...eventos].map((x) => [x.jogador_id, x.time_id]));
  const lista = jogadores.map((j) => ({ ...j, time_no_jogo: timeNoJogo.get(j.id) ?? j.time_id }));
  return { jogo, jogadores: lista, escalados: new Set(escalacao.map((e) => e.jogador_id)), eventos };
}

function Placar({ jogo, eventos }) {
  const qc = useQueryClient();
  const [gm, setGm] = useState(jogo.gols_mandante ?? '');
  const [gv, setGv] = useState(jogo.gols_visitante ?? '');
  const [status, setStatus] = useState(jogo.status);
  const [msg, setMsg] = useState('');

  const calculado = useMemo(() => {
    const conta = (timeId, outro) =>
      eventos.filter((e) => (e.tipo === 'gol' && e.time_id === timeId) || (e.tipo === 'gol_contra' && e.time_id === outro)).length;
    return [conta(jogo.mandante.id, jogo.visitante.id), conta(jogo.visitante.id, jogo.mandante.id)];
  }, [eventos, jogo]);

  const salvar = useMutation({
    mutationFn: async () => {
      const sb = await getSupabase();
      const { error } = await sb.from('jogos').update({
        gols_mandante: gm === '' ? null : Number(gm),
        gols_visitante: gv === '' ? null : Number(gv),
        status,
      }).eq('id', jogo.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries(); setMsg('Placar salvo.'); },
    onError: (e) => setMsg(mensagemErro(e)),
  });

  return (
    <section className="p-5 bg-gray-900/70 border border-gray-700 rounded-xl">
      <h2 className="font-display text-2xl font-bold uppercase text-white mb-4">Placar e status</h2>
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{jogo.mandante.nome}
          <input type="number" min="0" value={gm} onChange={(e) => setGm(e.target.value)} className={`${input} block w-24 mt-1`} />
        </label>
        <span className="pb-2 text-gray-500">×</span>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{jogo.visitante.nome}
          <input type="number" min="0" value={gv} onChange={(e) => setGv(e.target.value)} className={`${input} block w-24 mt-1`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${input} block mt-1`}>
            {Object.entries(STATUS_JOGO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { setGm(calculado[0]); setGv(calculado[1]); }}
          className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white text-sm">
          Usar gols dos lances ({calculado[0]} × {calculado[1]})
        </button>
        <button type="button" onClick={() => salvar.mutate()} disabled={salvar.isPending}
          className="bg-ablf-yellow text-ablf-blue font-bold px-5 py-2 rounded-lg hover:bg-white disabled:opacity-50">
          Salvar placar
        </button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-gray-300">{msg}</p>}
      {eventos.length > 0 && (Number(gm) !== calculado[0] || Number(gv) !== calculado[1]) && gm !== '' && gv !== '' && (
        <p className="mt-3 text-sm text-yellow-300">
          Atenção: o placar ({gm} × {gv}) é diferente dos gols lançados nos lances ({calculado[0]} × {calculado[1]}).
          A tabela usa o placar; a artilharia usa os lances.
        </p>
      )}
      <p className="mt-3 text-xs text-gray-600">Só jogos com status “Encerrado” entram na tabela e nas estatísticas.</p>
    </section>
  );
}

function Escalacao({ jogo, jogadores, escalados }) {
  const qc = useQueryClient();
  const alternar = useMutation({
    mutationFn: async ({ jogador, marcado }) => {
      const sb = await getSupabase();
      const { error } = marcado
        ? await sb.from('escalacoes').insert({ jogo_id: jogo.id, jogador_id: jogador.id, time_id: jogador.time_no_jogo, titular: true })
        : await sb.from('escalacoes').delete().match({ jogo_id: jogo.id, jogador_id: jogador.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <section className="p-5 bg-gray-900/70 border border-gray-700 rounded-xl">
      <h2 className="font-display text-2xl font-bold uppercase text-white mb-1">Quem jogou</h2>
      <p className="text-xs text-gray-500 mb-4">Marque os atletas que entraram em quadra (conta como “jogo” na ficha, mesmo sem gol ou cartão).</p>
      {alternar.isError && <p role="alert" className="text-red-300 text-sm mb-2">{mensagemErro(alternar.error)}</p>}
      <div className="grid md:grid-cols-2 gap-6">
        {[jogo.mandante, jogo.visitante].map((t) => (
          <div key={t.id}>
            <h3 className="font-display text-xl font-bold uppercase text-ablf-green mb-2">{t.nome}</h3>
            {jogadores.filter((j) => j.time_no_jogo === t.id).map((j) => (
              <label key={j.id} className="flex items-center gap-2 py-1 text-sm text-gray-200">
                <input type="checkbox" className="accent-green-500 w-4 h-4" checked={escalados.has(j.id)} disabled={alternar.isPending}
                  onChange={(e) => alternar.mutate({ jogador: j, marcado: e.target.checked })} />
                <span className="w-6 text-right font-mono text-gray-500">{j.numero ?? ''}</span>
                {nomeJogador(j)}
              </label>
            ))}
            {!jogadores.some((j) => j.time_no_jogo === t.id) && <p className="text-sm text-gray-600">Time sem jogadores cadastrados.</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Sumula() {
  const id = parseEntityId(useParams().id);
  const { data, isPending, isError, error } = useQuery({ queryKey: ['admin-sumula', id], queryFn: () => carregar(id), enabled: id != null });

  if (isPending) return <p className="text-gray-500">Carregando…</p>;
  if (isError) return <p role="alert" className="text-red-300">{error.message}</p>;
  if (!data) return <p className="text-gray-400">Jogo não encontrado.</p>;
  const { jogo, jogadores, escalados, eventos } = data;

  // o jogador do lance define o time do lance
  const opcoesJogador = jogadores.map((j) => ({ value: j.id, label: `${nomeJogador(j)} — ${j.time_no_jogo === jogo.mandante.id ? jogo.mandante.nome : jogo.visitante.nome}` }));
  const prepare = (payload) => ({
    ...payload,
    time_id: jogadores.find((j) => j.id === payload.jogador_id)?.time_no_jogo,
    periodo: payload.periodo != null ? Number(payload.periodo) : null,
  });

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/jogos" className="text-sm text-gray-400 hover:text-ablf-yellow">← Jogos</Link>
        <h1 className="font-display text-4xl font-black italic uppercase text-white mt-2">
          {jogo.mandante.nome} × {jogo.visitante.nome}
        </h1>
        <p className="text-gray-500 text-sm">{jogo.competicao?.nome} · {formatDataJogo(jogo.data_hora)}</p>
        <p className="mt-2"><Link to={`/jogos/${jogo.id}`} className="text-sm text-ablf-green hover:text-white">Ver página pública do jogo →</Link></p>
      </div>

      <Placar key={jogo.id} jogo={jogo} eventos={eventos} />
      <Escalacao jogo={jogo} jogadores={jogadores} escalados={escalados} />

      <section>
        <h2 className="font-display text-2xl font-bold uppercase text-white mb-3">Lances (gols, assistências, cartões)</h2>
        <ResourceManager
          resource={EVENTOS}
          filter={{ jogo_id: jogo.id }}
          defaults={{ jogo_id: jogo.id }}
          relationOptions={{ jogador_id: opcoesJogador }}
          prepare={prepare}
        />
      </section>
    </div>
  );
}
