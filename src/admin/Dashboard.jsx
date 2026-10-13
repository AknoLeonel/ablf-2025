import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, ClipboardList, FilePlus, Inbox, Newspaper, UserPlus } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { Badge, Button, Skeleton } from '../components/ui';
import { Crest } from '../components/common/ui';
import { PERIODOS, formatDataJogo } from '../lib/format';
import { useAuth } from './authContext';

const SELECT = 'id, status, data_hora, rodada, gols_mandante, gols_visitante, periodo_atual, sumula_fechada, mandante:times!mandante_id(nome, escudo_url), visitante:times!visitante_id(nome, escudo_url), competicao:competicoes(nome)';

async function carregar(isAdmin) {
  const sb = await getSupabase();
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
  const semana = new Date(hoje); semana.setDate(hoje.getDate() + 8);
  const ok = (r) => { if (r.error) throw r.error; return r; };
  const [agora, proximos, semFechar, filiacoes, semData] = await Promise.all([
    sb.from('jogos').select(SELECT).or(`status.eq.ao_vivo,and(data_hora.gte.${hoje.toISOString()},data_hora.lt.${amanha.toISOString()})`).order('data_hora').order('id').then(ok),
    sb.from('jogos').select(SELECT).in('status', ['agendado', 'adiado']).gte('data_hora', amanha.toISOString()).lt('data_hora', semana.toISOString()).order('data_hora').limit(8).then(ok),
    sb.from('jogos').select('id', { count: 'exact', head: true }).eq('status', 'encerrado').eq('sumula_fechada', false).then(ok),
    isAdmin ? sb.from('solicitacoes_filiacao').select('id', { count: 'exact', head: true }).eq('status', 'nova').then(ok) : Promise.resolve({ count: 0 }),
    isAdmin ? sb.from('jogos').select('id', { count: 'exact', head: true }).eq('status', 'agendado').is('data_hora', null).then(ok) : Promise.resolve({ count: 0 }),
  ]);
  return { agora: agora.data, proximos: proximos.data, semFechar: semFechar.count ?? 0, filiacoes: filiacoes.count ?? 0, semData: semData.count ?? 0 };
}

function JogoLinha({ j }) {
  const vivo = j.status === 'ao_vivo';
  return (
    <li>
      <Link to={`/admin/jogos/${j.id}`} className={`block p-4 rounded-2xl border bg-ablf-surface hover:border-ablf-green/60 active:bg-ablf-raised transition-colors ${vivo ? 'border-ablf-live/60' : 'border-ablf-line'}`}>
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <span className="truncate">{j.competicao?.nome}{j.rodada ? ` · Rodada ${j.rodada}` : ''}</span>
          {vivo ? <Badge tone="live">Ao vivo{j.periodo_atual ? ` · ${PERIODOS[j.periodo_atual]}` : ''}</Badge>
            : j.status === 'encerrado' ? <Badge tone={j.sumula_fechada ? 'success' : 'warn'}>{j.sumula_fechada ? 'Fechada' : 'Falta fechar'}</Badge>
            : <span>{formatDataJogo(j.data_hora)}</span>}
        </div>
        <div className="mt-3 space-y-2">
          {[[j.mandante, j.gols_mandante], [j.visitante, j.gols_visitante]].map(([t, g], i) => (
            <div key={i} className="flex items-center gap-3">
              <Crest src={t.escudo_url} nome={t.nome} size={28} />
              <span className="flex-1 min-w-0 font-display text-lg font-bold uppercase text-white line-clamp-1">{t.nome}</span>
              <span className="font-display text-2xl font-black tabular-nums text-white">{g ?? '–'}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ablf-green"><ClipboardList size={16} />Abrir mesa de súmula</div>
      </Link>
    </li>
  );
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const q = useQuery({ queryKey: ['admin-dashboard', isAdmin], queryFn: () => carregar(isAdmin), refetchInterval: 30_000 });
  const d = q.data;
  const atalhos = [
    ['/admin/jogos?novo=1', 'Novo jogo', CalendarPlus],
    ['/admin/jogadores?novo=1', 'Novo jogador', UserPlus],
    ['/admin/noticias?novo=1', 'Nova notícia', Newspaper],
    ['/admin/documentos?novo=1', 'Enviar documento', FilePlus],
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="font-display text-4xl font-black italic uppercase text-white leading-none">Hoje</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.email} · {isAdmin ? 'Administrador' : 'Mesário'}</p>
      </header>

      {q.isPending && <div className="space-y-3" role="status"><span className="sr-only">Carregando</span><Skeleton className="h-32" /><Skeleton className="h-32" /></div>}
      {q.isError && <p role="alert" className="text-red-300">{q.error.message}</p>}

      {d && (
        <>
          {(d.semFechar > 0 || d.filiacoes > 0 || d.semData > 0) && (
            <section aria-label="Pendências" className="grid gap-2 sm:grid-cols-3">
              {d.semFechar > 0 && <Link to="/admin/jogos" className="p-4 rounded-2xl border border-yellow-800/60 bg-yellow-950/20 text-yellow-100"><span className="font-display text-3xl font-black">{d.semFechar}</span> <span className="text-sm">jogo{d.semFechar > 1 ? 's' : ''} encerrado{d.semFechar > 1 ? 's' : ''} com súmula aberta</span></Link>}
              {d.filiacoes > 0 && <Link to="/admin/filiacoes" className="p-4 rounded-2xl border border-sky-800/60 bg-sky-950/20 text-sky-100"><Inbox className="inline -mt-1 mr-1" size={18} /><span className="font-display text-3xl font-black">{d.filiacoes}</span> <span className="text-sm">pedido{d.filiacoes > 1 ? 's' : ''} de filiação novo{d.filiacoes > 1 ? 's' : ''}</span></Link>}
              {d.semData > 0 && <Link to="/admin/jogos" className="p-4 rounded-2xl border border-ablf-line bg-ablf-surface text-gray-200"><span className="font-display text-3xl font-black">{d.semData}</span> <span className="text-sm">jogo{d.semData > 1 ? 's' : ''} sem data definida</span></Link>}
            </section>
          )}

          <section aria-labelledby="h-hoje">
            <h2 id="h-hoje" className="font-display text-2xl font-bold uppercase text-ablf-green mb-3">Ao vivo e jogos de hoje</h2>
            {d.agora.length === 0 ? <p className="py-8 text-center text-gray-500 rounded-2xl border border-dashed border-ablf-line">Nenhum jogo hoje.</p> : <ul className="grid gap-3 md:grid-cols-2">{d.agora.map((j) => <JogoLinha key={j.id} j={j} />)}</ul>}
          </section>

          {d.proximos.length > 0 && (
            <section aria-labelledby="h-prox">
              <h2 id="h-prox" className="font-display text-2xl font-bold uppercase text-ablf-green mb-3">Próximos 7 dias</h2>
              <ul className="grid gap-3 md:grid-cols-2">{d.proximos.map((j) => <JogoLinha key={j.id} j={j} />)}</ul>
            </section>
          )}
        </>
      )}

      {isAdmin && (
        <section aria-labelledby="h-atalhos">
          <h2 id="h-atalhos" className="font-display text-2xl font-bold uppercase text-ablf-green mb-3">Atalhos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {atalhos.map(([to, rotulo, Icone]) => (
              <Button key={to} as={Link} to={to} variant="secondary" className="flex-col min-h-20 !gap-1 text-center"><Icone size={22} aria-hidden="true" />{rotulo}</Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
