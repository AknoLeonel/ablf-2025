import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { TRANSPARENCY_STATS } from '../constants'; // Puxando do "cérebro"
import { AlertCircle, ArrowUpRight } from 'lucide-react';

const Transparency = () => {
  return (
    <section id="transparencia" className="py-24 bg-ablf-dark relative overflow-hidden">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ablf-blue/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Gestão à Vista de Todos
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Acompanhe em tempo real a aplicação dos recursos. Na ABLF, cada centavo investido no esporte é monitorado e publicado.
          </p>
        </div>

        {/* Grid de Cards Inteligentes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRANSPARENCY_STATS.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-ablf-card/50 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl overflow-hidden hover:border-ablf-green/30 transition-all duration-300"
            >
              {/* Efeito de brilho no hover (Glow) */}
              <div className="absolute inset-0 bg-gradient-to-br from-ablf-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-gray-900/80 ${stat.color} border border-gray-800 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} />
                  </div>
                  <ArrowUpRight className="text-gray-600 group-hover:text-white transition-colors" />
                </div>

                <div className="text-5xl font-bold text-white mb-3 tracking-tight">
                  <span className="text-2xl text-gray-500 mr-1 font-medium align-top">{stat.prefix}</span>
                  <CountUp end={stat.value} duration={3} separator="." />
                  <span className="text-2xl text-gray-500 ml-1 font-medium">{stat.suffix}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-200 mb-1">{stat.label}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ablf-card border border-gray-800 text-sm text-gray-400">
            <AlertCircle size={16} className="text-ablf-yellow" />
            <span>Dados auditados e sincronizados em tempo real.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transparency;