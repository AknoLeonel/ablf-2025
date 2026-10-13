import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { getNoticia } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Container, QueryState, BackLink } from '../components/common/ui';
import { formatDataCurta, parseEntityId } from '../lib/format';

export default function NoticiaPage() {
  const id = parseEntityId(useParams().id);
  const noticia = useQuery({ queryKey: ['noticia', id], queryFn: () => getNoticia(id), enabled: id != null });
  usePageTitle(noticia.data?.titulo ?? 'Notícia', noticia.data?.resumo ?? undefined);
  return (
    <div className="pt-24">
      <Container className="max-w-3xl">
        <BackLink to="/noticias">Todas as notícias</BackLink>
        <QueryState query={noticia} emptyText="Notícia não encontrada.">
          {(n) => (
            <article>
              {n.categoria && <span className="text-ablf-yellow font-display uppercase tracking-widest font-bold">{n.categoria}</span>}
              <h1 className="text-white font-display text-4xl md:text-6xl font-black italic uppercase leading-none mt-1">{n.titulo}</h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-4 font-mono">
                <Calendar size={14} /> {formatDataCurta(n.publicada_em)}
              </div>
              {n.imagem_url && <img src={n.imagem_url} alt="" className="w-full mt-8 rounded-xl border border-gray-800" />}
              <div className="mt-8 space-y-4 text-gray-300 leading-relaxed">
                {(n.conteudo ?? n.resumo ?? '').split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </article>
          )}
        </QueryState>
      </Container>
    </div>
  );
}
