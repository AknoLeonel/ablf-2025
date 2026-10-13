import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, FileText, Home, MessageCircle, ListOrdered, Lock, Menu, Newspaper, ShieldCheck, Star, Users, Landmark } from 'lucide-react';
import logoAblf from '../assets/logo.png';
import { Sheet } from './ui';
import { whatsappLink } from '../constants';

const PRINCIPAIS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/jogos', label: 'Jogos', icon: CalendarDays },
  { to: '/tabela', label: 'Tabela', icon: ListOrdered },
  { to: '/destaques', label: 'Destaques', icon: Star },
];

const MAIS = [
  { to: '/times', label: 'Times', icon: Users },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/noticias', label: 'Notícias', icon: Newspaper },
  { to: '/#transparencia', label: 'Transparência', icon: ShieldCheck },
  { to: '/#sobre', label: 'A Associação', icon: Landmark },
  { to: '/admin', label: 'Área restrita', icon: Lock },
];

// Desktop (lg+): menu horizontal. Celular: barra superior enxuta + barra inferior de navegação.
export default function AppNav() {
  const [maisAberto, setMaisAberto] = useState(false);

  const desktopLink = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-ablf-green font-bold' : 'text-gray-300 hover:text-ablf-yellow'}`;
  const tabLink = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 min-h-14 text-[0.68rem] font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-ablf-yellow' : 'text-gray-400'}`;

  return (
    <>
      <header className="no-print fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-ablf-dark/90 backdrop-blur-md">
        <div className="max-w-screen-xl flex items-center justify-between gap-4 mx-auto px-4 h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logoAblf} alt="" width="40" height="40" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(254,221,0,0.3)]" />
            <span className="flex flex-col leading-none">
              <span className="text-xl font-display font-bold text-white">ABLF</span>
              <span className="text-[0.6rem] text-ablf-yellow tracking-widest uppercase font-medium mt-0.5 xl:hidden">Ligas de Futsal</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden xl:flex items-center gap-6">
            {[...PRINCIPAIS, ...MAIS.slice(0, 3)].map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>{l.label}</NavLink>
            ))}
            <Link to="/#transparencia" className="text-sm font-medium text-gray-300 hover:text-ablf-yellow">Transparência</Link>
            <Link to="/#sobre" className="text-sm font-medium text-gray-300 hover:text-ablf-yellow">A Associação</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/admin" className="hidden xl:block text-sm font-medium text-gray-300 hover:text-ablf-yellow">Área restrita</Link>
            <Link to="/filiar" className="min-h-10 inline-flex items-center text-ablf-blue bg-ablf-yellow hover:bg-white font-bold rounded-lg text-sm px-4 shadow-lg shadow-yellow-500/20 transition-colors">
              Filiar-se
            </Link>
          </div>
        </div>
      </header>

      <nav aria-label="Navegação do aplicativo" className="no-print xl:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ablf-line bg-ablf-dark/95 backdrop-blur-md pb-safe">
        <div className="flex max-w-xl mx-auto">
          {PRINCIPAIS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={tabLink}>
              <Icon size={22} aria-hidden="true" />{label}
            </NavLink>
          ))}
          <button type="button" onClick={() => setMaisAberto(true)} aria-haspopup="dialog"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-14 text-[0.68rem] font-bold uppercase tracking-wide text-gray-400">
            <Menu size={22} aria-hidden="true" />Mais
          </button>
        </div>
      </nav>

      <Sheet open={maisAberto} onClose={() => setMaisAberto(false)} title="Mais">
        <ul className="grid grid-cols-2 gap-3">
          {MAIS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} onClick={() => setMaisAberto(false)}
                className="flex items-center gap-3 min-h-14 px-4 rounded-xl border border-ablf-line bg-ablf-surface text-white font-medium hover:border-ablf-green/60">
                <Icon size={20} className="text-ablf-yellow shrink-0" aria-hidden="true" />{label}
              </Link>
            </li>
          ))}
        </ul>
        <a href={whatsappLink('Olá, vim pelo site da ABLF')} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 min-h-14 px-4 rounded-xl border border-ablf-line bg-ablf-surface text-white font-medium hover:border-ablf-green/60">
          <MessageCircle size={20} className="text-green-400 shrink-0" aria-hidden="true" />Fale conosco no WhatsApp
        </a>
        <Link to="/filiar" onClick={() => setMaisAberto(false)}
          className="mt-4 flex items-center justify-center min-h-12 rounded-xl bg-ablf-yellow text-ablf-blue font-bold">
          Quero filiar minha liga
        </Link>
      </Sheet>
    </>
  );
}
