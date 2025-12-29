import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoAblf from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // AJUSTE 1: Altura reduzida (py-3) para ficar mais fino
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-ablf-dark/90 backdrop-blur-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
        
        {/* ESQUERDA: Logo e Nome (Mais compactos) */}
        <a href="#" className="flex items-center space-x-2.5 rtl:space-x-reverse group">
          {/* AJUSTE 2: Logo menor (w-10 h-10) em vez de w-12 */}
          <div className="relative w-10 h-10 flex-shrink-0">
             <img 
               src={logoAblf} 
               alt="Logo ABLF" 
               className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(254,221,0,0.3)]" 
             />
          </div>
          
          <div className="flex flex-col justify-center">
            {/* Sigla um pouco menor (text-xl) */}
            <span className="text-xl font-display font-bold whitespace-nowrap text-white leading-none">
              ABLF
            </span>
            {/* AJUSTE 3: O nome grande agora SÓ aparece no celular (md:hidden) */}
            {/* Isso limpa o visual no computador, deixando só o logo e a sigla */}
            <span className="text-[0.6rem] text-ablf-yellow tracking-widest uppercase font-medium leading-tight md:hidden mt-0.5">
              Associação Brasileira <br /> de Ligas de Futsal
            </span>
          </div>
        </a>
        
        {/* DIREITA: Botões de Ação */}
        <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse items-center">
          <button type="button" className="hidden md:block text-white hover:text-ablf-yellow font-medium text-sm transition-colors">
            Área do Filiado
          </button>
          
          <button type="button" className="text-ablf-blue bg-ablf-yellow hover:bg-white hover:text-ablf-blue font-bold rounded-lg text-sm px-4 py-2 text-center transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20">
            Filiar-se
          </button>
          
          {/* Menu Hambúrguer (Mobile) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center p-2 w-9 h-9 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* CENTRO: Links de Navegação */}
        <div className={`${isOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-900/50 md:space-x-6 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent text-sm">
            <li>
              <a href="#" className="block py-2 px-3 text-white bg-ablf-green rounded md:bg-transparent md:text-ablf-green md:p-0 font-bold" aria-current="page">Início</a>
            </li>
            <li>
              <a href="#transparencia" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0 transition-colors">Transparência</a>
            </li>
            <li>
              <a href="#sobre" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0 transition-colors">A Associação</a>
            </li>
            <li>
              <a href="#noticias" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0 transition-colors">Notícias</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;