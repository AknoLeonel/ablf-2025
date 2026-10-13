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

export function useCronometro(jogoId) {
  const [estado, setEstado] = useState(() => ler(jogoId));
  const [agora, setAgora] = useState(() => Date.now());

  const gravar = useCallback((novo) => {
    setEstado(novo);
    try { localStorage.setItem(chave(jogoId), JSON.stringify(novo)); } catch { /* ignora */ }
  }, [jogoId]);

  useEffect(() => {
    if (!estado.inicio) return undefined;
    const t = setInterval(() => setAgora(Date.now()), 500);
    return () => clearInterval(t);
  }, [estado.inicio]);

  const ms = estado.acumulado + (estado.inicio ? Math.max(0, agora - estado.inicio) : 0);
  const rodando = Boolean(estado.inicio);

  return {
    ms,
    rodando,
    minuto: Math.floor(ms / 60000) + 1, // minuto "em jogo": 0:00–0:59 é o 1º
    texto: `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`,
    iniciar: () => { setAgora(Date.now()); gravar({ acumulado: estado.acumulado, inicio: Date.now() }); },
    pausar: () => gravar({ acumulado: ms, inicio: null }),
    zerar: () => gravar({ acumulado: 0, inicio: null }),
    reiniciar: () => { setAgora(Date.now()); gravar({ acumulado: 0, inicio: Date.now() }); },
  };
}
