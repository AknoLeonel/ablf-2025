import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import Button from './ui/Button'; // Importando nosso novo botão
import { COMPANY_INFO } from '../constants'; // Importando os dados

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-ablf-dark">
      
      {/* --- EFEITOS DE FUNDO (TECH GRID) --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {/* Grid cibernético feito com CSS puro */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-ablf-green opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-ablf-blue opacity-20 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Lado Esquerdo: Texto */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-ablf-card border border-ablf-green/30 text-ablf-green text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Transparência e Gestão Profissional
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              O Futuro do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ablf-green via-ablf-yellow to-ablf-green bg-[length:200%_auto] animate-gradient">
                Futsal Brasileiro
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
              A {COMPANY_INFO.acronym} une tecnologia, integridade e paixão para transformar ligas amadoras em potências esportivas organizadas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button variant="primary" icon={ChevronRight}>
                Nossos Projetos
              </Button>
              <Button variant="outline" icon={ShieldCheck}>
                Portal da Transparência
              </Button>
            </div>
          </motion.div>

          {/* Lado Direito: Elemento Visual Abstrato (Bola/Escudo 3D) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 flex justify-center relative"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Círculos animados simulando tecnologia */}
              <div className="absolute inset-0 border-2 border-ablf-green/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 border-2 border-ablf-yellow/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-48 bg-gradient-to-br from-ablf-green to-ablf-blue rounded-full blur-3xl opacity-30 animate-pulse"></div>
                 {/* Aqui poderia entrar uma imagem 3D da bola ou logo depois */}
                 <div className="text-9xl font-bold text-white/5 select-none">ABLF</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;