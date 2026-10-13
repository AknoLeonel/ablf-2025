import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { uploadDocumento, uploadImagem } from './upload';

const input =
  'w-full min-h-12 bg-ablf-surface border border-ablf-line text-white rounded-xl px-4 py-2 focus:outline-none focus:border-ablf-green disabled:opacity-50';

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

// Imagem (bucket "midia", reduzida e convertida para WebP) ou documento (bucket "documentos").
function ArquivoField({ field, value, onChange, documento }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (file) => {
    if (!file) return;
    setBusy(true);
    setErro('');
    try {
      if (documento) {
        const { url, size } = await uploadDocumento(file);
        onChange(url, field.sizeField ? { [field.sizeField]: size } : undefined);
      } else {
        onChange(await uploadImagem(file, { folder: field.folder, maxSize: field.maxSize }));
      }
    } catch (e) {
      setErro(e.message || 'Falha no envio.');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  const preview = documento ? (
    <div className="w-16 h-16 rounded-xl border border-ablf-line bg-ablf-surface flex items-center justify-center text-ablf-green"><FileText size={26} /></div>
  ) : value ? (
    <img src={value} alt="" className="w-16 h-16 object-cover rounded-xl border border-ablf-line bg-ablf-surface" />
  ) : (
    <div className="w-16 h-16 rounded-xl border border-dashed border-ablf-line flex items-center justify-center text-gray-400"><ImagePlus size={20} /></div>
  );

  return (
    <div className="flex items-center gap-3">
      {(documento ? value : true) && preview}
      <div className="flex flex-col gap-1 text-sm min-w-0">
        <input ref={ref} id={`f-${field.name}`} type="file" disabled={busy}
          accept={documento ? '.pdf,.doc,.docx,.xls,.xlsx' : 'image/jpeg,image/png,image/webp'}
          onChange={(e) => enviar(e.target.files?.[0])}
          className="text-gray-400 max-w-full file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-ablf-raised file:px-4 file:text-white hover:file:bg-ablf-line" />
        {documento && value && <a href={value} target="_blank" rel="noopener noreferrer" className="text-ablf-green hover:text-white truncate">Ver arquivo enviado</a>}
        {busy && <span className="flex items-center gap-1 text-gray-400"><Loader2 size={14} className="animate-spin" /> Enviando…</span>}
        {erro && <span role="alert" className="text-red-400">{erro}</span>}
        {value && !busy && (
          <button type="button" onClick={() => onChange('')} className="flex items-center gap-1 min-h-9 text-red-400 hover:text-red-300 self-start">
            <Trash2 size={14} /> Remover {documento ? 'arquivo' : 'imagem'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FormField({ field, value, onChange, relationOptions }) {
  if (field.type === 'hidden') return null;
  const id = `f-${field.name}`;
  let controle;
  switch (field.type) {
    case 'textarea':
      controle = <textarea id={id} rows={field.rows ?? 4} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} py-3`} />;
      break;
    case 'number':
      controle = <input id={id} type="number" inputMode={field.step ? 'decimal' : 'numeric'} step={field.step ?? 1} min={field.min} max={field.max} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
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
        <label className="inline-flex items-center gap-3 min-h-12 text-gray-200 cursor-pointer">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="accent-green-500 w-5 h-5" />
          {field.checkLabel ?? 'Sim'}
        </label>
      );
      break;
    case 'relation':
      controle = <RelationSelect field={field} value={value} onChange={onChange} options={relationOptions?.[field.name]} />;
      break;
    case 'image':
      controle = <ArquivoField field={field} value={value} onChange={onChange} />;
      break;
    case 'file':
      controle = <ArquivoField field={field} value={value} onChange={onChange} documento />;
      break;
    default:
      controle = <input id={id} type="text" required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />;
  }
  return (
    <div className={field.wide ? 'md:col-span-2' : ''}>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
        {field.label}{field.required && <span className="text-ablf-yellow" aria-hidden="true"> *</span>}
      </label>
      {controle}
      {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
    </div>
  );
}
