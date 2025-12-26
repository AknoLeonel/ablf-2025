import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  // Estilos base
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl transition-all duration-300 group";
  
  // Variantes de estilo (Verde Neon ou Transparente)
  const variants = {
    primary: "bg-ablf-green hover:bg-green-600 text-white shadow-lg shadow-ablf-green/20 hover:shadow-ablf-green/40 hover:-translate-y-1",
    outline: "bg-transparent border border-gray-700 hover:border-ablf-yellow text-white hover:bg-white/5",
    glow: "bg-gradient-to-r from-ablf-green to-ablf-yellow text-ablf-blue hover:opacity-90 shadow-[0_0_20px_rgba(0,155,58,0.5)]"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {Icon && (
        <Icon className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
      )}
    </motion.button>
  );
};

export default Button;