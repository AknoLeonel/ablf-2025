import React, { useState } from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FileText, X, ZoomIn, CheckCircle } from 'lucide-react';
import { TRANSPARENCY_STATS } from '../constants';

// Importe a imagem que você salvou (certifique-se que o nome do arquivo bate)
import docImage from '../assets/transparencia.jpeg'; 

const Transparency = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="transparencia" className="py-24 bg-ablf-card relative clip-diagonal">
      <div className="container mx-auto px-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-700 pb-8">
          <div>
            <h2 className="text-ablf-green font-display text-5xl md:text-7xl font-bold uppercase mb-2">
              Transparência <br /> <span className="text-white">Radical</span>
            </h2>
          </div>
          <div className="text-right">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-ablf-green/30 rounded-full text-ablf-green text-sm font-bold mb-2">
                <CheckCircle size={14} />
                <span>Auditoria 2025 Aprovada</span>
             </div>
             <p className="text-gray-400 max-w-sm text-sm">
               Dados oficiais atualizados em tempo real conforme Lei de Acesso à Informação.
             </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LADO ESQUERDO: Grid de Números */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRANSPARENCY_STATS.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden rounded-xl"
              >
                <div className="absolute -right-4 -bottom-6 text-8xl font-display font-bold text-white/5 group-hover:text-ablf-green/10 transition-colors">
                  {index + 1}
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between mb-6">
                    <stat.icon size={28} className={`${stat.color}`} />
                    <ArrowUpRight className="text-gray-600 group-hover:text-white" />
                  </div>
                  <div className="text-4xl font-display font-bold text-white mb-1">
                    <span className="text-lg text-gray-500 mr-1">{stat.prefix}</span>
                    <CountUp end={stat.value} duration={3} separator="." />
                    <span className="text-lg text-gray-500 ml-1">{stat.suffix}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wider">{stat.label}</h3>
                  <p className="text-xs text-gray-500 mt-2">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* LADO DIREITO: O Documento Original (A Prova) */}
          <div className="lg:w-1/3">
             <motion.div 
               initial={{ x: 50, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               viewport={{ once: true }}
               className="h-full border border-gray-700 bg-gray-900 p-6 rounded-xl relative group"
             >
                <div className="flex items-center gap-2 mb-4 text-white font-bold uppercase text-sm tracking-wider">
                  <FileText size={18} className="text-ablf-yellow" />
                  Documento Oficial
                </div>
                
                {/* Container da Imagem com efeito de Zoom */}
                <div 
                  className="relative h-64 w-full bg-black rounded-lg overflow-hidden cursor-pointer border border-gray-800 group-hover:border-ablf-yellow transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                   <img 
                      src={docImage} 
                      alt="Painel Transparência Oficial" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                   />
                   
                   {/* Overlay com botão de ampliar */}
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-ablf-yellow text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <ZoomIn size={18} /> Ampliar
                      </div>
                   </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span className="text-green-400 font-bold">● VIGENTE</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Referência</span>
                    <span className="text-gray-300">Painel SICONV/Plataforma +Brasil</span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 mt-2 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-colors"
                  >
                    Visualizar na Íntegra
                  </button>
                </div>
             </motion.div>
          </div>

        </div>
      </div>

      {/* MODAL (Lightbox) para ver a imagem grande */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white hover:text-ablf-yellow p-2">
              <X size={40} />
            </button>
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={docImage} 
              alt="Documento Original Ampliado"
              className="max-w-full max-h-[90vh] rounded shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()} // Clicar na imagem não fecha
            />
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Transparency;