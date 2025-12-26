import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { NEWS_POSTS } from '../constants';

const NewsSection = () => {
  return (
    <section className="py-24 bg-ablf-dark relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-ablf-card skew-x-[-12deg] translate-x-1/3 z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-ablf-yellow font-display uppercase tracking-widest text-lg font-bold">Últimas Atualizações</span>
            <h2 className="text-white font-display text-5xl md:text-6xl font-black uppercase mt-2 italic">
              Acontece na <span className="text-transparent bg-clip-text bg-gradient-to-r from-ablf-green to-ablf-yellow">Arena</span>
            </h2>
          </motion.div>
          
          <button className="hidden md:flex items-center gap-2 text-white hover:text-ablf-yellow transition-colors font-bold uppercase tracking-wider group">
            Ver todas as notícias <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid de Notícias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NEWS_POSTS.map((post, i) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group cursor-pointer"
            >
              {/* Imagem com Corte Diagonal e Zoom */}
              <div className="relative h-64 overflow-hidden mb-6 border-b-4 border-ablf-green clip-diagonal-reverse">
                <div className="absolute inset-0 bg-ablf-blue/30 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 bg-ablf-yellow text-ablf-dark px-3 py-1 font-bold text-xs uppercase skew-x-[-10deg]">
                  <span className="block skew-x-[10deg]">{post.category}</span>
                </div>
              </div>

              {/* Texto */}
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 font-mono">
                <Calendar size={14} />
                <span>{post.date}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white leading-tight group-hover:text-ablf-green transition-colors uppercase">
                {post.title}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-ablf-green font-bold text-sm uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Ler Matéria <ArrowRight size={16} />
              </div>
            </motion.article>
          ))}
        </div>

        {/* Botão Mobile */}
        <div className="mt-12 text-center md:hidden">
           <button className="px-8 py-4 border border-gray-600 text-white w-full font-bold uppercase hover:bg-white hover:text-ablf-dark transition-colors">Ver Mais</button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;