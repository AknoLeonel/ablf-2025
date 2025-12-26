import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoMarquee from './components/LogoMarquee';
import Features from './components/Features';
import Transparency from './components/Transparency';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div className="min-h-screen bg-ablf-dark text-white selection:bg-ablf-green selection:text-white overflow-x-hidden">
      <Navbar />
      <WhatsAppButton /> {/* Fica flutuando */}
      <main>
        {/* IMPORTANTE: Atualize seu Hero e Transparency para usarem os dados do constants também! */}
        <Hero />
        <LogoMarquee />
        <Features />
        <Transparency />
      </main>
      <Footer />
    </div>
  );
}

export default App;