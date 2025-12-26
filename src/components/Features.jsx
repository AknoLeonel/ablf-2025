import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, Users, Trophy, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Gavel,
    title: "Assessoria Jurídica",
    desc: "Suporte completo para regularização de ligas, estatutos e pleitos esportivos."
  },
  {
    icon: Users,
    title: "Gestão Integrada",
    desc: "Plataforma digital para cadastro de atletas, súmulas online e tabelas automáticas."
  },
  {
    icon: Trophy,
    title: "Campeonatos Oficiais",
    desc: "Organização de competições nacionais com padronização e premiações reais."
  },
  {
    icon: TrendingUp,
    title: "Captação de Recursos",
    desc: "Projetos incentivados e parcerias com grandes marcas para financiar o esporte."
  }
];

const Features = () => {
  return (
    <section id="sobre" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Texto Explicativo */}
          <div className="lg:w-1/3">
            <span className="text-ablf-green font-bold tracking-wider uppercase text-sm">Por que a ABLF?</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-6">Elevando o nível do jogo fora das quatro linhas.</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Não somos apenas uma entidade administrativa. Somos uma aceleradora de ligas que fornece a tecnologia e o suporte jurídico que faltavam para o futsal amador se tornar profissional.
            </p>
            <button className="text-white border-b border-ablf-yellow pb-1 hover:text-ablf-yellow transition-colors">
              Conheça nossa história &rarr;
            </button>
          </div>

          {/* Grid de Benefícios (Bento Grid Style) */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 group"
              >
                <div className="w-12 h-12 bg-ablf-dark rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-gray-700">
                  <item.icon className="text-ablf-green" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;