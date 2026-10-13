-- ABLF – produto v2 (rode DEPOIS das duas migrações anteriores).
--   1. Papéis: `admin` (tudo) e `mesario` (só súmula: placar, lances, escalação).
--   2. Súmula pode ser FECHADA (travada); só admin reabre ou corrige.
--   3. Súmula mais completa: árbitros, anotador, período atual, faltas e motivo do cartão.
--   4. Competições com fases e grupos: tabela por grupo; mata-mata fora da tabela.
--   5. Documentos oficiais (PDF/Word/Excel) com bucket próprio.
--   6. Pedidos de filiação enviados pelo site.

-- 1. Papéis ------------------------------------------------------------------
alter table public.admins
  add column papel text not null default 'admin' check (papel in ('admin', 'mesario'));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and papel = 'admin');
$$;

-- Admin OU mesário: pode lançar súmula.
create or replace function public.is_equipe()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Lances e escalação: toda a equipe escreve (antes só admin).
drop policy "admin escreve" on public.eventos_jogo;
create policy "equipe escreve" on public.eventos_jogo
  for all to authenticated using (public.is_equipe()) with check (public.is_equipe());
drop policy "admin escreve" on public.escalacoes;
create policy "equipe escreve" on public.escalacoes
  for all to authenticated using (public.is_equipe()) with check (public.is_equipe());

-- Jogos: mesário só ATUALIZA (as colunas permitidas são checadas no trigger abaixo).
create policy "mesario atualiza" on public.jogos
  for update to authenticated using (public.is_equipe()) with check (public.is_equipe());

-- 2 e 3. Súmula: campos novos, fechamento e regras ---------------------------
alter table public.jogos
  add column arbitro_principal text,
  add column arbitro_auxiliar  text,
  add column anotador          text,
  add column periodo_atual     smallint check (periodo_atual between 1 and 4),
  add column sumula_fechada    boolean not null default false,
  add column fechada_em        timestamptz,
  add column fechada_por       uuid,
  add column tipo_fase         text not null default 'classificatoria'
                               check (tipo_fase in ('classificatoria', 'mata_mata')),
  add column grupo             text,
  add constraint jogos_fechada_so_encerrado check (not sumula_fechada or status = 'encerrado');

alter table public.eventos_jogo drop constraint eventos_jogo_tipo_check;
alter table public.eventos_jogo
  add constraint eventos_jogo_tipo_check
    check (tipo in ('gol', 'gol_contra', 'assistencia', 'amarelo', 'vermelho', 'falta')),
  add column motivo text;

create or replace function public.jogos_regras_de_edicao()
returns trigger language plpgsql as $$
declare
  permitidas text[] := array[
    'gols_mandante', 'gols_visitante', 'status', 'observacoes', 'periodo_atual',
    'arbitro_principal', 'arbitro_auxiliar', 'anotador',
    'sumula_fechada', 'fechada_em', 'fechada_por'
  ];
begin
  if new.sumula_fechada and not old.sumula_fechada then
    new.fechada_em := now();
    new.fechada_por := auth.uid();
  elsif not new.sumula_fechada and old.sumula_fechada then
    new.fechada_em := null;
    new.fechada_por := null;
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

create trigger jogos_regras_de_edicao before update on public.jogos
  for each row execute function public.jogos_regras_de_edicao();

create or replace function public.bloquear_sumula_fechada()
returns trigger language plpgsql as $$
declare
  jid bigint := coalesce(new.jogo_id, old.jogo_id);
begin
  if auth.uid() is not null and not public.is_admin()
     and exists (select 1 from public.jogos where id = jid and sumula_fechada) then
    raise exception 'sumula_fechada: a súmula está fechada; só um administrador pode alterar';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger eventos_sumula_fechada before insert or update or delete on public.eventos_jogo
  for each row execute function public.bloquear_sumula_fechada();
create trigger escalacoes_sumula_fechada before insert or update or delete on public.escalacoes
  for each row execute function public.bloquear_sumula_fechada();

-- 4. Grupos e fases ----------------------------------------------------------
alter table public.competicao_times add column grupo text;

create or replace view public.v_classificacao
with (security_invoker = true) as
with encerrados as (
  select * from public.jogos where status = 'encerrado' and tipo_fase = 'classificatoria'
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

-- 5. Documentos oficiais -----------------------------------------------------
create table public.documentos (
  id             bigint generated always as identity primary key,
  titulo         text not null,
  categoria      text not null default 'outro'
                 check (categoria in ('regulamento', 'edital', 'ata', 'estatuto', 'sumula', 'outro')),
  descricao      text,
  arquivo_url    text not null,
  tamanho_bytes  bigint,
  competicao_id  bigint references public.competicoes (id) on delete set null,
  jogo_id        bigint references public.jogos (id) on delete set null,
  publicado      boolean not null default true,
  publicado_em   timestamptz not null default now()
);
create index on public.documentos (categoria, publicado_em desc);
create index on public.documentos (competicao_id);
create index on public.documentos (jogo_id);

alter table public.documentos enable row level security;
create policy "leitura pública" on public.documentos
  for select to anon, authenticated using (publicado or public.is_admin());
create policy "admin escreve" on public.documentos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', true, 20971520, array[
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "documentos: leitura pública" on storage.objects
  for select to anon, authenticated using (bucket_id = 'documentos');
create policy "documentos: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'documentos' and public.is_admin());
create policy "documentos: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'documentos' and public.is_admin());
create policy "documentos: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'documentos' and public.is_admin());

-- 6. Pedidos de filiação -----------------------------------------------------
create table public.solicitacoes_filiacao (
  id               bigint generated always as identity primary key,
  criado_em        timestamptz not null default now(),
  liga_nome        text not null check (char_length(liga_nome) between 2 and 120),
  responsavel      text not null check (char_length(responsavel) between 2 and 120),
  email            text not null check (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefone         text not null check (char_length(telefone) between 8 and 30),
  cidade           text check (char_length(cidade) <= 80),
  uf               char(2),
  qtd_times        smallint check (qtd_times between 0 and 1000),
  mensagem         text check (char_length(mensagem) <= 1500),
  aceite_lgpd      boolean not null check (aceite_lgpd),
  status           text not null default 'nova'
                   check (status in ('nova', 'em_contato', 'aprovada', 'recusada')),
  observacao_interna text
);
create index on public.solicitacoes_filiacao (criado_em desc);

alter table public.solicitacoes_filiacao enable row level security;
-- Visitante só INSERE (sem ler nada) e não pode escolher status/observação.
create policy "qualquer um envia" on public.solicitacoes_filiacao
  for insert to anon, authenticated
  with check (status = 'nova' and observacao_interna is null);
create policy "admin gerencia" on public.solicitacoes_filiacao
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Auditoria dos novos cadastros do painel.
create trigger auditar after insert or update or delete on public.documentos
  for each row execute function public.registrar_auditoria();
create trigger auditar after update or delete on public.solicitacoes_filiacao
  for each row execute function public.registrar_auditoria();

-- Permissões explícitas ------------------------------------------------------
revoke all on public.documentos, public.solicitacoes_filiacao from anon, authenticated;
grant select on public.documentos to anon, authenticated;
grant insert, update, delete on public.documentos to authenticated;
grant insert on public.solicitacoes_filiacao to anon, authenticated;
grant select, update, delete on public.solicitacoes_filiacao to authenticated;
grant usage on sequence public.documentos_id_seq to authenticated;
grant usage on sequence public.solicitacoes_filiacao_id_seq to anon, authenticated;
