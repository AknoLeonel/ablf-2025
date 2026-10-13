import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { uploadImagem } from './upload';

const input =
  'w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ablf-green disabled:opacity-50';

function RelationSelect({ field, value, onChange, options: fixas }) {
  const { table, select = 'id, nome', label = (r) => r.nome, order = 'nome' } = field.relation ?? {};
  const { data } = useQuery({
    queryKey: ['admin-opcoes', table, select],
    enabled: !fixas && Boolean(table),
    queryFn: async () => {
      const sb = await getSupabase();
      const { data, error } = await sb.from(table).select(select).order(order);
      if (error) throw error;
      return data.map((r) => ({ value: r.id, label: label(r) }));
    },
  });
  const opcoes = fixas ?? data ?? [];
  return (
    <select
      id={`f-${field.name}`}
      required={field.required}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className={input}
    >
      <option value="">{field.required ? 'Selecione…' : '— nenhum —'}</option>
      {opcoes.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ImageField({ field, value, onChange }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (file) => {
    if (!file) return;
    setBusy(true);
    setErro('');
    try {
      onChange(await uploadImagem(file, { folder: field.folder, maxSize: field.maxSize }));
    } catch (e) {
      setErro(e.message || 'Falha no envio.');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="w-16 h-16 object-cover rounded border border-gray-700 bg-gray-900" />
      ) : (
        <div className="w-16 h-16 rounded border border-dashed border-gray-700 flex items-center justify-center text-gray-600">
          <ImagePlus size={20} />
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <input ref={ref} id={`f-${field.name}`} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => enviar(e.target.files?.[0])} disabled={busy}
          className="text-gray-400 file:mr-3 file:rounded file:border-0 file:bg-gray-800 file:px-3 file:py-1.5 file:text-white hover:file:bg-gray-700" />
        {busy && <span className="flex items-center gap-1 text-gray-400"><Loader2 size={14} className="animate-spin" /> Enviando…</span>}
        {erro && <span role="alert" className="text-red-400">{erro}</span>}
        {value && !busy && (
          <button type="button" onClick={() => onChange('')} className="flex items-center gap-1 text-red-400 hover:text-red-300 self-start">
            <Trash2 size={14} /> Remover imagem
          </button>
        )}
      </div>
    </div>
  );
}

export default function FormField({ field, value, onChange, relationOptions }) {
  const id = `f-${field.name}`;
  let controle;
  switch (field.type) {
    case 'textarea':
      controle = <textarea id={id} rows={field.rows ?? 4} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
      break;
    case 'number':
      controle = <input id={id} type="number" step={field.step ?? 1} min={field.min} max={field.max} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
      break;
    case 'datetime':
      controle = <input id={id} type="datetime-local" required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
      break;
    case 'select':
      controle = (
        <select id={id} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input}>
          {!field.required && <option value="">— nenhum —</option>}
          {field.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
      break;
    case 'boolean':
      controle = (
        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="accent-green-500 w-4 h-4" />
          {field.checkLabel ?? 'Sim'}
        </label>
      );
      break;
    case 'relation':
      controle = <RelationSelect field={field} value={value} onChange={onChange} options={relationOptions?.[field.name]} />;
      break;
    case 'image':
      controle = <ImageField field={field} value={value} onChange={onChange} />;
      break;
    default:
      controle = <input id={id} type="text" required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
  }
  return (
    <div className={field.wide ? 'md:col-span-2' : ''}>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
        {field.label}{field.required && <span className="text-ablf-yellow"> *</span>}
      </label>
      {controle}
      {field.help && <p className="text-xs text-gray-600 mt-1">{field.help}</p>}
    </div>
  );
}
