import React from 'react';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">ABLF</h2>
        <p className="text-gray-400 mb-6">Associação Brasileira de Ligas de Futsal</p>
        <div className="flex justify-center space-x-4 mb-8">
           <a href="mailto:contato@ablf.com.br" className="p-2 bg-gray-800 rounded-full hover:bg-ablf-yellow text-white"><Mail size={20} /></a>
        </div>
        <p className="text-gray-600 text-sm">&copy; 2025 ABLF - Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
export default Footer;