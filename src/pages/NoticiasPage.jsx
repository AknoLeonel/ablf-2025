import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listNoticias } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, QueryState } from '../components/common/ui';
import NewsCard from '../components/common/NewsCard';

export default function NoticiasPage() {
  usePageTitle('Notícias', 'Últimas notícias da ABLF e das ligas de futsal do Brasil.');
  const noticias = useQuery({ queryKey: ['noticias'], queryFn: () => listNoticias() });
  return (
    <>
      <PageHeader eyebrow="Últimas atualizações" title="Notícias" />
      <Container>
        <QueryState query={noticias} emptyText="Nenhuma notícia publicada ainda.">
          {(lista) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lista.map((n) => <NewsCard key={n.id} noticia={n} />)}
            </div>
          )}
        </QueryState>
      </Container>
    </>
  );
}
