import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AppNav from './AppNav';
import LiveBanner from './LiveBanner';
import { useJogosAoVivo } from '../lib/useJogosAoVivo';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { isSupabaseConfigured } from '../lib/supabase';

// Rotas novas começam no topo; links como /#transparencia rolam até a seção.
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function ComBanco() {
  const { data: aoVivo } = useJogosAoVivo();
  const temAoVivo = Boolean(aoVivo?.length);
  return (
    <div className="min-h-screen bg-ablf-dark text-white selection:bg-ablf-yellow selection:text-ablf-dark overflow-x-hidden font-sans has-bottom-nav">
      <ScrollToHash />
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ablf-yellow focus:text-ablf-blue focus:px-4 focus:py-2 focus:rounded">
        Pular para o conteúdo
      </a>
      <AppNav />
      <LiveBanner jogos={aoVivo} />
      <WhatsAppButton />
      <main id="conteudo" className={temAoVivo ? 'pt-9' : ''}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function SemBanco() {
  return (
    <div className="min-h-screen bg-ablf-dark text-white selection:bg-ablf-yellow selection:text-ablf-dark overflow-x-hidden font-sans">
      <ScrollToHash />
      <Navbar />
      <WhatsAppButton />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function Layout() {
  return isSupabaseConfigured ? <ComBanco /> : <SemBanco />;
}
