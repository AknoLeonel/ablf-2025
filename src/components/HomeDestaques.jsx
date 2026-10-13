import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { listCompeticoes, listRanking } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import RankingList from './common/RankingList';

// Vitrine na home. Some por completo se não há banco configurado ou ainda não há estatísticas.
export default function HomeDestaques() {
  const competicoes = useQuery({ queryKey: ['competicoes'], queryFn: listCompeticoes, enabled: isSupabaseConfigured });
  const atual = competicoes.data?.find((c) => c.status === 'em_andamento') ?? competicoes.data?.[0];
  const gols = useQuery({
    queryKey: ['ranking', atual?.id, 'gols-home'],
    queryFn: () => listRanking({ competicaoId: atual.id, campo: 'gols', limit: 3 }),
    enabled: Boolean(atual),
  });
  const assist = useQuery({
    queryKey: ['ranking', atual?.id, 'assist-home'],
    queryFn: () => listRanking({ competicaoId: atual.id, campo: 'assistencias', limit: 3 }),
    enabled: Boolean(atual),
  });

  if (!gols.data?.length && !assist.data?.length) return null;

  return (
    <section id="destaques" className="py-24 bg-ablf-dark border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-ablf-yellow font-display uppercase tracking-widest text-lg font-bold">{atual.nome}</span>
            <h2 className="text-white font-display text-5xl md:text-6xl font-black uppercase mt-2 italic">
              Em <span className="text-transparent bg-clip-text bg-gradient-to-r from-ablf-green to-ablf-yellow">Destaque</span>
            </h2>
          </div>
          <Link to={`/destaques?c=${atual.id}`} className="flex items-center gap-2 text-white hover:text-ablf-yellow transition-colors font-bold uppercase tracking-wider group mt-4 md:mt-0">
            Ver todos os destaques <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <RankingList titulo="Artilharia" itens={gols.data} campo="gols" unidade="gols" />
          <RankingList titulo="Garçons" itens={assist.data} campo="assistencias" unidade="assistências" />
        </div>
      </div>
    </section>
  );
}
