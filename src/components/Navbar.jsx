import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoAblf from '../assets/logo.png';
import { whatsappLink } from '../constants';
import { isSupabaseConfigured } from '../lib/supabase';

// Com o banco configurado o menu ganha mais itens e só vira "horizontal" em telas xl;
// sem banco, é idêntico ao menu original (md).
const LAYOUT = isSupabaseConfigured
  ? {
      actions: 'xl:order-2',
      area: 'hidden xl:block',
      burger: 'xl:hidden',
      menu: 'w-full xl:flex xl:w-auto xl:order-1',
      list: 'xl:space-x-6 xl:flex-row xl:mt-0 xl:border-0 xl:bg-transparent xl:p-0',
      link: 'xl:hover:bg-transparent xl:hover:text-ablf-yellow xl:p-0',
      active: 'xl:bg-transparent xl:text-ablf-green xl:p-0',
      subtitle: 'xl:hidden',
    }
  : {
      actions: 'md:order-2',
      area: 'hidden md:block',
      burger: 'md:hidden',
      menu: 'w-full md:flex md:w-auto md:order-1',
      list: 'md:space-x-6 md:flex-row md:mt-0 md:border-0 md:bg-transparent md:p-0',
      link: 'md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0',
      active: 'md:bg-transparent md:text-ablf-green md:p-0',
      subtitle: 'md:hidden',
    };

const LINKS = [
  { to: '/', label: 'Início', end: true },
  ...(isSupabaseConfigured
    ? [
        { to: '/jogos', label: 'Jogos' },
        { to: '/tabela', label: 'Tabela' },
        { to: '/times', label: 'Times' },
        { to: '/destaques', label: 'Destaques' },
      ]
    : []),
  { to: '/#transparencia', label: 'Transparência', hash: true },
  { to: '/#sobre', label: 'A Associação', hash: true },
  { to: '/#noticias', label: 'Notícias', hash: true },
];

const base = 'block py-2 px-3 rounded transition-colors';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-ablf-dark/90 backdrop-blur-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">

        <Link to="/" onClick={close} className="flex items-center space-x-2.5 rtl:space-x-reverse group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src={logoAblf}
              alt="Logo ABLF"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(254,221,0,0.3)]"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xl font-display font-bold whitespace-nowrap text-white leading-none">ABLF</span>
            <span className={`text-[0.6rem] text-ablf-yellow tracking-widest uppercase font-medium leading-tight ${LAYOUT.subtitle} mt-0.5`}>
              Associação Brasileira <br /> de Ligas de Futsal
            </span>
          </div>
        </Link>

        <div className={`flex ${LAYOUT.actions} space-x-3 md:space-x-4 rtl:space-x-reverse items-center`}>
          {isSupabaseConfigured ? (
            <Link to="/admin" className={`${LAYOUT.area} text-white hover:text-ablf-yellow font-medium text-sm transition-colors`}>
              Área restrita
            </Link>
          ) : (
            <button type="button" className={`${LAYOUT.area} text-white hover:text-ablf-yellow font-medium text-sm transition-colors`}>
              Área do Filiado
            </button>
          )}

          <a
            href={whatsappLink('Olá! Quero filiar minha liga à ABLF.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ablf-blue bg-ablf-yellow hover:bg-white hover:text-ablf-blue font-bold rounded-lg text-sm px-4 py-2 text-center transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20"
          >
            Filiar-se
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
            aria-controls="menu-principal"
            className={`inline-flex items-center p-2 w-9 h-9 justify-center text-sm text-gray-400 rounded-lg ${LAYOUT.burger} hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ablf-yellow`}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div id="menu-principal" className={`${isOpen ? 'block' : 'hidden'} items-center justify-between ${LAYOUT.menu}`}>
          <ul className={`flex flex-col p-4 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-900/50 ${LAYOUT.list} text-sm`}>
            {LINKS.map((l) => (
              <li key={l.to}>
                {l.hash ? (
                  <Link to={l.to} onClick={close} className={`${base} text-gray-300 hover:bg-gray-700 ${LAYOUT.link}`}>
                    {l.label}
                  </Link>
                ) : (
                  <NavLink
                    to={l.to}
                    end={l.end}
                    onClick={close}
                    className={({ isActive }) =>
                      `${base} ${isActive ? `text-white bg-ablf-green font-bold ${LAYOUT.active}` : `text-gray-300 hover:bg-gray-700 ${LAYOUT.link}`}`
                    }
                  >
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
            {isSupabaseConfigured && (
              <li className={LAYOUT.burger}>
                <Link to="/admin" onClick={close} className={`${base} text-gray-300 hover:bg-gray-700`}>Área restrita</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
