-- ABLF – esquema inicial (ligas, times, jogadores, jogos, súmula, fotos, notícias, destaques)
--
-- Como aplicar: Supabase Dashboard > SQL Editor > cole este arquivo e execute
-- (ou `supabase db push` se usar a CLI).
--
-- Regras de acesso:
--   * Qualquer visitante (anon) pode LER o conteúdo público.
--   * Somente usuários listados em `admins` podem ESCREVER (RLS + is_admin()).
--
-- Privacidade: jogadores guardam apenas o ANO de nascimento (não a data completa),
-- pois muitas ligas têm atletas menores de idade e a ficha é pública.

-- ---------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  criado_em  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Cadastros básicos
-- ---------------------------------------------------------------------------
create table public.ligas (
  id         bigint generated always as identity primary key,
  nome       text not null,
  logo_url   text,
  cidade     text,
  uf         char(2),
  criado_em  timestamptz not null default now()
);

create table public.competicoes (
  id              bigint generated always as identity primary key,
  liga_id         bigint references public.ligas (id) on delete set null,
  nome            text not null,
  ano             smallint not null,
  formato         text,                       -- ex.: pontos corridos, mata-mata, grupos + mata-mata
  status          text not null default 'em_andamento'
                  check (status in ('em_breve', 'em_andamento', 'encerrada')),
  pontos_vitoria  smallint not null default 3,
  pontos_empate   smallint not null default 1,
  descricao       text,
  criado_em       timestamptz not null default now()
);

create table public.times (
  id         bigint generated always as identity primary key,
  liga_id    bigint references public.ligas (id) on delete set null,
  nome       text not null,
  escudo_url text,
  cidade     text,
  uf         char(2),
  criado_em  timestamptz not null default now()
);

-- Times inscritos em cada competição (quem aparece na tabela mesmo sem jogos).
create table public.competicao_times (
  competicao_id bigint not null references public.competicoes (id) on delete cascade,
  time_id       bigint not null references public.times (id) on delete cascade,
  primary key (competicao_id, time_id)
);

create table public.jogadores (
  id              bigint generated always as identity primary key,
  time_id         bigint references public.times (id) on delete set null,  -- time atual
  nome            text not null,
  apelido         text,
  foto_url        text,
  ano_nascimento  smallint check (ano_nascimento between 1940 and 2100),
  posicao         text check (posicao in ('goleiro', 'fixo', 'ala', 'pivo')),
  pe_dominante    text check (pe_dominante in ('direito', 'esquerdo', 'ambidestro')),
  altura_cm       smallint check (altura_cm between 100 and 250),
  peso_kg         numeric(5, 1) check (peso_kg between 30 and 200),
  numero          smallint check (numero between 0 and 99),
  naturalidade    text,
  bio             text,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Jogos e súmula
-- ---------------------------------------------------------------------------
create table public.jogos (
  id             bigint generated always as identity primary key,
  competicao_id  bigint not null references public.competicoes (id) on delete cascade,
  rodada         smallint,
  fase           text,                        -- ex.: Fase de grupos, Quartas, Semifinal, Final
  mandante_id    bigint not null references public.times (id),
  visitante_id   bigint not null references public.times (id),
  data_hora      timestamptz,
  local          text,
  gols_mandante  smallint check (gols_mandante >= 0),
  gols_visitante smallint check (gols_visitante >= 0),
  status         text not null default 'agendado'
                 check (status in ('agendado', 'ao_vivo', 'encerrado', 'adiado', 'cancelado')),
  observacoes    text,
  criado_em      timestamptz not null default now(),
  constraint jogos_times_diferentes check (mandante_id <> visitante_id),
  constraint jogos_placar_se_encerrado check (
    status <> 'encerrado' or (gols_mandante is not null and gols_visitante is not null)
  )
);

-- Quem entrou em quadra (súmula). Opcional: jogadores com gols/cartões contam como participantes.
create table public.escalacoes (
  jogo_id     bigint not null references public.jogos (id) on delete cascade,
  jogador_id  bigint not null references public.jogadores (id) on delete cascade,
  time_id     bigint not null references public.times (id),
  titular     boolean not null default true,
  primary key (jogo_id, jogador_id)
);

create table public.eventos_jogo (
  id          bigint generated always as identity primary key,
  jogo_id     bigint not null references public.jogos (id) on delete cascade,
  jogador_id  bigint not null references public.jogadores (id) on delete cascade,
  time_id     bigint not null references public.times (id),   -- time do jogador no jogo
  tipo        text not null check (tipo in ('gol', 'gol_contra', 'assistencia', 'amarelo', 'vermelho')),
  minuto      smallint check (minuto between 0 and 120),
  periodo     smallint check (periodo in (1, 2, 3, 4)),         -- 1º/2º tempo, 3º/4º = prorrogação
  criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Conteúdo editorial
-- ---------------------------------------------------------------------------
create table public.fotos (
  id             bigint generated always as identity primary key,
  url            text not null,
  legenda        text,
  competicao_id  bigint references public.competicoes (id) on delete set null,
  jogo_id        bigint references public.jogos (id) on delete set null,
  time_id        bigint references public.times (id) on delete set null,
  jogador_id     bigint references public.jogadores (id) on delete set null,
  criado_em      timestamptz not null default now()
);

create table public.noticias (
  id            bigint generated always as identity primary key,
  titulo        text not null,
  categoria     text,
  resumo        text,
  conteudo      text,
  imagem_url    text,
  link_externo  text,
  publicada     boolean not null default true,
  publicada_em  timestamptz not null default now()
);

-- Destaques escolhidos à mão (craque da rodada etc.). Artilharia/assistências são calculadas.
create table public.destaques (
  id             bigint generated always as identity primary key,
  tipo           text not null default 'craque_da_rodada'
                 check (tipo in ('craque_da_rodada', 'jogador_em_destaque')),
  jogador_id     bigint not null references public.jogadores (id) on delete cascade,
  competicao_id  bigint references public.competicoes (id) on delete set null,
  rodada         smallint,
  texto          text,
  publicado      boolean not null default true,
  criado_em      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------
create index on public.times (liga_id);
create index on public.competicoes (liga_id);
create index on public.jogadores (time_id);
create index on public.jogos (competicao_id, data_hora);
create index on public.jogos (mandante_id);
create index on public.jogos (visitante_id);
create index on public.escalacoes (jogador_id);
create index on public.eventos_jogo (jogo_id);
create index on public.eventos_jogo (jogador_id);
create index on public.fotos (jogo_id);
create index on public.fotos (jogador_id);
create index on public.fotos (time_id);
create index on public.noticias (publicada_em desc);
create index on public.destaques (competicao_id, rodada);

-- ---------------------------------------------------------------------------
-- Views calculadas (tabela de classificação e estatísticas – nada é digitado à mão)
-- security_invoker: respeitam a RLS de quem consulta.
-- ---------------------------------------------------------------------------
create view public.v_classificacao
with (security_invoker = true) as
with encerrados as (
  select * from public.jogos where status = 'encerrado'
),
linhas as (
  select competicao_id, mandante_id as time_id,
         gols_mandante as gp, gols_visitante as gc from encerrados
  union all
  select competicao_id, visitante_id,
         gols_visitante, gols_mandante from encerrados
),
participantes as (
  select competicao_id, time_id from public.competicao_times
  union
  select competicao_id, mandante_id from public.jogos
  union
  select competicao_id, visitante_id from public.jogos
),
tabela as (
  select
    p.competicao_id,
    p.time_id,
    count(l.time_id)                         as jogos,
    count(*) filter (where l.gp > l.gc)      as vitorias,
    count(*) filter (where l.gp = l.gc)      as empates,
    count(*) filter (where l.gp < l.gc)      as derrotas,
    coalesce(sum(l.gp), 0)::int              as gols_pro,
    coalesce(sum(l.gc), 0)::int              as gols_contra
  from participantes p
  left join linhas l on l.competicao_id = p.competicao_id and l.time_id = p.time_id
  group by p.competicao_id, p.time_id
)
select
  row_number() over (
    partition by t.competicao_id
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
  (t.vitorias * c.pontos_vitoria + t.empates * c.pontos_empate)::int as pontos
from tabela t
join public.competicoes c on c.id = t.competicao_id
join public.times tm      on tm.id = t.time_id;

-- Estatísticas por jogador em cada competição (apenas jogos encerrados).
create view public.v_estatisticas_jogador_competicao
with (security_invoker = true) as
with encerrados as (
  select id, competicao_id from public.jogos where status = 'encerrado'
),
participacoes as (
  select jogo_id, jogador_id from public.escalacoes
  union
  select jogo_id, jogador_id from public.eventos_jogo
),
jogos_por_jogador as (
  select e.competicao_id, p.jogador_id, count(*) as jogos
  from participacoes p
  join encerrados e on e.id = p.jogo_id
  group by e.competicao_id, p.jogador_id
),
eventos as (
  select
    e.competicao_id,
    ev.jogador_id,
    count(*) filter (where ev.tipo = 'gol')         as gols,
    count(*) filter (where ev.tipo = 'assistencia') as assistencias,
    count(*) filter (where ev.tipo = 'amarelo')     as amarelos,
    count(*) filter (where ev.tipo = 'vermelho')    as vermelhos,
    count(*) filter (where ev.tipo = 'gol_contra')  as gols_contra
  from public.eventos_jogo ev
  join encerrados e on e.id = ev.jogo_id
  group by e.competicao_id, ev.jogador_id
)
select
  jp.competicao_id,
  jp.jogador_id,
  j.nome,
  j.apelido,
  j.foto_url,
  j.posicao,
  j.numero,
  j.time_id,
  t.nome       as time_nome,
  t.escudo_url as time_escudo_url,
  jp.jogos::int                          as jogos,
  coalesce(ev.gols, 0)::int              as gols,
  coalesce(ev.assistencias, 0)::int      as assistencias,
  coalesce(ev.amarelos, 0)::int          as amarelos,
  coalesce(ev.vermelhos, 0)::int         as vermelhos,
  coalesce(ev.gols_contra, 0)::int       as gols_contra
from jogos_por_jogador jp
join public.jogadores j on j.id = jp.jogador_id
left join public.times t on t.id = j.time_id
left join eventos ev on ev.competicao_id = jp.competicao_id and ev.jogador_id = jp.jogador_id;

-- Carreira: soma de todas as competições (ficha técnica do jogador).
create view public.v_estatisticas_jogador
with (security_invoker = true) as
select
  jogador_id,
  sum(jogos)::int        as jogos,
  sum(gols)::int         as gols,
  sum(assistencias)::int as assistencias,
  sum(amarelos)::int     as amarelos,
  sum(vermelhos)::int    as vermelhos,
  sum(gols_contra)::int  as gols_contra
from public.v_estatisticas_jogador_competicao
group by jogador_id;

-- ---------------------------------------------------------------------------
-- Segurança (RLS)
-- ---------------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.ligas           enable row level security;
alter table public.competicoes     enable row level security;
alter table public.times           enable row level security;
alter table public.competicao_times enable row level security;
alter table public.jogadores       enable row level security;
alter table public.jogos           enable row level security;
alter table public.escalacoes      enable row level security;
alter table public.eventos_jogo    enable row level security;
alter table public.fotos           enable row level security;
alter table public.noticias        enable row level security;
alter table public.destaques       enable row level security;

-- Cada usuário só enxerga a própria linha em admins (usado pelo painel para saber se é admin).
-- Ninguém cria admin pelo app: use o SQL Editor (veja supabase/README.md).
create policy "admin lê a si mesmo" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Leitura pública + escrita só para admin, tabela a tabela.
do $$
declare
  t text;
begin
  foreach t in array array[
    'ligas', 'competicoes', 'times', 'competicao_times', 'jogadores',
    'jogos', 'escalacoes', 'eventos_jogo', 'fotos'
  ] loop
    execute format('create policy "leitura pública" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin escreve" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Notícias e destaques: o público só vê o que está publicado; admin vê tudo.
create policy "leitura pública" on public.noticias
  for select to anon, authenticated using (publicada or public.is_admin());
create policy "admin escreve" on public.noticias
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "leitura pública" on public.destaques
  for select to anon, authenticated using (publicado or public.is_admin());
create policy "admin escreve" on public.destaques
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Privilégios de tabela (a RLS acima faz o filtro de linhas).
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
revoke select on public.admins from anon;
grant insert, update, delete on
  public.ligas, public.competicoes, public.times, public.competicao_times,
  public.jogadores, public.jogos, public.escalacoes, public.eventos_jogo,
  public.fotos, public.noticias, public.destaques
to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket público "midia" (escudos, fotos de jogadores, fotos de jogos, notícias)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('midia', 'midia', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "midia: leitura pública" on storage.objects
  for select to anon, authenticated using (bucket_id = 'midia');
create policy "midia: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'midia' and public.is_admin());
create policy "midia: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'midia' and public.is_admin());
create policy "midia: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'midia' and public.is_admin());
