import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

const WhatsAppButton = () => {
  return (
    <motion.a
      href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Olá, vim pelo site da ABLF`}
      target="_blank"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors group"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
      <MessageCircle size={28} className="relative z-10" />
    </motion.a>
  );
};
export default WhatsAppButton;