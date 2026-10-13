import { createElement as h } from 'react';
import { POSICOES, PES, STATUS_JOGO, TIPOS_EVENTO, formatDataJogo } from '../lib/format';

const opcoes = (obj) => Object.entries(obj);
const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

const liga = { table: 'ligas', label: (r) => r.nome };
const time = { table: 'times', label: (r) => r.nome };
const competicao = { table: 'competicoes', select: 'id, nome, ano', label: (r) => `${r.nome} (${r.ano})`, order: 'ano' };
const jogador = {
  table: 'jogadores',
  select: 'id, nome, apelido, time:times(nome)',
  label: (r) => `${r.apelido || r.nome}${r.time ? ` — ${r.time.nome}` : ''}`,
};

const cidade = [
  { name: 'cidade', label: 'Cidade', type: 'text' },
  { name: 'uf', label: 'UF', type: 'select', options: UFS.map((u) => [u, u]) },
];

export const RESOURCES = {
  jogos: {
    path: 'jogos',
    titulo: 'Jogos',
    singular: 'jogo',
    table: 'jogos',
    select: '*, competicao:competicoes(nome), mandante:times!mandante_id(nome), visitante:times!visitante_id(nome)',
    order: [['data_hora', false]],
    columns: [
      { key: 'competicao', label: 'Competição', render: (r) => r.competicao?.nome },
      { key: 'rodada', label: 'Rod.' },
      { key: 'partida', label: 'Jogo', render: (r) => `${r.mandante?.nome} × ${r.visitante?.nome}` },
      { key: 'data', label: 'Data', render: (r) => formatDataJogo(r.data_hora) },
      { key: 'placar', label: 'Placar', render: (r) => (r.gols_mandante != null ? `${r.gols_mandante} × ${r.gols_visitante}` : '—') },
      { key: 'status', label: 'Status', render: (r) => STATUS_JOGO[r.status] },
    ],
    fields: [
      { name: 'competicao_id', label: 'Competição', type: 'relation', relation: competicao, required: true },
      { name: 'rodada', label: 'Rodada', type: 'number', min: 1 },
      { name: 'fase', label: 'Fase', type: 'text', help: 'Ex.: Fase de grupos, Quartas de final, Final' },
      { name: 'status', label: 'Status', type: 'select', options: opcoes(STATUS_JOGO), required: true, default: 'agendado' },
      { name: 'mandante_id', label: 'Mandante', type: 'relation', relation: time, required: true },
      { name: 'visitante_id', label: 'Visitante', type: 'relation', relation: time, required: true },
      { name: 'data_hora', label: 'Data e hora', type: 'datetime' },
      { name: 'local', label: 'Local', type: 'text' },
      { name: 'gols_mandante', label: 'Gols do mandante', type: 'number', min: 0, help: 'Obrigatório para status "Encerrado".' },
      { name: 'gols_visitante', label: 'Gols do visitante', type: 'number', min: 0 },
      { name: 'observacoes', label: 'Observações', type: 'textarea', wide: true },
    ],
  },
  competicoes: {
    path: 'competicoes',
    titulo: 'Competições',
    singular: 'competição',
    table: 'competicoes',
    select: '*, liga:ligas(nome)',
    order: [['ano', false], ['id', false]],
    columns: [
      { key: 'nome', label: 'Nome' },
      { key: 'ano', label: 'Ano' },
      { key: 'liga', label: 'Liga', render: (r) => r.liga?.nome },
      { key: 'status', label: 'Status', render: (r) => ({ em_breve: 'Em breve', em_andamento: 'Em andamento', encerrada: 'Encerrada' })[r.status] },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'ano', label: 'Ano', type: 'number', required: true, default: new Date().getFullYear() },
      { name: 'liga_id', label: 'Liga', type: 'relation', relation: liga },
      { name: 'status', label: 'Status', type: 'select', required: true, default: 'em_andamento',
        options: [['em_breve', 'Em breve'], ['em_andamento', 'Em andamento'], ['encerrada', 'Encerrada']] },
      { name: 'formato', label: 'Formato', type: 'text', help: 'Ex.: Pontos corridos, Grupos + mata-mata' },
      { name: 'pontos_vitoria', label: 'Pontos por vitória', type: 'number', required: true, default: 3 },
      { name: 'pontos_empate', label: 'Pontos por empate', type: 'number', required: true, default: 1 },
      { name: 'descricao', label: 'Descrição', type: 'textarea', wide: true },
    ],
  },
  inscricoes: {
    path: 'inscricoes',
    titulo: 'Times na competição',
    singular: 'inscrição',
    table: 'competicao_times',
    pk: ['competicao_id', 'time_id'],
    canEdit: false,
    select: '*, competicao:competicoes(nome, ano), time:times(nome)',
    order: [['competicao_id', false]],
    columns: [
      { key: 'competicao', label: 'Competição', render: (r) => `${r.competicao?.nome} (${r.competicao?.ano})` },
      { key: 'time', label: 'Time', render: (r) => r.time?.nome },
    ],
    fields: [
      { name: 'competicao_id', label: 'Competição', type: 'relation', relation: competicao, required: true },
      { name: 'time_id', label: 'Time', type: 'relation', relation: time, required: true },
    ],
  },
  times: {
    path: 'times',
    titulo: 'Times',
    singular: 'time',
    table: 'times',
    select: '*, liga:ligas(nome)',
    order: [['nome', true]],
    columns: [
      { key: 'nome', label: 'Nome' },
      { key: 'liga', label: 'Liga', render: (r) => r.liga?.nome },
      { key: 'cidade', label: 'Cidade', render: (r) => [r.cidade, r.uf].filter(Boolean).join(' / ') },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'liga_id', label: 'Liga', type: 'relation', relation: liga },
      ...cidade,
      { name: 'escudo_url', label: 'Escudo', type: 'image', folder: 'escudos', maxSize: 512, wide: true },
    ],
  },
  jogadores: {
    path: 'jogadores',
    titulo: 'Jogadores',
    singular: 'jogador',
    table: 'jogadores',
    select: '*, time:times(nome)',
    order: [['nome', true]],
    columns: [
      { key: 'numero', label: 'Nº' },
      { key: 'nome', label: 'Nome' },
      { key: 'time', label: 'Time', render: (r) => r.time?.nome },
      { key: 'posicao', label: 'Posição', render: (r) => POSICOES[r.posicao] },
      { key: 'ativo', label: 'Ativo', render: (r) => (r.ativo ? 'Sim' : 'Não') },
    ],
    fields: [
      { name: 'nome', label: 'Nome completo', type: 'text', required: true },
      { name: 'apelido', label: 'Apelido (nome na súmula/site)', type: 'text' },
      { name: 'time_id', label: 'Time atual', type: 'relation', relation: time },
      { name: 'numero', label: 'Número', type: 'number', min: 0, max: 99 },
      { name: 'posicao', label: 'Posição', type: 'select', options: opcoes(POSICOES) },
      { name: 'pe_dominante', label: 'Pé dominante', type: 'select', options: opcoes(PES) },
      { name: 'altura_cm', label: 'Altura (cm)', type: 'number', min: 100, max: 250 },
      { name: 'peso_kg', label: 'Peso (kg)', type: 'number', step: 0.1, min: 30, max: 200 },
      { name: 'ano_nascimento', label: 'Ano de nascimento', type: 'number', min: 1940, help: 'Só o ano é publicado (privacidade).' },
      { name: 'naturalidade', label: 'Naturalidade', type: 'text' },
      { name: 'ativo', label: 'Ativo', type: 'boolean', default: true, checkLabel: 'Aparece no elenco do time' },
      { name: 'foto_url', label: 'Foto', type: 'image', folder: 'jogadores', maxSize: 900, wide: true,
        help: 'Só publique fotos de menores de idade com autorização dos responsáveis.' },
      { name: 'bio', label: 'Sobre o jogador', type: 'textarea', wide: true },
    ],
  },
  fotos: {
    path: 'fotos',
    titulo: 'Fotos',
    singular: 'foto',
    table: 'fotos',
    select: '*, jogo:jogos(id), time:times(nome), jogador:jogadores(nome, apelido)',
    order: [['id', false]],
    columns: [
      { key: 'url', label: 'Foto', render: (r) => h('img', { src: r.url, alt: '', className: 'w-14 h-14 object-cover rounded' }) },
      { key: 'legenda', label: 'Legenda' },
      { key: 'vinculo', label: 'Vinculada a', render: (r) => [r.jogo && `Jogo #${r.jogo.id}`, r.time?.nome, r.jogador && (r.jogador.apelido || r.jogador.nome)].filter(Boolean).join(' · ') },
    ],
    fields: [
      { name: 'url', label: 'Imagem', type: 'image', folder: 'fotos', maxSize: 1600, required: true, wide: true },
      { name: 'legenda', label: 'Legenda', type: 'text', wide: true },
      { name: 'jogo_id', label: 'Jogo', type: 'relation', help: 'Use o número do jogo (lista em Jogos).',
        relation: { table: 'jogos', select: 'id, rodada, mandante:times!mandante_id(nome), visitante:times!visitante_id(nome)', order: 'id',
          label: (r) => `#${r.id} · ${r.mandante?.nome} × ${r.visitante?.nome}` } },
      { name: 'time_id', label: 'Time', type: 'relation', relation: time },
      { name: 'jogador_id', label: 'Jogador', type: 'relation', relation: jogador },
      { name: 'competicao_id', label: 'Competição', type: 'relation', relation: competicao },
    ],
  },
  noticias: {
    path: 'noticias',
    titulo: 'Notícias',
    singular: 'notícia',
    table: 'noticias',
    order: [['publicada_em', false]],
    columns: [
      { key: 'titulo', label: 'Título' },
      { key: 'categoria', label: 'Categoria' },
      { key: 'publicada_em', label: 'Data', render: (r) => new Date(r.publicada_em).toLocaleDateString('pt-BR') },
      { key: 'publicada', label: 'Publicada', render: (r) => (r.publicada ? 'Sim' : 'Rascunho') },
    ],
    fields: [
      { name: 'titulo', label: 'Título', type: 'text', required: true, wide: true },
      { name: 'categoria', label: 'Categoria', type: 'text' },
      { name: 'publicada', label: 'Publicada', type: 'boolean', default: true, checkLabel: 'Visível no site' },
      { name: 'imagem_url', label: 'Imagem de capa', type: 'image', folder: 'noticias', maxSize: 1400, wide: true },
      { name: 'resumo', label: 'Resumo', type: 'textarea', rows: 2, wide: true },
      { name: 'conteudo', label: 'Texto completo', type: 'textarea', rows: 10, wide: true, help: 'Separe parágrafos com uma linha em branco. Se vazio, o card usa o link externo (se houver).' },
      { name: 'link_externo', label: 'Link externo', type: 'text', wide: true },
    ],
  },
  destaques: {
    path: 'destaques',
    titulo: 'Destaques',
    singular: 'destaque',
    table: 'destaques',
    select: '*, jogador:jogadores(nome, apelido), competicao:competicoes(nome)',
    order: [['id', false]],
    columns: [
      { key: 'tipo', label: 'Tipo', render: (r) => ({ craque_da_rodada: 'Craque da rodada', jogador_em_destaque: 'Em destaque' })[r.tipo] },
      { key: 'jogador', label: 'Jogador', render: (r) => r.jogador?.apelido || r.jogador?.nome },
      { key: 'competicao', label: 'Competição', render: (r) => r.competicao?.nome },
      { key: 'rodada', label: 'Rodada' },
      { key: 'publicado', label: 'Publicado', render: (r) => (r.publicado ? 'Sim' : 'Não') },
    ],
    fields: [
      { name: 'tipo', label: 'Tipo', type: 'select', required: true, default: 'craque_da_rodada',
        options: [['craque_da_rodada', 'Craque da rodada'], ['jogador_em_destaque', 'Jogador em destaque']] },
      { name: 'jogador_id', label: 'Jogador', type: 'relation', relation: jogador, required: true },
      { name: 'competicao_id', label: 'Competição', type: 'relation', relation: competicao },
      { name: 'rodada', label: 'Rodada', type: 'number', min: 1 },
      { name: 'texto', label: 'Texto', type: 'textarea', rows: 3, wide: true },
      { name: 'publicado', label: 'Publicado', type: 'boolean', default: true, checkLabel: 'Visível no site' },
    ],
  },
  ligas: {
    path: 'ligas',
    titulo: 'Ligas',
    singular: 'liga',
    table: 'ligas',
    order: [['nome', true]],
    columns: [
      { key: 'nome', label: 'Nome' },
      { key: 'cidade', label: 'Cidade', render: (r) => [r.cidade, r.uf].filter(Boolean).join(' / ') },
    ],
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      ...cidade,
      { name: 'logo_url', label: 'Logo', type: 'image', folder: 'ligas', maxSize: 512, wide: true },
    ],
  },
};

// Evento da súmula – usado dentro da página do jogo (jogo_id e time_id são preenchidos sozinhos).
export const EVENTOS = {
  titulo: 'Lances',
  singular: 'lance',
  table: 'eventos_jogo',
  select: '*, jogador:jogadores(nome, apelido)',
  order: [['periodo', true], ['minuto', true], ['id', true]],
  columns: [
    { key: 'minuto', label: 'Min', render: (r) => (r.minuto != null ? `${r.minuto}'` : '—') },
    { key: 'tipo', label: 'Lance', render: (r) => TIPOS_EVENTO[r.tipo] },
    { key: 'jogador', label: 'Jogador', render: (r) => r.jogador?.apelido || r.jogador?.nome },
  ],
  fields: [
    { name: 'jogador_id', label: 'Jogador', type: 'relation', required: true },
    { name: 'tipo', label: 'Lance', type: 'select', options: opcoes(TIPOS_EVENTO), required: true, default: 'gol' },
    { name: 'minuto', label: 'Minuto', type: 'number', min: 0, max: 120 },
    { name: 'periodo', label: 'Período', type: 'select', options: [['1', '1º tempo'], ['2', '2º tempo'], ['3', 'Prorrogação 1'], ['4', 'Prorrogação 2']] },
  ],
};
