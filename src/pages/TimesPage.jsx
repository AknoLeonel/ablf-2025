import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listTimes } from '../lib/api';
import { PageHeader, Container, QueryState, Crest } from '../components/common/ui';
import { entityPath } from '../lib/format';

export default function TimesPage() {
  const times = useQuery({ queryKey: ['times'], queryFn: listTimes });
  return (
    <>
      <PageHeader eyebrow="Clubes" title="Times" subtitle="Todos os times que disputam as competições da ABLF." />
      <Container>
        <QueryState query={times} emptyText="Nenhum time cadastrado ainda.">
          {(lista) => (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lista.map((t) => (
                <Link
                  key={t.id}
                  to={entityPath('times', t.id, t.nome)}
                  className="flex flex-col items-center gap-3 p-6 bg-gray-900/60 border border-gray-800 rounded-xl text-center hover:border-ablf-green/60 transition-colors"
                >
                  <Crest src={t.escudo_url} nome={t.nome} size={80} />
                  <span className="font-display text-xl font-bold uppercase text-white">{t.nome}</span>
                  {(t.cidade || t.uf) && (
                    <span className="text-xs text-gray-500">{[t.cidade, t.uf].filter(Boolean).join(' / ')}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </QueryState>
      </Container>
    </>
  );
}
