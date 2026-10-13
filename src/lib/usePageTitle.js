import { useEffect } from 'react';

const TITULO_PADRAO = document.title;
const DESCRICAO_PADRAO = document.querySelector('meta[name="description"]')?.content ?? '';

function meta(selector, attr, valor) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [k, v] = attr;
    el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute('content', valor);
}

// Título e descrição por página (Google executa JS; prévias de rede social ainda dependem de pré-renderização).
export function usePageTitle(titulo, descricao) {
  useEffect(() => {
    const completo = titulo ? `${titulo} | ABLF` : TITULO_PADRAO;
    const desc = descricao || DESCRICAO_PADRAO;
    document.title = completo;
    meta('meta[name="description"]', ['name', 'description'], desc);
    meta('meta[property="og:title"]', ['property', 'og:title'], completo);
    meta('meta[property="og:description"]', ['property', 'og:description'], desc);
    return () => {
      document.title = TITULO_PADRAO;
      meta('meta[name="description"]', ['name', 'description'], DESCRICAO_PADRAO);
    };
  }, [titulo, descricao]);
}
