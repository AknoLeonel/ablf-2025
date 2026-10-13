import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

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

export default function Layout() {
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
