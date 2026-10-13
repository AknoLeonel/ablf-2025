-- Dados de DEMONSTRAÇÃO – serve só para ver o site funcionando com conteúdo.
-- Tudo começa com "[DEMO]" para ser fácil de apagar (veja o bloco de limpeza no final).
-- NÃO execute isso em produção se não quiser ver dados fictícios no site.

insert into ligas (nome, cidade, uf) values ('[DEMO] Liga Exemplo', 'Brasília', 'DF');

insert into competicoes (liga_id, nome, ano, formato, status)
select id, '[DEMO] Copa Exemplo', 2026, 'Pontos corridos', 'em_andamento' from ligas where nome = '[DEMO] Liga Exemplo';

insert into times (liga_id, nome, cidade, uf)
select l.id, x.nome, 'Brasília', 'DF'
from ligas l, (values ('[DEMO] Águias FC'), ('[DEMO] Leões Futsal'), ('[DEMO] Tigres EC'), ('[DEMO] Falcões AA')) as x(nome)
where l.nome = '[DEMO] Liga Exemplo';

insert into competicao_times (competicao_id, time_id)
select c.id, t.id from competicoes c, times t where c.nome = '[DEMO] Copa Exemplo' and t.nome like '[DEMO]%';

-- 3 jogadores por time
insert into jogadores (time_id, nome, apelido, ano_nascimento, posicao, pe_dominante, altura_cm, peso_kg, numero)
select t.id, p.nome || ' ' || t.nome, p.apelido, p.ano, p.posicao, p.pe, p.altura, p.peso, p.numero
from times t
cross join (values
  ('[DEMO] Atleta A', 'Ala',   1998, 'ala',     'direito',   175, 70.0, 7),
  ('[DEMO] Atleta B', 'Pivô',  2001, 'pivo',    'esquerdo',  182, 78.5, 9),
  ('[DEMO] Atleta C', 'Goleiro', 1995, 'goleiro', 'ambidestro', 186, 82.0, 1)
) as p(nome, apelido, ano, posicao, pe, altura, peso, numero)
where t.nome like '[DEMO]%';

-- Jogos: 3 rodadas de pontos corridos entre 4 times
with c as (select id from competicoes where nome = '[DEMO] Copa Exemplo'),
     t as (select nome, id from times where nome like '[DEMO]%')
insert into jogos (competicao_id, rodada, mandante_id, visitante_id, data_hora, local, gols_mandante, gols_visitante, status)
select c.id, j.rodada, m.id, v.id, now() + (j.dias || ' days')::interval, 'Ginásio Exemplo', j.gm, j.gv, j.status
from c,
(values
  (1, '[DEMO] Águias FC',  '[DEMO] Leões Futsal', -14, 4,    2,    'encerrado'),
  (1, '[DEMO] Tigres EC',  '[DEMO] Falcões AA',   -14, 1,    1,    'encerrado'),
  (2, '[DEMO] Águias FC',  '[DEMO] Tigres EC',    -7,  3,    0,    'encerrado'),
  (2, '[DEMO] Leões Futsal','[DEMO] Falcões AA',  -7,  2,    5,    'encerrado'),
  (3, '[DEMO] Falcões AA', '[DEMO] Águias FC',     7,  null, null, 'agendado'),
  (3, '[DEMO] Leões Futsal','[DEMO] Tigres EC',    7,  null, null, 'agendado')
) as j(rodada, mandante, visitante, dias, gm, gv, status)
join t m on m.nome = j.mandante
join t v on v.nome = j.visitante;

-- Súmula dos jogos encerrados (gols batem com os placares acima)
insert into eventos_jogo (jogo_id, jogador_id, time_id, tipo, minuto, periodo)
select jg.id, p.id, p.time_id, e.tipo, e.minuto, case when e.minuto <= 20 then 1 else 2 end
from (values
  -- Águias 4 x 2 Leões
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Pivô', 'gol',  5),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Ala',  'assistencia', 5),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Pivô', 'gol', 12),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Pivô', 'gol', 25),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Ala',  'assistencia', 25),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Águias FC',    'Pivô', 'gol', 33),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Leões Futsal', 'Pivô', 'gol', 18),
  ('[DEMO] Águias FC', '[DEMO] Leões Futsal', '[DEMO] Leões Futsal', 'Pivô', 'gol', 30),
  -- Tigres 1 x 1 Falcões
  ('[DEMO] Tigres EC', '[DEMO] Falcões AA',   '[DEMO] Tigres EC',    'Ala',  'gol', 10),
  ('[DEMO] Tigres EC', '[DEMO] Falcões AA',   '[DEMO] Falcões AA',   'Pivô', 'gol', 28),
  ('[DEMO] Tigres EC', '[DEMO] Falcões AA',   '[DEMO] Tigres EC',    'Pivô', 'amarelo', 15),
  -- Águias 3 x 0 Tigres
  ('[DEMO] Águias FC', '[DEMO] Tigres EC',    '[DEMO] Águias FC',    'Pivô', 'gol',  8),
  ('[DEMO] Águias FC', '[DEMO] Tigres EC',    '[DEMO] Águias FC',    'Pivô', 'gol', 22),
  ('[DEMO] Águias FC', '[DEMO] Tigres EC',    '[DEMO] Águias FC',    'Ala',  'gol', 35),
  -- Leões 2 x 5 Falcões
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Leões Futsal', 'Ala', 'gol', 14),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Leões Futsal', 'Ala', 'gol', 19),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Falcões AA',   'Pivô', 'gol',  3),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Falcões AA',   'Pivô', 'gol',  9),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Falcões AA',   'Pivô', 'gol', 20),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Falcões AA',   'Pivô', 'gol', 31),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Falcões AA',   'Ala',  'gol', 38),
  ('[DEMO] Leões Futsal', '[DEMO] Falcões AA', '[DEMO] Leões Futsal', 'Pivô', 'vermelho', 36)
) as e(mandante, visitante, time, apelido, tipo, minuto)
join times tm on tm.nome = e.mandante
join times tv on tv.nome = e.visitante
join jogos jg on jg.mandante_id = tm.id and jg.visitante_id = tv.id
join times te on te.nome = e.time
join jogadores p on p.time_id = te.id and p.apelido = e.apelido;

-- Goleiros que jogaram (entram em "jogos" mesmo sem gols/cartões)
insert into escalacoes (jogo_id, jogador_id, time_id, titular)
select jg.id, p.id, p.time_id, true
from jogos jg
join jogadores p on p.time_id in (jg.mandante_id, jg.visitante_id) and p.apelido = 'Goleiro'
where jg.status = 'encerrado' and jg.competicao_id in (select id from competicoes where nome = '[DEMO] Copa Exemplo');

insert into destaques (tipo, jogador_id, competicao_id, rodada, texto)
select 'craque_da_rodada', p.id, c.id, 1, 'Dois gols e uma assistência na vitória por 4 a 2.'
from jogadores p, competicoes c, times t
where p.time_id = t.id and t.nome = '[DEMO] Águias FC' and p.apelido = 'Pivô' and c.nome = '[DEMO] Copa Exemplo';

insert into noticias (titulo, categoria, resumo, publicada)
values ('[DEMO] Começa a Copa Exemplo', 'Campeonato', 'Notícia de demonstração.', true);

-- ---------------------------------------------------------------------------
-- LIMPEZA (rode quando quiser remover tudo que é demonstração):
--   delete from noticias     where titulo like '[DEMO]%';
--   delete from competicoes  where nome   like '[DEMO]%';   -- apaga jogos e eventos junto
--   delete from jogadores    where nome   like '[DEMO]%';
--   delete from times        where nome   like '[DEMO]%';
--   delete from ligas        where nome   like '[DEMO]%';
-- ---------------------------------------------------------------------------
