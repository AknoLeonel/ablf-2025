import { getSupabase } from './supabase';

async function run(build) {
  const sb = await getSupabase();
  const { data, error } = await build(sb);
  if (error) throw error;
  return data;
}

const TIME_MIN = 'id, nome, escudo_url';
const JOGO_SELECT = `id, competicao_id, rodada, fase, data_hora, local, status, gols_mandante, gols_visitante,
  mandante:times!mandante_id(${TIME_MIN}), visitante:times!visitante_id(${TIME_MIN})`;

export const listCompeticoes = () =>
  run((sb) =>
    sb
      .from('competicoes')
      .select('id, nome, ano, status, formato, descricao')
      .order('ano', { ascending: false })
      .order('id', { ascending: false }),
  );

export const listJogos = ({ competicaoId, timeId, limit } = {}) =>
  run((sb) => {
    let q = sb
      .from('jogos')
      .select(JOGO_SELECT)
      .order('rodada', { ascending: true, nullsFirst: false })
      .order('data_hora', { ascending: true, nullsFirst: false });
    if (competicaoId) q = q.eq('competicao_id', competicaoId);
    if (timeId) q = q.or(`mandante_id.eq.${timeId},visitante_id.eq.${timeId}`);
    if (limit) q = q.limit(limit);
    return q;
  });

export const getJogo = (id) =>
  run((sb) =>
    sb
      .from('jogos')
      .select(`${JOGO_SELECT}, observacoes, competicao:competicoes(id, nome, ano)`)
      .eq('id', id)
      .maybeSingle(),
  );

export const listEventosJogo = (jogoId) =>
  run((sb) =>
    sb
      .from('eventos_jogo')
      .select('id, tipo, minuto, periodo, time_id, jogador:jogadores(id, nome, apelido)')
      .eq('jogo_id', jogoId)
      .order('periodo', { nullsFirst: false })
      .order('minuto', { nullsFirst: false })
      .order('id'),
  );

export const listEscalacao = (jogoId) =>
  run((sb) =>
    sb
      .from('escalacoes')
      .select('time_id, titular, jogador:jogadores(id, nome, apelido, numero, posicao)')
      .eq('jogo_id', jogoId),
  );

export const getClassificacao = (competicaoId) =>
  run((sb) =>
    sb.from('v_classificacao').select('*').eq('competicao_id', competicaoId).order('posicao'),
  );

export const listTimes = () =>
  run((sb) => sb.from('times').select('id, nome, escudo_url, cidade, uf').order('nome'));

export const getTime = (id) =>
  run((sb) =>
    sb
      .from('times')
      .select('id, nome, escudo_url, cidade, uf, liga:ligas(id, nome)')
      .eq('id', id)
      .maybeSingle(),
  );

export const listJogadores = ({ timeId } = {}) =>
  run((sb) => {
    let q = sb
      .from('jogadores')
      .select('id, nome, apelido, foto_url, posicao, numero, time_id, ativo')
      .order('numero', { nullsFirst: false })
      .order('nome');
    if (timeId) q = q.eq('time_id', timeId);
    return q;
  });

export const getJogador = (id) =>
  run((sb) =>
    sb
      .from('jogadores')
      .select('*, time:times(id, nome, escudo_url)')
      .eq('id', id)
      .maybeSingle(),
  );

export const getEstatisticasCarreira = (jogadorId) =>
  run((sb) =>
    sb.from('v_estatisticas_jogador').select('*').eq('jogador_id', jogadorId).maybeSingle(),
  );

export const listEstatisticasPorCompeticao = (jogadorId) =>
  run((sb) =>
    sb
      .from('v_estatisticas_jogador_competicao')
      .select('*, competicao:competicoes(id, nome, ano)')
      .eq('jogador_id', jogadorId),
  );

export const listEventosJogador = (jogadorId) =>
  run((sb) =>
    sb
      .from('eventos_jogo')
      .select(
        `id, tipo, minuto, jogo:jogos(id, data_hora, rodada, status, gols_mandante, gols_visitante,
          mandante:times!mandante_id(id, nome), visitante:times!visitante_id(id, nome))`,
      )
      .eq('jogador_id', jogadorId),
  );

// Ranking de uma competição por "gols", "assistencias", "amarelos"...
export const listRanking = ({ competicaoId, campo, limit = 5 }) =>
  run((sb) =>
    sb
      .from('v_estatisticas_jogador_competicao')
      .select('*')
      .eq('competicao_id', competicaoId)
      .gt(campo, 0)
      .order(campo, { ascending: false })
      .order('jogos', { ascending: true })
      .limit(limit),
  );

export const listDestaquesManuais = ({ competicaoId, limit = 6 } = {}) =>
  run((sb) => {
    let q = sb
      .from('destaques')
      .select(
        `id, tipo, rodada, texto, competicao_id,
         jogador:jogadores(id, nome, apelido, foto_url, posicao, numero, time:times(id, nome, escudo_url))`,
      )
      .eq('publicado', true)
      .order('criado_em', { ascending: false })
      .limit(limit);
    if (competicaoId) q = q.eq('competicao_id', competicaoId);
    return q;
  });

export const listFotos = ({ jogoId, jogadorId, timeId, limit = 60 }) =>
  run((sb) => {
    let q = sb
      .from('fotos')
      .select('id, url, legenda')
      .order('criado_em', { ascending: false })
      .limit(limit);
    if (jogoId) q = q.eq('jogo_id', jogoId);
    if (jogadorId) q = q.eq('jogador_id', jogadorId);
    if (timeId) q = q.eq('time_id', timeId);
    return q;
  });

export const listNoticias = ({ limit } = {}) =>
  run((sb) => {
    let q = sb
      .from('noticias')
      .select('id, titulo, categoria, resumo, imagem_url, link_externo, publicada_em, conteudo')
      .eq('publicada', true)
      .order('publicada_em', { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  });

export const getNoticia = (id) =>
  run((sb) => sb.from('noticias').select('*').eq('id', id).eq('publicada', true).maybeSingle());
