import { useCallback, useEffect, useState } from 'react';

// Cronômetro de jogo (relógio parável, como no futsal). Persiste no navegador por jogo,
// então recarregar a página ou trocar de tela não perde o tempo.
const chave = (jogoId) => `ablf-cronometro-${jogoId}`;

function ler(jogoId) {
  try {
    const bruto = JSON.parse(localStorage.getItem(chave(jogoId)) ?? 'null');
    if (bruto && typeof bruto.acumulado === 'number') return bruto;
  } catch { /* sem armazenamento: começa zerado */ }
  return { acumulado: 0, inicio: null };
}

function gravarNoNavegador(jogoId, estado) {
  try { localStorage.setItem(chave(jogoId), JSON.stringify(estado)); } catch { /* ignora */ }
}

// Chamado ao iniciar o jogo, antes de a tela do cronômetro existir.
export const iniciarCronometro = (jogoId) => gravarNoNavegador(jogoId, { acumulado: 0, inicio: Date.now() });

const decorrido = (e) => e.acumulado + (e.inicio ? Math.max(0, Date.now() - e.inicio) : 0);

export function useCronometro(jogoId) {
  const [estado, setEstado] = useState(() => ler(jogoId));
  const [, repintar] = useState(0);

  const gravar = useCallback((novo) => { setEstado(novo); gravarNoNavegador(jogoId, novo); }, [jogoId]);

  // Só repinta enquanto roda; ao voltar para a aba, atualiza na hora (o navegador pausa timers em segundo plano).
  useEffect(() => {
    if (!estado.inicio) return undefined;
    const t = setInterval(() => repintar((n) => n + 1), 500);
    const aoVoltar = () => repintar((n) => n + 1);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', aoVoltar); };
  }, [estado.inicio]);

  const ms = decorrido(estado); // (repintar força nova leitura; o valor real é sempre recalculado no clique)
  return {
    ms,
    rodando: Boolean(estado.inicio),
    texto: `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`,
    // Leituras/ações usam Date.now() no momento do clique: nenhuma fração de segundo se perde.
    minuto: () => Math.floor(decorrido(estado) / 60000) + 1, // 0:00–0:59 é o 1º minuto
    temTempo: () => decorrido(estado) > 0,
    iniciar: () => gravar({ acumulado: estado.acumulado, inicio: Date.now() }),
    pausar: () => gravar({ acumulado: decorrido(estado), inicio: null }),
    zerar: () => gravar({ acumulado: 0, inicio: null }),
  };
}
