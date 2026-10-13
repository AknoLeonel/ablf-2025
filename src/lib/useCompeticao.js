import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listCompeticoes } from './api';

// Competição escolhida fica na URL (?c=3): dá para compartilhar o link da tabela/jogos.
export function useCompeticao() {
  const [params, setParams] = useSearchParams();
  const query = useQuery({ queryKey: ['competicoes'], queryFn: listCompeticoes });
  const competicoes = query.data;
  const escolhida = Number(params.get('c')) || null;
  const atual =
    competicoes?.find((c) => c.id === escolhida) ??
    competicoes?.find((c) => c.status === 'em_andamento') ??
    competicoes?.[0];

  const setAtual = (id) => {
    const next = new URLSearchParams(params);
    next.set('c', id);
    setParams(next, { replace: true });
  };

  return { query, competicoes, atual, setAtual };
}
