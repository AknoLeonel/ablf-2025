import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { TRANSPARENCY_STATS } from '../constants'; // Certifique-se de ter os dados lá

const Transparency = () => {
  return (
    <section id="transparencia" className="py-24 bg-ablf-card relative clip-diagonal">
      <div className="container mx-auto px-4">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-700 pb-8">
          <div>
            <h2 className="text-ablf-green font-display text-5xl md:text-7xl font-bold uppercase mb-2">
              Transparência <br /> <span className="text-white">Radical</span>
            </h2>
          </div>
          <p className="text-gray-400 max-w-sm text-right md:text-left mt-4 md:mt-0">
            Dados abertos e auditáveis. Porque a confiança é a base de qualquer grande time.
          </p>
        </div>

        {/* Grid Assimétrico */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TRANSPARENCY_STATS.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`p-8 border border-gray-700 hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden ${index === 1 ? 'md:mt-12' : ''}`} // O segundo card desce um pouco para quebrar o padrão
            >
              {/* Número Gigante no Fundo */}
              <div className="absolute -right-4 -bottom-8 text-9xl font-display font-bold text-white/5 group-hover:text-ablf-green/10 transition-colors">
                {index + 1}
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <stat.icon size={32} className={`${stat.color}`} />
                  <ArrowUpRight className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                
                <div className="text-5xl font-display font-bold text-white mb-2">
                  <span className="text-2xl text-gray-500 mr-1">{stat.prefix}</span>
                  <CountUp end={stat.value} duration={3} separator="." />
                  <span className="text-2xl text-gray-500 ml-1">{stat.suffix}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-200 uppercase tracking-wider mb-2">{stat.label}</h3>
                <div className="h-1 w-12 bg-gray-700 group-hover:bg-ablf-yellow transition-colors mb-4"></div>
                <p className="text-sm text-gray-400">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Transparency;