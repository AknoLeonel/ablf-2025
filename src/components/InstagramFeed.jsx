import React from 'react';
import { Instagram, Heart } from 'lucide-react';
import { INSTAGRAM_FEED, COMPANY_INFO } from '../constants';

const InstagramFeed = () => {
  return (
    <section className="py-20 bg-ablf-dark border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        {/* Cabeçalho do Feed */}
        <div className="flex items-center justify-center mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-1 mb-4 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-ablf-dark rounded-full flex items-center justify-center border-4 border-black">
                <Instagram className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase mb-2">
              Siga a <span className="text-ablf-yellow">@ABLFOficial</span>
            </h2>
            <p className="text-gray-400">Bastidores, gols e tudo o que rola nas ligas.</p>
          </div>
        </div>

        {/* Grid de Imagens (Simulação do Feed) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {INSTAGRAM_FEED.map((item, i) => (
            <a 
              key={item.id} 
              href={COMPANY_INFO.instagram} 
              target="_blank" 
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden bg-gray-900 block"
            >
              <img 
                src={item.img} 
                alt="Instagram Post" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay no Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                <Heart className="fill-white" size={20} />
                <span className="font-bold">{item.likes}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href={COMPANY_INFO.instagram}
            target="_blank"
            rel="noreferrer" 
            className="inline-block text-ablf-green hover:text-white font-bold uppercase tracking-wider text-sm transition-colors border-b border-ablf-green pb-1"
          >
            Ver perfil completo no Instagram &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;