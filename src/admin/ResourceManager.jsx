import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { fetchAll } from '../lib/api';
import { getSupabase } from '../lib/supabase';
import { Button, Sheet, Skeleton } from '../components/ui';
import FormField from './FormField';
import { mensagemErro } from './erros';

// Converte o valor do banco para o que o <input> espera e vice-versa.
const paraInputDatetime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

function valoresIniciais(fields, row, defaults) {
  const v = {};
  for (const f of fields) {
    let valor = row ? row[f.name] : defaults?.[f.name] ?? f.default;
    if (f.type === 'datetime') valor = paraInputDatetime(valor);
    v[f.name] = valor ?? (f.type === 'boolean' ? false : '');
  }
  return v;
}

function montarPayload(fields, valores, extras) {
  const payload = { ...extras };
  for (const f of fields) {
    const v = valores[f.name];
    if (f.type === 'boolean') payload[f.name] = Boolean(v);
    else if (v === '' || v == null) payload[f.name] = null;
    else if (f.type === 'number' || f.type === 'relation' || f.type === 'hidden') payload[f.name] = Number(v);
    else if (f.type === 'datetime') payload[f.name] = new Date(v).toISOString();
    else payload[f.name] = typeof v === 'string' ? v.trim() : v;
  }
  return payload;
}

const SEM_CAMPOS = [];
const POR_PAGINA = 50;
const chaveLinha = (row, pk) => pk.map((k) => row[k]).join(':');
const valorColuna = (c, row) => (c.render ? c.render(row) : row[c.key]);

/**
 * CRUD genérico sobre uma tabela do Supabase, descrito por `resource` (veja resources.js).
 * No celular: lista em cartões, formulário em folha, botão flutuante "Novo".
 * `filter` limita as linhas (ex.: { jogo_id: 3 }); `defaults` preenche novas linhas; `prepare` ajusta o payload.
 */
export default function ResourceManager({ resource, filter, defaults, prepare, relationOptions, hideFields = SEM_CAMPOS, rowActions, readOnly = false }) {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const pk = resource.pk ?? ['id'];
  const somenteLeitura = readOnly || resource.readOnly;
  const podeCriar = !somenteLeitura && resource.canCreate !== false;
  const podeEditar = !somenteLeitura && resource.canEdit !== false;
  const podeExcluir = !somenteLeitura && resource.canDelete !== false;
  const fields = useMemo(() => resource.fields.filter((f) => !hideFields.includes(f.name)), [resource, hideFields]);

  // /admin/jogadores?novo=1 (atalhos do painel) já abre o formulário
  const [editando, setEditando] = useState(() => (params.get('novo') && podeCriar ? 'novo' : null)); // null | 'novo' | row
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);
  const [erro, setErro] = useState('');

  const fecharForm = () => {
    setEditando(null);
    setErro('');
    if (params.get('novo')) { const p = new URLSearchParams(params); p.delete('novo'); setParams(p, { replace: true }); }
  };

  const lista = useQuery({
    queryKey: ['admin', resource.table, filter ?? null],
    // fetchAll busca em páginas: nada é cortado nas 1000 linhas do PostgREST
    queryFn: () =>
      fetchAll((sb) => {
        let q = sb.from(resource.table).select(resource.select ?? '*');
        for (const [col, val] of Object.entries(filter ?? {})) q = q.eq(col, val);
        for (const [col, asc] of resource.order ?? [['id', false]]) q = q.order(col, { ascending: asc });
        for (const k of pk) q = q.order(k); // desempate estável para a paginação
        return q;
      }),
  });

  const aposMutar = () => {
    qc.invalidateQueries(); // o painel muda dados que o site público também mostra
    setEditando(null);
    setExcluindo(null);
    setErro('');
    if (params.get('novo')) { const p = new URLSearchParams(params); p.delete('novo'); setParams(p, { replace: true }); }
  };
  const falhou = (e) => { setExcluindo(null); setErro(mensagemErro(e, 'Erro ao salvar.')); };
  const alvo = (row) => Object.fromEntries(pk.map((k) => [k, row[k]]));

  const salvar = useMutation({
    mutationFn: async ({ valores, row }) => {
      const sb = await getSupabase();
      let payload = montarPayload(fields, valores, defaults);
      if (prepare) payload = prepare(payload, valores);
      const { error } = row
        ? await sb.from(resource.table).update(payload).match(alvo(row))
        : await sb.from(resource.table).insert(payload);
      if (error) throw error;
    },
    onSuccess: aposMutar,
    onError: falhou,
  });

  const apagar = useMutation({
    mutationFn: async (row) => {
      const sb = await getSupabase();
      const { error } = await sb.from(resource.table).delete().match(alvo(row));
      if (error) throw error;
    },
    onSuccess: aposMutar,
    onError: falhou,
  });

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const todas = lista.data ?? [];
    if (!termo) return todas;
    return todas.filter((r) => resource.columns.some((c) => String(valorColuna(c, r) ?? '').toLowerCase().includes(termo)));
  }, [lista.data, busca, resource.columns]);

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const visiveis = linhas.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA);
  const [colTitulo, ...colResto] = resource.columns;

  const acoes = (row) => (
    <span className="inline-flex items-center gap-1">
      {rowActions?.(row)}
      {podeEditar && (
        <button type="button" onClick={() => { setErro(''); setEditando(row); }} aria-label="Editar" className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-300 hover:text-ablf-yellow hover:bg-white/5"><Pencil size={18} /></button>
      )}
      {podeExcluir && (
        <button type="button" onClick={() => setExcluindo(row)} aria-label="Excluir" className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-300 hover:text-red-400 hover:bg-white/5"><Trash2 size={18} /></button>
      )}
    </span>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="relative flex-1 sm:flex-none sm:w-72">
          <span className="sr-only">Buscar em {resource.titulo}</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input type="search" value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(0); }} placeholder="Buscar…"
            className="w-full min-h-12 pl-10 pr-3 rounded-xl bg-ablf-surface border border-ablf-line text-white placeholder-gray-500 focus:border-ablf-green focus:outline-none" />
        </label>
        {podeCriar && (
          <Button variant="success" onClick={() => { setErro(''); setEditando('novo'); }} className="hidden md:inline-flex ml-auto"><Plus size={18} />Novo</Button>
        )}
      </div>

      {erro && !editando && <div role="alert" className="mb-4 p-3 rounded-xl border border-red-900/60 bg-red-950/30 text-red-200 text-sm">{erro}</div>}

      {lista.isPending && <div className="space-y-3" role="status"><span className="sr-only">Carregando</span><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
      {lista.isError && <p role="alert" className="text-red-300 py-6">{lista.error.message}</p>}

      {lista.isSuccess && (
        <>
          {/* Celular: cartões */}
          <ul className="md:hidden space-y-3">
            {visiveis.length === 0 && <li className="py-10 text-center text-gray-400">Nenhum registro.</li>}
            {visiveis.map((row) => (
              <li key={chaveLinha(row, pk)} className="rounded-2xl border border-ablf-line bg-ablf-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 font-bold text-white break-words">{valorColuna(colTitulo, row) ?? <span className="text-gray-400">—</span>}</div>
                  <div className="shrink-0 -mr-2 -mt-2">{acoes(row)}</div>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  {colResto.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[0.68rem] uppercase tracking-wider text-gray-400">{c.label}</dt>
                      <dd className="text-gray-200 break-words">{valorColuna(c, row) ?? <span className="text-gray-400">—</span>}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: tabela */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-ablf-line">
            <table className="w-full text-sm">
              <thead className="bg-ablf-surface text-gray-400 uppercase text-xs tracking-wider">
                <tr>
                  {resource.columns.map((c) => <th key={c.key} scope="col" className="py-3 px-3 text-left">{c.label}</th>)}
                  <th scope="col" className="py-3 px-3 text-right"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 && <tr><td colSpan={resource.columns.length + 1} className="py-8 text-center text-gray-400">Nenhum registro.</td></tr>}
                {visiveis.map((row) => (
                  <tr key={chaveLinha(row, pk)} className="border-t border-ablf-line hover:bg-ablf-surface">
                    {resource.columns.map((c) => (
                      <td key={c.key} className="py-2 px-3 text-gray-200 align-middle">{valorColuna(c, row) ?? <span className="text-gray-400">—</span>}</td>
                    ))}
                    <td className="py-1 px-3 whitespace-nowrap text-right">{acoes(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {linhas.length > POR_PAGINA && (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-400">
              <span>{linhas.length} registros · página {paginaAtual + 1} de {totalPaginas}</span>
              <span className="inline-flex gap-2">
                <Button variant="secondary" size="sm" disabled={paginaAtual === 0} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button>
                <Button variant="secondary" size="sm" disabled={paginaAtual >= totalPaginas - 1} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button>
              </span>
            </div>
          )}
        </>
      )}

      {/* Botão flutuante "Novo" (celular) */}
      {podeCriar && (
        <button type="button" onClick={() => { setErro(''); setEditando('novo'); }} aria-label={`Novo registro em ${resource.titulo}`}
          className="md:hidden fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full bg-green-700 text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform">
          <Plus size={26} />
        </button>
      )}

      {editando && (
        <Formulario
          key={editando === 'novo' ? 'novo' : chaveLinha(editando, pk)}
          resource={resource} fields={fields} row={editando === 'novo' ? null : editando}
          defaults={defaults} relationOptions={relationOptions}
          erro={erro} salvando={salvar.isPending} onCancel={fecharForm}
          onSubmit={(valores) => salvar.mutate({ valores, row: editando === 'novo' ? null : editando })}
        />
      )}

      <Sheet open={Boolean(excluindo)} onClose={() => setExcluindo(null)} title={`Excluir de ${resource.titulo}?`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setExcluindo(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" disabled={apagar.isPending} onClick={() => apagar.mutate(excluindo)}>{apagar.isPending ? 'Excluindo…' : 'Excluir'}</Button>
          </div>
        }>
        <p className="text-gray-300">{resource.avisoExclusao ?? 'Isso não pode ser desfeito pelo painel (a ação fica apenas registrada no Histórico).'}</p>
        {excluindo && <p className="mt-3 p-3 rounded-xl bg-ablf-surface border border-ablf-line text-white font-medium">{valorColuna(colTitulo, excluindo)}</p>}
      </Sheet>
    </div>
  );
}

function Formulario({ resource, fields, row, defaults, relationOptions, erro, salvando, onCancel, onSubmit }) {
  const [valores, setValores] = useState(() => valoresIniciais(fields, row, defaults));
  const formId = `form-${resource.table}`;
  const resumo = row && resource.resumo ? resource.resumo(row) : null;
  const [erroLocal, setErroLocal] = useState('');
  return (
    <Sheet open onClose={onCancel} title={`${row ? 'Editar' : 'Novo'} ${resource.singular}`}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" form={formId} className="flex-1" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      }>
      <form id={formId} onSubmit={(e) => {
        e.preventDefault();
        const faltando = fields.find((f) => f.required && (f.type === 'file' || f.type === 'image') && !valores[f.name]);
        if (faltando) { setErroLocal(`Envie o arquivo em “${faltando.label}” antes de salvar.`); return; }
        setErroLocal('');
        onSubmit(valores);
      }}>
        {resumo && (
          <dl className="mb-5 p-3 rounded-xl bg-ablf-surface border border-ablf-line space-y-1.5 text-sm">
            {resumo.map(([k, v]) => <div key={k} className="flex gap-2"><dt className="text-gray-400 min-w-24">{k}</dt><dd className="text-gray-200 break-words">{v || '—'}</dd></div>)}
          </dl>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <FormField key={f.name} field={f} value={valores[f.name]} relationOptions={relationOptions}
              onChange={(v, extra) => setValores((s) => ({ ...s, [f.name]: v, ...extra }))} />
          ))}
        </div>
        {(erroLocal || erro) && <div role="alert" className="mt-4 p-3 rounded-xl border border-red-900/60 bg-red-950/30 text-red-200 text-sm">{erroLocal || erro}</div>}
      </form>
    </Sheet>
  );
}
