export const POSICOES = { goleiro: 'Goleiro', fixo: 'Fixo', ala: 'Ala', pivo: 'Pivô' };
export const PES = { direito: 'Direito', esquerdo: 'Esquerdo', ambidestro: 'Ambidestro' };
export const STATUS_JOGO = {
  agendado: 'Agendado',
  ao_vivo: 'Ao vivo',
  encerrado: 'Encerrado',
  adiado: 'Adiado',
  cancelado: 'Cancelado',
};
export const PERIODOS = { 1: '1º tempo', 2: '2º tempo', 3: 'Prorrogação', 4: '2ª prorrogação' };
export const CATEGORIAS_DOC = {
  regulamento: 'Regulamentos',
  edital: 'Editais',
  ata: 'Atas',
  estatuto: 'Estatuto',
  sumula: 'Súmulas',
  outro: 'Outros',
};
export const TIPOS_EVENTO = {
  gol: 'Gol',
  gol_contra: 'Gol contra',
  assistencia: 'Assistência',
  amarelo: 'Cartão amarelo',
  vermelho: 'Cartão vermelho',
  falta: 'Falta',
};

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export function formatDataCurta(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDataJogo(iso) {
  if (!iso) return 'Data a definir';
  const d = new Date(iso);
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia.replace('.', '')} · ${hora}`;
}

export function slugify(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// URLs no formato /jogadores/12-joao-silva (o número é o id; o resto é só para ficar legível).
export const entityPath = (base, id, nome) => `/${base}/${id}-${slugify(nome)}`.replace(/-$/, '');

export function parseEntityId(param) {
  const id = Number.parseInt(param ?? '', 10);
  return Number.isFinite(id) ? id : null;
}

export const nomeJogador = (j) => j?.apelido || j?.nome || '';

export const iniciais = (nome = '') =>
  nome
    .replace(/\[.*?\]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const media = (total, jogos) => (jogos ? (total / jogos).toFixed(2).replace('.', ',') : '–');

export const formatHora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

export function formatTamanho(bytes) {
  if (!bytes) return '';
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
