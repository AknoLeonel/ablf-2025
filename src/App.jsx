import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoMarquee from './components/LogoMarquee';
import Features from './components/Features';
import NewsSection from './components/NewsSection'; // Novo
import Transparency from './components/Transparency';
import InstagramFeed from './components/InstagramFeed'; // Novo
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div className="min-h-screen bg-ablf-dark text-white selection:bg-ablf-yellow selection:text-ablf-dark overflow-x-hidden font-sans">
      <Navbar />
      <WhatsAppButton />
      <main>
        <Hero />
        <LogoMarquee />
        <NewsSection /> {/* Notícias logo após o impacto inicial */}
        <Features />
        <Transparency />
        <InstagramFeed /> {/* Finaliza com social antes do rodapé */}
      </main>
      <Footer />
    </div>
  );
}

export default App;