import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-ablf-dark/80 backdrop-blur-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ablf-green to-ablf-yellow flex items-center justify-center font-bold text-ablf-blue">ABLF</div>
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">ABLF</span>
        </a>
        <div className="flex md:order-2 space-x-3">
          <button className="text-ablf-dark bg-ablf-yellow hover:bg-yellow-400 font-medium rounded-lg text-sm px-4 py-2 transition-colors">Filiar-se</button>
          <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg md:hidden hover:bg-gray-700">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
        <div className={`${isOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg bg-ablf-card md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-transparent">
            <li><a href="#" className="block py-2 px-3 text-white bg-ablf-green rounded md:bg-transparent md:text-ablf-green md:p-0">Início</a></li>
            <li><a href="#transparencia" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-700 md:hover:bg-transparent md:hover:text-ablf-yellow md:p-0 transition-colors">Transparência</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;