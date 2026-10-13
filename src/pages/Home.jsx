import React from 'react';
import Hero from '../components/Hero';
import LogoMarquee from '../components/LogoMarquee';
import Features from '../components/Features';
import NewsSection from '../components/NewsSection';
import HomeDestaques from '../components/HomeDestaques';
import HomeJogos from '../components/HomeJogos';
import Transparency from '../components/Transparency';
import InstagramFeed from '../components/InstagramFeed';

export default function Home() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <HomeJogos />
      <NewsSection />
      <HomeDestaques />
      <Features />
      <Transparency />
      <InstagramFeed />
    </>
  );
}
