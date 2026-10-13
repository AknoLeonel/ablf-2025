import { getSupabase } from './supabase';

async function run(build) {
  const sb = await getSupabase();
  const { data, error } = await build(sb);
  if (error) throw error;
  return data;
}

// O PostgREST devolve no máximo ~1000 linhas por consulta, sem avisar. Para listas que precisam
// ser completas, busca em páginas até acabar. `montar(sb)` deve devolver uma consulta NOVA a cada
// chamada, com ordem determinística (termine com .order('id')).
const PAGINA = 500;
export async function fetchAll(montar) {
  const sb = await getSupabase();
  const todas = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await montar(sb).range(de, de + PAGINA - 1);
    if (error) throw error;
    todas.push(...data);
    if (data.length < PAGINA) return todas;
  }
}

const TIME_MIN = 'id, nome, escudo_url';
const JOGO_SELECT = `id, competicao_id, rodada, fase, data_hora, local, status, gols_mandante, gols_visitante,
  periodo_atual, tipo_fase, grupo,
  competicao:competicoes(id, nome, ano),
  mandante:times!mandante_id(${TIME_MIN}), visitante:times!visitante_id(${TIME_MIN})`;

export const listCompeticoes = () =>
  run((sb) =>
    sb
      .from('competicoes')
      .select('id, nome, ano, status, formato, descricao')
      .order('ano', { ascending: false })
      .order('id', { ascending: false }),
  );

export const listJogos = ({ competicaoId, timeId } = {}) =>
  fetchAll((sb) => {
    let q = sb.from('jogos').select(JOGO_SELECT);
    // por competição: agrupado por rodada; por time: cronológico (mistura competições)
    q = timeId
      ? q.order('data_hora', { ascending: true, nullsFirst: false })
      : q
          .order('rodada', { ascending: true, nullsFirst: false })
          .order('data_hora', { ascending: true, nullsFirst: false });
    if (competicaoId) q = q.eq('competicao_id', competicaoId);
    if (timeId) q = q.or(`mandante_id.eq.${timeId},visitante_id.eq.${timeId}`);
    return q.order('id');
  });

export const getJogo = (id) =>
  run((sb) =>
    sb
      .from('jogos')
      .select(`${JOGO_SELECT}, observacoes, arbitro_principal, arbitro_auxiliar, anotador, sumula_fechada, fechada_em`)
      .eq('id', id)
      .maybeSingle(),
  );

export const listEventosJogo = (jogoId) =>
  run((sb) =>
    sb
      .from('eventos_jogo')
      .select('id, tipo, minuto, periodo, motivo, time_id, jogador:jogadores(id, nome, apelido)')
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

export const getTimeClassificacao = (timeId) =>
  run((sb) => sb.from('v_classificacao').select('*').eq('time_id', timeId));

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
  fetchAll((sb) => {
    let q = sb
      .from('jogadores')
      .select('id, nome, apelido, foto_url, posicao, numero, time_id, ativo')
      .order('numero', { nullsFirst: false })
      .order('nome');
    if (timeId) q = q.eq('time_id', timeId);
    return q.order('id');
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
  fetchAll((sb) =>
    sb
      .from('eventos_jogo')
      .select(
        `id, tipo, minuto, jogo:jogos(id, data_hora, rodada, status, gols_mandante, gols_visitante,
          mandante:times!mandante_id(id, nome), visitante:times!visitante_id(id, nome))`,
      )
      .eq('jogador_id', jogadorId)
      .order('id'),
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

// Destaques da competição escolhida + os sem competição (gerais).
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
    if (competicaoId) q = q.or(`competicao_id.eq.${competicaoId},competicao_id.is.null`);
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
      .select('id, titulo, categoria, resumo, imagem_url, link_externo, publicada_em, tem_conteudo')
      .eq('publicada', true)
      .order('publicada_em', { ascending: false });
    q = limit ? q.limit(limit) : q.limit(60);
    return q;
  });

export const getNoticia = (id) =>
  run((sb) => sb.from('noticias').select('*').eq('id', id).eq('publicada', true).maybeSingle());

/* ---------- Jogos em destaque (home / faixa ao vivo) ---------- */
const inicioDoDia = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const listJogosAoVivo = () =>
  run((sb) => sb.from('jogos').select(JOGO_SELECT).eq('status', 'ao_vivo').order('data_hora').order('id'));

export const listProximosJogos = (limit = 8) =>
  run((sb) =>
    sb
      .from('jogos')
      .select(JOGO_SELECT)
      .in('status', ['agendado', 'adiado'])
      .gte('data_hora', inicioDoDia())
      .order('data_hora')
      .order('id')
      .limit(limit),
  );

export const listUltimosResultados = (limit = 8) =>
  run((sb) =>
    sb
      .from('jogos')
      .select(JOGO_SELECT)
      .eq('status', 'encerrado')
      .order('data_hora', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
      .limit(limit),
  );

/* ---------- Documentos e filiação ---------- */
export const listDocumentos = () =>
  fetchAll((sb) =>
    sb
      .from('documentos')
      .select('id, titulo, categoria, descricao, arquivo_url, tamanho_bytes, publicado_em, competicao:competicoes(id, nome, ano)')
      .eq('publicado', true)
      .order('publicado_em', { ascending: false })
      .order('id'),
  );

export const enviarFiliacao = (dados) =>
  run((sb) => sb.from('solicitacoes_filiacao').insert(dados));
