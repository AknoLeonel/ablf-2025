import React from 'react';
import { PARTNERS_LIST } from '../constants';

const LogoMarquee = () => {
  return (
    <section className="py-10 bg-ablf-dark border-y border-gray-800 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-ablf-dark to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-ablf-dark to-transparent z-10"></div>
      
      <div className="flex w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...PARTNERS_LIST, ...PARTNERS_LIST].map((partner, index) => (
            <div key={index} className="mx-12 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-2xl font-bold text-gray-400 hover:text-ablf-green font-mono uppercase">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default LogoMarquee;