import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { listProximosJogos, listUltimosResultados } from '../lib/api';
import { useJogosAoVivo } from '../lib/useJogosAoVivo';
import { isSupabaseConfigured } from '../lib/supabase';
import { Tabs, Skeleton } from './ui';
import { painelProps } from './ui/tabsProps';
import JogoCard from './common/JogoCard';

// Vitrine de jogos na home (ao vivo / próximos / resultados). Some se não há banco ou jogos.
export default function HomeJogos() {
  const aoVivo = useJogosAoVivo();
  const proximos = useQuery({ queryKey: ['proximos'], queryFn: () => listProximosJogos(8), enabled: isSupabaseConfigured });
  const resultados = useQuery({ queryKey: ['resultados'], queryFn: () => listUltimosResultados(8), enabled: isSupabaseConfigured });
  const [escolhida, setEscolhida] = useState(null);

  const listas = { aovivo: aoVivo.data ?? [], proximos: proximos.data ?? [], resultados: resultados.data ?? [] };
  const tabs = [
    listas.aovivo.length > 0 && { id: 'aovivo', label: 'Ao vivo', count: listas.aovivo.length },
    { id: 'proximos', label: 'Próximos', count: listas.proximos.length },
    { id: 'resultados', label: 'Resultados', count: listas.resultados.length },
  ].filter(Boolean);

  // aba inicial: ao vivo > próximos > resultados (até o usuário escolher uma)
  const inicial = listas.aovivo.length ? 'aovivo' : listas.proximos.length ? 'proximos' : 'resultados';
  const ativa = tabs.some((t) => t.id === escolhida) ? escolhida : inicial;

  const carregando = proximos.isPending || resultados.isPending;
  const tudoVazio = !carregando && !listas.aovivo.length && !listas.proximos.length && !listas.resultados.length;
  if (!isSupabaseConfigured || tudoVazio) return null;

  return (
    <section aria-labelledby="home-jogos" className="py-10 md:py-14 bg-ablf-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-2">
          <h2 id="home-jogos" className="text-white font-display text-4xl md:text-5xl font-black italic uppercase leading-none">
            Placar <span className="text-transparent bg-clip-text bg-gradient-to-r from-ablf-green to-ablf-yellow">ABLF</span>
          </h2>
          <Link to="/jogos" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-ablf-yellow group">
            Todos os jogos <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <Tabs tabs={tabs} value={ativa} onChange={setEscolhida} label="Jogos" />
        <div {...painelProps(tabs, ativa)} className="mt-5">
          {carregando ? (
            <div className="flex gap-3 overflow-hidden"><Skeleton className="h-44 w-[85%] shrink-0" /><Skeleton className="h-44 w-[85%] shrink-0" /></div>
          ) : listas[ativa].length === 0 ? (
            <p className="py-10 text-center text-gray-500">Nenhum jogo nesta lista.</p>
          ) : (
            <ul className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:grid md:grid-cols-2 xl:grid-cols-4 md:overflow-visible">
              {listas[ativa].map((j) => (
                <li key={j.id} className="shrink-0 w-[85%] sm:w-80 snap-start md:w-auto">
                  <JogoCard jogo={j} mostrarCompeticao className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link to="/jogos" className="sm:hidden mt-4 flex items-center justify-center min-h-11 rounded-lg border border-ablf-line text-sm font-bold uppercase tracking-wider text-gray-300">
          Todos os jogos
        </Link>
      </div>
    </section>
  );
}
