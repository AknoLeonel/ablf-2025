import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { listTimes } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, QueryState, Crest } from '../components/common/ui';
import { entityPath, slugify } from '../lib/format';

export default function TimesPage() {
  usePageTitle('Times', 'Todos os times que disputam as competições da ABLF.');
  const times = useQuery({ queryKey: ['times'], queryFn: listTimes });
  const [busca, setBusca] = useState('');
  const termo = slugify(busca);
  const filtrados = useMemo(
    () => (times.data ?? []).filter((t) => !termo || slugify(`${t.nome} ${t.cidade ?? ''} ${t.uf ?? ''}`).includes(termo)),
    [times.data, termo],
  );

  return (
    <>
      <PageHeader eyebrow="Clubes" title="Times" subtitle="Todos os times que disputam as competições da ABLF." />
      <Container className="max-w-5xl">
        <QueryState query={times} emptyText="Nenhum time cadastrado ainda.">
          {(lista) => (
            <>
              {lista.length > 8 && (
                <label className="relative block mb-5">
                  <span className="sr-only">Buscar time ou cidade</span>
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar time ou cidade"
                    className="w-full min-h-12 pl-10 pr-4 rounded-xl bg-ablf-surface border border-ablf-line text-white placeholder-gray-500 focus:border-ablf-green focus:outline-none" />
                </label>
              )}
              {filtrados.length === 0 ? <p className="py-10 text-center text-gray-400">Nenhum time encontrado.</p> : (
                <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtrados.map((t) => (
                    <li key={t.id}>
                      <Link to={entityPath('times', t.id, t.nome)}
                        className="flex h-full flex-col items-center gap-3 p-5 rounded-2xl border border-ablf-line bg-ablf-surface text-center hover:border-ablf-green/60 active:bg-ablf-raised transition-colors">
                        <Crest src={t.escudo_url} nome={t.nome} size={72} />
                        <span className="font-display text-xl font-bold uppercase leading-tight text-white line-clamp-2">{t.nome}</span>
                        {(t.cidade || t.uf) && <span className="text-xs text-gray-400">{[t.cidade, t.uf].filter(Boolean).join(' / ')}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </QueryState>
      </Container>
    </>
  );
}
