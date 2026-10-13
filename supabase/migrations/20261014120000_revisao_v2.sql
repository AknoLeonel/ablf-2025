-- Correções da revisão de código do produto v2 (rode DEPOIS de 20261014000000_produto_v2.sql).
--   1. Placar calculado NO BANCO a partir dos gols (sem corrida entre aparelhos/mesários).
--   2. Súmula fechada: mover lance/escalação para outro jogo também é bloqueado.
--   3. `fechada_por` removido de `jogos` (era UUID de conta legível por qualquer visitante;
--      quem fechou fica no Histórico/auditoria).
--   4. Documentos: o público baixa pela URL, mas não consegue listar o bucket (rascunhos ficam ocultos).
--   5. Grupos normalizados (A = a = " A ") e derivados dos times inscritos.
--   6. Filiação: limite de pedidos por e-mail e por hora + UF validada.

-- 1. Placar automático --------------------------------------------------------
create or replace function public.sincronizar_placar()
returns trigger
language plpgsql
as $$
declare
  jid bigint := coalesce(new.jogo_id, old.jogo_id);
  j record;
  gm int;
  gv int;
begin
  -- só importa quando o lance mexe em gols
  if not ((tg_op in ('INSERT', 'UPDATE') and new.tipo in ('gol', 'gol_contra'))
       or (tg_op in ('DELETE', 'UPDATE') and old.tipo in ('gol', 'gol_contra'))) then
    return null;
  end if;

  -- trava a linha do jogo: dois lances simultâneos são contados um depois do outro
  select mandante_id, visitante_id into j from public.jogos where id = jid for update;
  if not found then
    return null; -- jogo sendo apagado
  end if;

  select
    count(*) filter (where (tipo = 'gol' and time_id = j.mandante_id) or (tipo = 'gol_contra' and time_id = j.visitante_id)),
    count(*) filter (where (tipo = 'gol' and time_id = j.visitante_id) or (tipo = 'gol_contra' and time_id = j.mandante_id))
  into gm, gv
  from public.eventos_jogo where jogo_id = jid;

  update public.jogos set gols_mandante = gm, gols_visitante = gv
  where id = jid and (gols_mandante, gols_visitante) is distinct from (gm, gv);
  return null;
end;
$$;

create trigger eventos_sincroniza_placar after insert or update or delete on public.eventos_jogo
  for each row execute function public.sincronizar_placar();

-- 2. Súmula fechada: confere o jogo de origem E o de destino ----------------------
create or replace function public.bloquear_sumula_fechada()
returns trigger
language plpgsql
as $$
declare
  origem  bigint := case when tg_op <> 'INSERT' then old.jogo_id end;
  destino bigint := case when tg_op <> 'DELETE' then new.jogo_id end;
begin
  if auth.uid() is not null and not public.is_admin()
     and exists (select 1 from public.jogos where sumula_fechada and id in (origem, destino)) then
    raise exception 'sumula_fechada: a súmula está fechada; só um administrador pode alterar';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- 3. Sem UUID de conta em coluna pública ---------------------------------------------
create or replace function public.jogos_regras_de_edicao()
returns trigger language plpgsql as $$
declare
  permitidas text[] := array[
    'gols_mandante', 'gols_visitante', 'status', 'observacoes', 'periodo_atual',
    'arbitro_principal', 'arbitro_auxiliar', 'anotador', 'sumula_fechada', 'fechada_em', 'grupo'
  ];
begin
  if new.sumula_fechada and not old.sumula_fechada then
    new.fechada_em := now();
  elsif not new.sumula_fechada and old.sumula_fechada then
    new.fechada_em := null;
  end if;

  -- auth.uid() nulo = SQL Editor / service role: sem restrição.
  if auth.uid() is not null and not public.is_admin() then
    if old.sumula_fechada then
      raise exception 'sumula_fechada: a súmula está fechada; só um administrador pode reabrir';
    end if;
    if (to_jsonb(new) - permitidas) is distinct from (to_jsonb(old) - permitidas) then
      raise exception 'permissao: o mesário só pode alterar placar, status e dados da súmula';
    end if;
  end if;
  return new;
end;
$$;
-- A view de classificação passa a listar colunas explícitas (antes `select *` a prendia a todas as colunas de jogos).
create or replace view public.v_classificacao
with (security_invoker = true) as
with encerrados as (
  select competicao_id, mandante_id, visitante_id, gols_mandante, gols_visitante
  from public.jogos where status = 'encerrado' and tipo_fase = 'classificatoria'
),
linhas as (
  select competicao_id, mandante_id as time_id, gols_mandante as gp, gols_visitante as gc from encerrados
  union all
  select competicao_id, visitante_id, gols_visitante, gols_mandante from encerrados
),
participantes as (
  select competicao_id, time_id, grupo from public.competicao_times
  union
  select j.competicao_id, t.time_id, null::text
  from public.jogos j
  cross join lateral (values (j.mandante_id), (j.visitante_id)) as t(time_id)
  where j.tipo_fase = 'classificatoria'
    and not exists (
      select 1 from public.competicao_times ct
      where ct.competicao_id = j.competicao_id and ct.time_id = t.time_id
    )
),
tabela as (
  select
    p.competicao_id, p.time_id, p.grupo,
    count(l.time_id)                         as jogos,
    count(*) filter (where l.gp > l.gc)      as vitorias,
    count(*) filter (where l.gp = l.gc)      as empates,
    count(*) filter (where l.gp < l.gc)      as derrotas,
    coalesce(sum(l.gp), 0)::int              as gols_pro,
    coalesce(sum(l.gc), 0)::int              as gols_contra
  from participantes p
  left join linhas l on l.competicao_id = p.competicao_id and l.time_id = p.time_id
  group by p.competicao_id, p.time_id, p.grupo
)
select
  row_number() over (
    partition by t.competicao_id, t.grupo
    order by (t.vitorias * c.pontos_vitoria + t.empates * c.pontos_empate) desc,
             t.vitorias desc,
             (t.gols_pro - t.gols_contra) desc,
             t.gols_pro desc,
             tm.nome
  )                                                          as posicao,
  t.competicao_id,
  t.time_id,
  tm.nome                                                    as time_nome,
  tm.escudo_url,
  t.jogos::int                                               as jogos,
  t.vitorias::int                                            as vitorias,
  t.empates::int                                             as empates,
  t.derrotas::int                                            as derrotas,
  t.gols_pro,
  t.gols_contra,
  t.gols_pro - t.gols_contra                                 as saldo_gols,
  (t.vitorias * c.pontos_vitoria + t.empates * c.pontos_empate)::int as pontos,
  t.grupo
from tabela t
join public.competicoes c on c.id = t.competicao_id
join public.times tm      on tm.id = t.time_id;

alter table public.jogos drop column fechada_por;

-- 4. Documentos: sem listagem pública do bucket ---------------------------------------
drop policy if exists "documentos: leitura pública" on storage.objects;

-- 5. Grupos ------------------------------------------------------------------------------
create or replace function public.normalizar_grupo()
returns trigger language plpgsql as $$
begin
  new.grupo := nullif(upper(btrim(new.grupo)), '');
  return new;
end;
$$;
create trigger competicao_times_normaliza_grupo before insert or update on public.competicao_times
  for each row execute function public.normalizar_grupo();
update public.competicao_times set grupo = nullif(upper(btrim(grupo)), '') where grupo is not null;

-- O grupo do jogo vem dos times inscritos: os dois no mesmo grupo e fase classificatória.
create or replace function public.derivar_grupo_do_jogo()
returns trigger language plpgsql as $$
declare
  gm text;
  gv text;
begin
  select grupo into gm from public.competicao_times where competicao_id = new.competicao_id and time_id = new.mandante_id;
  select grupo into gv from public.competicao_times where competicao_id = new.competicao_id and time_id = new.visitante_id;
  new.grupo := case when new.tipo_fase = 'classificatoria' and gm is not null and gm = gv then gm end;
  return new;
end;
$$;
create trigger jogos_deriva_grupo before insert or update of competicao_id, mandante_id, visitante_id, tipo_fase on public.jogos
  for each row execute function public.derivar_grupo_do_jogo();

-- Mudou o grupo de um time? Recalcula o grupo dos jogos dele.
create or replace function public.recalcular_grupo_dos_jogos()
returns trigger language plpgsql as $$
begin
  update public.jogos set mandante_id = mandante_id
  where competicao_id = new.competicao_id and (mandante_id = new.time_id or visitante_id = new.time_id);
  return null;
end;
$$;
create trigger competicao_times_recalcula_jogos after insert or update of grupo on public.competicao_times
  for each row execute function public.recalcular_grupo_dos_jogos();
update public.jogos set mandante_id = mandante_id;

-- 6. Filiação: limite de pedidos -------------------------------------------------------------
alter table public.solicitacoes_filiacao
  add constraint solicitacoes_filiacao_uf_check
  check (uf is null or uf in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'));

create or replace function public.limitar_filiacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.solicitacoes_filiacao where lower(email) = lower(new.email) and criado_em > now() - interval '1 hour') then
    raise exception 'limite_filiacao: este e-mail já enviou um pedido na última hora';
  end if;
  if (select count(*) from public.solicitacoes_filiacao where criado_em > now() - interval '1 hour') >= 100 then
    raise exception 'limite_filiacao: muitos pedidos neste momento; tente novamente mais tarde';
  end if;
  return new;
end;
$$;
create trigger filiacao_limite before insert on public.solicitacoes_filiacao
  for each row execute function public.limitar_filiacao();
