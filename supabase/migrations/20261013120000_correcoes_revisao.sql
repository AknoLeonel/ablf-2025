-- Correções da revisão de código (rode DEPOIS de 20261013000000_schema_inicial.sql).
--   1. Exclusão segura: competição com jogos e jogador com lances não podem mais ser apagados
--      de uma vez (antes apagava a súmula inteira em cascata).
--   2. Integridade da súmula: o time de um lance/escalação precisa ser um dos dois times do jogo.
--   3. Histórico de alterações (auditoria) de tudo que o painel altera.
--   4. Coluna `tem_conteudo` em notícias (a lista não precisa baixar o texto inteiro).
--   5. Higiene de permissões: visitante nunca escreve; ninguém altera `admins` pela API.

-- 1. Exclusão segura ---------------------------------------------------------
alter table public.jogos
  drop constraint jogos_competicao_id_fkey,
  add constraint jogos_competicao_id_fkey
    foreign key (competicao_id) references public.competicoes (id) on delete restrict;

alter table public.eventos_jogo
  drop constraint eventos_jogo_jogador_id_fkey,
  add constraint eventos_jogo_jogador_id_fkey
    foreign key (jogador_id) references public.jogadores (id) on delete restrict;

alter table public.escalacoes
  drop constraint escalacoes_jogador_id_fkey,
  add constraint escalacoes_jogador_id_fkey
    foreign key (jogador_id) references public.jogadores (id) on delete restrict;

-- 2. Integridade da súmula ---------------------------------------------------
create or replace function public.validar_time_do_jogo()
returns trigger
language plpgsql
as $$
declare
  j record;
begin
  select mandante_id, visitante_id into j from public.jogos where id = new.jogo_id;
  if new.time_id is distinct from j.mandante_id and new.time_id is distinct from j.visitante_id then
    raise exception 'time_do_jogo: o time deve ser um dos dois times do jogo %', new.jogo_id;
  end if;
  return new;
end;
$$;

create trigger eventos_time_do_jogo before insert or update on public.eventos_jogo
  for each row execute function public.validar_time_do_jogo();
create trigger escalacoes_time_do_jogo before insert or update on public.escalacoes
  for each row execute function public.validar_time_do_jogo();

-- Não deixa trocar os times de um jogo que já tem súmula de outro time.
create or replace function public.validar_troca_de_times()
returns trigger
language plpgsql
as $$
begin
  if (new.mandante_id, new.visitante_id) is distinct from (old.mandante_id, old.visitante_id) then
    if exists (
      select 1 from public.eventos_jogo e
      where e.jogo_id = new.id and e.time_id not in (new.mandante_id, new.visitante_id)
    ) or exists (
      select 1 from public.escalacoes e
      where e.jogo_id = new.id and e.time_id not in (new.mandante_id, new.visitante_id)
    ) then
      raise exception 'time_do_jogo: este jogo já tem lances/escalação de um time que sairia da partida; apague-os antes';
    end if;
  end if;
  return new;
end;
$$;

create trigger jogos_troca_de_times before update on public.jogos
  for each row execute function public.validar_troca_de_times();

-- 3. Histórico de alterações -------------------------------------------------
create table public.auditoria (
  id          bigint generated always as identity primary key,
  criado_em   timestamptz not null default now(),
  usuario_id  uuid default auth.uid(),
  tabela      text not null,
  acao        text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  registro_id text,
  antes       jsonb,
  depois      jsonb
);
create index on public.auditoria (criado_em desc);
create index on public.auditoria (tabela, registro_id);

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linha jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.auditoria (tabela, acao, registro_id, antes, depois)
  values (
    tg_table_name, tg_op,
    coalesce(linha ->> 'id', concat_ws(':', linha ->> 'competicao_id', linha ->> 'time_id')),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'ligas', 'competicoes', 'times', 'competicao_times', 'jogadores', 'jogos',
    'escalacoes', 'eventos_jogo', 'fotos', 'noticias', 'destaques'
  ] loop
    execute format(
      'create trigger auditar after insert or update or delete on public.%I
         for each row execute function public.registrar_auditoria()', t);
  end loop;
end $$;

alter table public.auditoria enable row level security;
create policy "admin lê auditoria" on public.auditoria
  for select to authenticated using (public.is_admin());

-- 4. Notícias: saber se há texto completo sem baixá-lo --------------------------
alter table public.noticias
  add column tem_conteudo boolean generated always as (nullif(btrim(conteudo), '') is not null) stored;

-- 5. Permissões ----------------------------------------------------------------
revoke all on public.auditoria from anon, authenticated;
grant select on public.auditoria to authenticated;
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke all on public.admins from anon;
revoke insert, update, delete, truncate on public.admins from authenticated;
