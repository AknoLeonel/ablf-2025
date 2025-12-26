import React from 'react';
import { motion } from 'framer-motion';
import { FEATURES_LIST } from '../constants';

const Features = () => {
  return (
    <section id="sobre" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Nossos Pilares</h2>
          <p className="text-gray-400">Como transformamos o futsal amador em profissional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_LIST.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-ablf-green/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-ablf-green transition-colors text-white">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;