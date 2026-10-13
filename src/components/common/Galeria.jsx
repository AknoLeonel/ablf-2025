import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listFotos } from '../../lib/api';
import Lightbox from './Lightbox';

export default function Galeria({ jogoId, jogadorId, timeId, titulo = 'Fotos', mensagemVazio }) {
  const [aberta, setAberta] = useState(null);
  const { data: fotos } = useQuery({
    queryKey: ['fotos', { jogoId, jogadorId, timeId }],
    queryFn: () => listFotos({ jogoId, jogadorId, timeId }),
  });
  if (!fotos?.length) return mensagemVazio ? <p className="py-10 text-center text-gray-400">{mensagemVazio}</p> : null;

  return (
    <section className={titulo ? 'mt-12' : ''}>
      {titulo && <h2 className="text-white font-display text-3xl font-bold uppercase mb-4">{titulo}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {fotos.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setAberta(f)}
            className="aspect-square overflow-hidden bg-gray-900 group"
            aria-label={f.legenda ? `Ampliar foto: ${f.legenda}` : 'Ampliar foto'}
          >
            <img
              src={f.url}
              alt={f.legenda || ''}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </button>
        ))}
      </div>
      <Lightbox foto={aberta} onClose={() => setAberta(null)} />
    </section>
  );
}
