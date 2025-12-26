import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features'; // Nova importação
import Transparency from './components/Transparency';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-ablf-dark text-white selection:bg-ablf-green selection:text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features /> {/* Adicionado logo após o Hero */}
        <Transparency />
      </main>
      <Footer />
    </div>
  );
}

export default App;