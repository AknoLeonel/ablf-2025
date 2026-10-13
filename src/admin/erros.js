// Traduz erros comuns do Postgres/Supabase para algo que quem opera o painel entenda.
const CONHECIDOS = [
  [/jogos_placar_se_encerrado/, 'Para marcar o jogo como "Encerrado" informe o placar dos dois times.'],
  [/jogos_times_diferentes/, 'Mandante e visitante precisam ser times diferentes.'],
  [/violates foreign key constraint/, 'Este registro está em uso por outros dados (jogos, lances, fotos…). Remova ou altere esses vínculos primeiro.'],
  [/duplicate key value/, 'Já existe um registro igual a este.'],
  [/row-level security|permission denied/, 'Sem permissão para esta ação. Entre com uma conta de administrador.'],
  [/JWT expired/, 'Sua sessão expirou. Saia e entre novamente.'],
];

export function mensagemErro(e, padrao = 'Erro inesperado.') {
  const texto = e?.message || '';
  return CONHECIDOS.find(([re]) => re.test(texto))?.[1] ?? (texto || padrao);
}
