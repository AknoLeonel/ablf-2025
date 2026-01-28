import React, { useState } from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ZoomIn, CheckCircle, Download, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';

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
          <div className="text-right mt-6 md:mt-0">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-ablf-green/30 rounded-full text-ablf-green text-sm font-bold mb-2">
                <CheckCircle size={14} />
                <span>Auditoria 2025 Aprovada</span>
             </div>
             <p className="text-gray-400 max-w-sm text-sm ml-auto">
               Dados oficiais atualizados em tempo real conforme Lei de Acesso à Informação.
             </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LADO ESQUERDO: Dados Específicos do Convênio e Editais */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            
            {/* Título do Projeto */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wide">
                Campeonato Brasileiro de Ligas 2025
              </h3>
              <div className="h-1 w-24 bg-ablf-green mt-2 rounded-full"></div>
            </motion.div>

            {/* Grid de Informações Financeiras (Convênio e Valor) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Convênio */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 border border-gray-700 bg-gray-900/50 rounded-xl relative overflow-hidden group hover:border-ablf-green/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <ShieldCheck size={20} className="text-ablf-green" />
                  <span className="text-sm font-bold uppercase tracking-wider">Número do Convênio</span>
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-white">
                  976691
                </div>
              </motion.div>

              {/* Card Valor */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 border border-gray-700 bg-gray-900/50 rounded-xl relative overflow-hidden group hover:border-ablf-green/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <DollarSign size={20} className="text-ablf-green" />
                  <span className="text-sm font-bold uppercase tracking-wider">Valor Total</span>
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-white flex items-baseline gap-2">
                  <span className="text-lg text-gray-500">R$</span>
                  <CountUp end={196000} duration={2.5} separator="." decimals={2} decimal="," />
                </div>
              </motion.div>
            </div>

            {/* Seção de Editais (Lista de Downloads) */}
            <div className="mt-4">
              <h4 className="text-gray-400 font-bold uppercase text-sm mb-4 tracking-wider flex items-center gap-2">
                <FileText size={16} /> Editais Disponíveis para Download
              </h4>
              
              <div className="space-y-4">
                {/* Edital 001 */}
                <motion.a 
                  href="https://drive.google.com/file/d/1UYr_NXL4x3zqdrycYcsAf12aMyBA4xb-/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-700 bg-gray-800/30 hover:bg-gray-800 rounded-lg group transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-3 md:mb-0">
                    <div className="text-ablf-green font-bold text-sm mb-1">EDITAL DE COTAÇÃO Nº 001/2026</div>
                    <div className="text-white font-medium">Contratação de Recursos Humanos</div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 group-hover:bg-ablf-green group-hover:text-black rounded transition-colors text-sm font-bold text-white">
                    <Download size={16} /> Baixar PDF
                  </div>
                </motion.a>

                {/* Edital 002 */}
                <motion.a 
                  href="https://drive.google.com/file/d/1hC3B1fdFV5YmBaf4r2i8j5JtFjEXZQc8/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-700 bg-gray-800/30 hover:bg-gray-800 rounded-lg group transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-3 md:mb-0">
                    <div className="text-ablf-green font-bold text-sm mb-1">EDITAL DE COTAÇÃO Nº 002/2026</div>
                    <div className="text-white font-medium">Aquisição de bens e prestação de serviços</div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 group-hover:bg-ablf-green group-hover:text-black rounded transition-colors text-sm font-bold text-white">
                    <Download size={16} /> Baixar PDF
                  </div>
                </motion.a>
              </div>
            </div>

          </div>

          {/* LADO DIREITO: O Documento Original (A Prova) - Mantido Visualmente */}
          <div className="lg:w-1/3">
             <motion.div 
               initial={{ x: 50, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               viewport={{ once: true }}
               className="h-full border border-gray-700 bg-gray-900 p-6 rounded-xl relative group flex flex-col"
             >
                <div className="flex items-center gap-2 mb-4 text-white font-bold uppercase text-sm tracking-wider">
                  <ExternalLink size={18} className="text-ablf-yellow" />
                  Visualização Prévia
                </div>
                
                {/* Container da Imagem com efeito de Zoom */}
                <div 
                  className="relative flex-grow min-h-[300px] w-full bg-black rounded-lg overflow-hidden cursor-pointer border border-gray-800 group-hover:border-ablf-yellow transition-colors"
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
                        <ZoomIn size={18} /> Ampliar Documento
                      </div>
                   </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span className="text-green-400 font-bold">● VIGENTE</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Origem</span>
                    <span className="text-gray-300">Plataforma +Brasil</span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 mt-2 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-colors"
                  >
                    Ver Imagem Ampliada
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