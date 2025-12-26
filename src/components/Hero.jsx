import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col pt-20 bg-ablf-dark overflow-hidden">
      
      {/* Fundo Decorativo Gigante (Marca d'água) */}
      <div className="absolute top-0 right-0 text-[20rem] font-display font-bold text-white/5 leading-none select-none z-0 pointer-events-none">
        ABLF
      </div>

      <div className="container mx-auto px-4 flex-1 flex flex-col lg:flex-row items-center relative z-10">
        
        {/* Coluna de Texto */}
        <div className="lg:w-1/2 py-12 lg:py-0">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-ablf-yellow"></div>
              <span className="text-ablf-yellow font-bold tracking-widest uppercase text-sm">Oficial 2025</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-[0.9] mb-8 italic">
              O BRASIL <br />
              RESPIRA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ablf-yellow to-ablf-green">
                FUTSAL
              </span>
            </h1>

            <p className="text-gray-300 text-lg max-w-md mb-10 border-l-4 border-ablf-green pl-6 py-2">
              Unindo ligas, profissionalizando a gestão e levando o esporte a um novo patamar de transparência.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-ablf-yellow text-ablf-blue font-bold text-xl uppercase tracking-wider hover:bg-white transition-colors skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Filiar Minha Liga</span>
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-bold text-xl uppercase tracking-wider hover:bg-white hover:text-ablf-blue transition-colors skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Transparência</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Coluna Visual (Imagem Recortada) */}
        <div className="lg:w-1/2 w-full relative h-[500px] lg:h-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative w-full h-full"
          >
            {/* Círculo decorativo atrás */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-ablf-green to-ablf-blue rounded-full blur-3xl opacity-20"></div>
            
            {/* Imagem principal com shape agressivo */}
            <img 
              src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831&auto=format&fit=crop" 
              alt="Jogador de Futsal" 
              className="relative z-10 w-full h-full object-cover object-center mask-image-gradient"
              style={{ clipPath: 'polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)' }} // Corte diagonal na imagem
            />

            {/* Card Flutuante "Estatística" */}
            <div className="absolute bottom-10 left-0 bg-ablf-blue p-6 border-l-8 border-ablf-yellow shadow-2xl z-20 max-w-xs">
              <div className="flex items-center gap-4 mb-2">
                <Trophy className="text-ablf-yellow" size={32} />
                <span className="text-white font-bold text-4xl font-display">100%</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">De aprovação nos projetos submetidos.</p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Faixa de Rodapé do Hero (Marcas/Dados) */}
      <div className="absolute bottom-0 w-full bg-ablf-green/10 border-t border-white/10 backdrop-blur-sm py-4 z-20">
        <div className="container mx-auto px-4 flex justify-between items-center text-gray-400 text-sm font-mono">
           <span>SCROLL PARA EXPLORAR</span>
           <div className="h-px w-24 bg-gray-600 hidden md:block"></div>
           <span>GESTÃO 2025-2027</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;