import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { listDocumentos } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container, QueryState } from '../components/common/ui';
import { Badge, Button, Chips } from '../components/ui';
import { CATEGORIAS_DOC, formatDataCurta, formatTamanho } from '../lib/format';

export default function DocumentosPage() {
  usePageTitle('Documentos oficiais', 'Regulamentos, editais, atas e demais documentos oficiais da ABLF.');
  const docs = useQuery({ queryKey: ['documentos'], queryFn: listDocumentos });
  const [categoria, setCategoria] = useState('todas');

  const chips = useMemo(() => {
    const presentes = [...new Set((docs.data ?? []).map((d) => d.categoria))];
    return [{ id: 'todas', label: 'Todos' }, ...presentes.map((c) => ({ id: c, label: CATEGORIAS_DOC[c] ?? c }))];
  }, [docs.data]);

  return (
    <>
      <PageHeader eyebrow="Transparência" title="Documentos" subtitle="Regulamentos, editais, atas e documentos oficiais para consulta e download." />
      <Container className="max-w-3xl">
        <QueryState query={docs} emptyText="Nenhum documento publicado ainda.">
          {(lista) => {
            const visiveis = lista.filter((d) => categoria === 'todas' || d.categoria === categoria);
            return (
              <>
                {chips.length > 2 && <div className="mb-5"><Chips items={chips} value={categoria} onChange={setCategoria} label="Categoria" /></div>}
                <ul className="space-y-3">
                  {visiveis.map((d) => (
                    <li key={d.id} className="flex items-center gap-4 p-4 rounded-2xl border border-ablf-line bg-ablf-surface">
                      <span className="hidden sm:flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-ablf-green/15 text-ablf-green" aria-hidden="true"><FileText size={24} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge tone="info">{CATEGORIAS_DOC[d.categoria] ?? d.categoria}</Badge>
                          {d.competicao && <span className="text-xs text-gray-400">{d.competicao.nome}</span>}
                        </div>
                        <h2 className="text-white font-bold leading-snug break-words">{d.titulo}</h2>
                        {d.descricao && <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{d.descricao}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDataCurta(d.publicado_em)}{d.tamanho_bytes ? ` · ${formatTamanho(d.tamanho_bytes)}` : ''}</p>
                      </div>
                      <Button as="a" href={d.arquivo_url} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" aria-label={`Baixar ${d.titulo}`}>
                        <Download size={16} /><span className="hidden sm:inline">Baixar</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            );
          }}
        </QueryState>
      </Container>
    </>
  );
}
