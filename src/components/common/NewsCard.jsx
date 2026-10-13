import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { formatDataCurta } from '../../lib/format';

export default function NewsCard({ noticia }) {
  const interno = Boolean(noticia.conteudo);
  const classe = 'group block';
  const corpo = (
    <>
      <div className="relative h-56 overflow-hidden mb-4 border-b-4 border-ablf-green bg-gray-900">
        {noticia.imagem_url && (
          <img src={noticia.imagem_url} alt="" loading="lazy" decoding="async"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        )}
        {noticia.categoria && (
          <div className="absolute top-4 left-4 bg-ablf-yellow text-ablf-dark px-3 py-1 font-bold text-xs uppercase">{noticia.categoria}</div>
        )}
      </div>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 font-mono"><Calendar size={14} />{formatDataCurta(noticia.publicada_em)}</div>
      <h3 className="text-2xl font-display font-bold text-white leading-tight group-hover:text-ablf-green transition-colors uppercase">{noticia.titulo}</h3>
      {noticia.resumo && <p className="mt-2 text-sm text-gray-400 line-clamp-3">{noticia.resumo}</p>}
      {(interno || noticia.link_externo) && (
        <div className="mt-3 flex items-center gap-2 text-ablf-green font-bold text-sm uppercase">Ler matéria <ArrowRight size={16} /></div>
      )}
    </>
  );
  if (interno) return <Link to={`/noticias/${noticia.id}`} className={classe}>{corpo}</Link>;
  if (noticia.link_externo) return <a href={noticia.link_externo} target="_blank" rel="noopener noreferrer" className={classe}>{corpo}</a>;
  return <div className={classe}>{corpo}</div>;
}
