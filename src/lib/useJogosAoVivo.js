import { useQuery } from '@tanstack/react-query';
import { listJogosAoVivo } from './api';

// Jogos em andamento; atualiza sozinho a cada 20 s enquanto a página está aberta.
export const useJogosAoVivo = () =>
  useQuery({ queryKey: ['ao-vivo'], queryFn: listJogosAoVivo, refetchInterval: 20_000, staleTime: 10_000 });
