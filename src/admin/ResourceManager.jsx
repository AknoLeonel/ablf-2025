import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
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
    else if (f.type === 'number' || f.type === 'relation') payload[f.name] = Number(v);
    else if (f.type === 'datetime') payload[f.name] = new Date(v).toISOString();
    else payload[f.name] = typeof v === 'string' ? v.trim() : v;
  }
  return payload;
}

const SEM_CAMPOS = [];

const chaveLinha = (row, pk) => pk.map((k) => row[k]).join(':');

/**
 * CRUD genérico sobre uma tabela do Supabase, descrito por `resource`
 * (veja resources.js). `filter` limita as linhas listadas (ex.: { jogo_id: 3 }),
 * `defaults` preenche campos de novas linhas e `prepare` ajusta o payload antes de salvar.
 */
export default function ResourceManager({ resource, filter, defaults, prepare, relationOptions, hideFields = SEM_CAMPOS, rowActions }) {
  const qc = useQueryClient();
  const pk = resource.pk ?? ['id'];
  const fields = useMemo(() => resource.fields.filter((f) => !hideFields.includes(f.name)), [resource, hideFields]);
  const [editando, setEditando] = useState(null); // null | 'novo' | row
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  const queryKey = ['admin', resource.table, filter ?? null];
  const lista = useQuery({
    queryKey,
    queryFn: async () => {
      const sb = await getSupabase();
      let q = sb.from(resource.table).select(resource.select ?? '*');
      for (const [col, val] of Object.entries(filter ?? {})) q = q.eq(col, val);
      for (const [col, asc] of resource.order ?? [['id', false]]) q = q.order(col, { ascending: asc });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const aposMutar = () => {
    qc.invalidateQueries(); // admin muda dados que o site público também mostra
    setEditando(null);
    setErro('');
  };
  const falhou = (e) => setErro(mensagemErro(e, 'Erro ao salvar.'));

  const salvar = useMutation({
    mutationFn: async ({ valores, row }) => {
      const sb = await getSupabase();
      let payload = montarPayload(fields, valores, defaults);
      if (prepare) payload = prepare(payload, valores);
      const { error } = row
        ? await sb.from(resource.table).update(payload).match(Object.fromEntries(pk.map((k) => [k, row[k]])))
        : await sb.from(resource.table).insert(payload);
      if (error) throw error;
    },
    onSuccess: aposMutar,
    onError: falhou,
  });

  const apagar = useMutation({
    mutationFn: async (row) => {
      const sb = await getSupabase();
      const { error } = await sb.from(resource.table).delete().match(Object.fromEntries(pk.map((k) => [k, row[k]])));
      if (error) throw error;
    },
    onSuccess: aposMutar,
    onError: falhou,
  });

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const todas = lista.data ?? [];
    if (!termo) return todas;
    return todas.filter((r) =>
      resource.columns.some((c) => String((c.render ? c.render(r) : r[c.key]) ?? '').toLowerCase().includes(termo)),
    );
  }, [lista.data, busca, resource.columns]);

  const podeEditar = resource.canEdit !== false;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar…"
          aria-label={`Buscar em ${resource.titulo}`}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-ablf-green"
        />
        <button
          type="button"
          onClick={() => { setErro(''); setEditando('novo'); }}
          className="inline-flex items-center gap-2 bg-ablf-green hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      {erro && <div role="alert" className="mb-4 p-3 rounded-lg border border-red-900/60 bg-red-950/30 text-red-200 text-sm">{erro}</div>}

      {editando && (
        <Formulario
          key={editando === 'novo' ? 'novo' : chaveLinha(editando, pk)}
          resource={resource}
          fields={fields}
          row={editando === 'novo' ? null : editando}
          defaults={defaults}
          relationOptions={relationOptions}
          salvando={salvar.isPending}
          onCancel={() => { setEditando(null); setErro(''); }}
          onSubmit={(valores) => salvar.mutate({ valores, row: editando === 'novo' ? null : editando })}
        />
      )}

      {lista.isPending && <p className="text-gray-500 py-6">Carregando…</p>}
      {lista.isError && <p role="alert" className="text-red-300 py-6">{lista.error.message}</p>}
      {lista.isSuccess && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                {resource.columns.map((c) => <th key={c.key} scope="col" className="py-3 px-3 text-left">{c.label}</th>)}
                <th scope="col" className="py-3 px-3 text-right"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr><td colSpan={resource.columns.length + 1} className="py-8 text-center text-gray-500">Nenhum registro.</td></tr>
              )}
              {linhas.map((row) => (
                <tr key={chaveLinha(row, pk)} className="border-t border-gray-800 hover:bg-gray-900/60">
                  {resource.columns.map((c) => (
                    <td key={c.key} className="py-2 px-3 text-gray-200 align-middle">
                      {c.render ? c.render(row) : row[c.key] ?? <span className="text-gray-600">—</span>}
                    </td>
                  ))}
                  <td className="py-2 px-3 whitespace-nowrap text-right">
                    <span className="inline-flex items-center gap-1">
                      {rowActions?.(row)}
                      {podeEditar && (
                        <button type="button" onClick={() => { setErro(''); setEditando(row); }} aria-label="Editar" className="p-2 text-gray-400 hover:text-ablf-yellow"><Pencil size={16} /></button>
                      )}
                      <button
                        type="button"
                        aria-label="Excluir"
                        disabled={apagar.isPending}
                        onClick={() => window.confirm(`Excluir este registro de ${resource.titulo}? Isso não pode ser desfeito.`) && apagar.mutate(row)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      ><Trash2 size={16} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Formulario({ resource, fields, row, defaults, relationOptions, salvando, onCancel, onSubmit }) {
  const [valores, setValores] = useState(() => valoresIniciais(fields, row, defaults));
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(valores); }}
      className="mb-6 p-5 bg-gray-900/70 border border-gray-700 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl font-bold uppercase text-white">
          {row ? 'Editar' : 'Novo'} {resource.singular}
        </h3>
        <button type="button" onClick={onCancel} aria-label="Cancelar" className="text-gray-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <FormField key={f.name} field={f} value={valores[f.name]} relationOptions={relationOptions}
            onChange={(v) => setValores((s) => ({ ...s, [f.name]: v }))} />
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={salvando} className="bg-ablf-yellow text-ablf-blue font-bold px-5 py-2 rounded-lg hover:bg-white disabled:opacity-50">
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white">Cancelar</button>
      </div>
    </form>
  );
}
