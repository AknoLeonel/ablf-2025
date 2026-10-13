// Traduz erros comuns do Postgres/Supabase para algo que quem opera o painel entenda.
const CONHECIDOS = [
  [/time_do_jogo: o time deve ser/, 'O time do lance precisa ser um dos dois times deste jogo.'],
  [/time_do_jogo: este jogo já tem/, 'Este jogo já tem lances ou escalação de um time que sairia da partida. Apague esses lances antes de trocar os times.'],
  [/violates foreign key constraint "jogos_competicao_id_fkey"/, 'Esta competição ainda tem jogos. Apague (ou mova) os jogos antes de excluir a competição.'],
  [/violates foreign key constraint "(eventos_jogo|escalacoes)_jogador_id_fkey"/, 'Este jogador tem lances ou escalações em jogos. Para preservar o histórico, desmarque "Ativo" em vez de excluir.'],
  [/jogos_placar_se_encerrado/, 'Para marcar o jogo como "Encerrado" informe o placar dos dois times.'],
  [/jogos_times_diferentes/, 'Mandante e visitante precisam ser times diferentes.'],
  [/violates foreign key constraint/, 'Este registro está em uso por outros dados (jogos, lances, fotos…). Remova ou altere esses vínculos primeiro.'],
  [/duplicate key value/, 'Já existe um registro igual a este.'],
  [/sumula_fechada/, 'A súmula está fechada. Só um administrador pode alterá-la ou reabri-la.'],
  [/permissao: o mesário/, 'Seu perfil (mesário) só pode alterar placar, lances, escalação e dados da súmula.'],
  [/jogos_fechada_so_encerrado/, 'Só um jogo encerrado pode ter a súmula fechada. Reabra a súmula antes de mudar o status.'],
  [/limite_filiacao/, 'Muitos pedidos recentes. Tente novamente mais tarde.'],
  [/row-level security|permission denied/, 'Sem permissão para esta ação com o seu perfil.'],
  [/JWT expired/, 'Sua sessão expirou. Saia e entre novamente.'],
];

export function mensagemErro(e, padrao = 'Erro inesperado.') {
  const texto = e?.message || '';
  return CONHECIDOS.find(([re]) => re.test(texto))?.[1] ?? (texto || padrao);
}
