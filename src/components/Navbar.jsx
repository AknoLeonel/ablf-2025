import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

// IMPORTANTE: O nome do arquivo aqui deve ser igual ao que você salvou na pasta assets
import logoAblf from '../assets/logo.png'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-ablf-dark/90 backdrop-blur-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        {/* Logo e Nome */}
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse group">
          {/* Container da Imagem */}
          <div className="relative w-12 h-12 flex items-center justify-center">
             <img 
               src={logoAblf} 
               alt="Logo ABLF" 
               className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(254,221,0,0.3)]" 
             />
          </div>
          
          <div className="flex flex-col">
            <span className="self-center text-2xl font-display font-bold whitespace-nowrap text-white leading-none">
              ABLF
            </span>
            <span className="text-[0.65rem] text-ablf-yellow tracking-widest uppercase font-medium">
              Associação Brasileira
            </span>
          </div>
        </a>
        
        {/* Botões Desktop */}
        <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse items-center">
          <button type="button" className="hidden md:block text-white hover:text-ablf-yellow font-medium text-sm transition-colors">
            Área do Filiado
          </button>
          <button type="button" className="text-ablf-blue bg-ablf-yellow hover:bg-white hover:text-ablf-blue focus:ring-4 focus:outline-none focus:ring-yellow-200 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20">
            Filiar-se
          </button>
          
          {/* Botão Mobile (Hambúrguer) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Links do Menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-gray-900/50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
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
              <a href="#redes" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0 transition-colors">Redes</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;