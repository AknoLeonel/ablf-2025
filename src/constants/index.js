import { FileCheck, Coins, Activity, Trophy, Users, Gavel, TrendingUp } from 'lucide-react';

export const COMPANY_INFO = {
  name: "Associação Brasileira de Ligas de Futsal",
  acronym: "ABLF",
  whatsapp: "5511999999999", // Coloque o número real aqui
  instagram: "https://instagram.com/ablfoficial",
};

export const TRANSPARENCY_STATS = [
  { 
    label: "Valor Global", 
    value: 196000, 
    prefix: "R$ ", 
    suffix: "",
    icon: Coins, 
    color: "text-ablf-yellow",
    desc: "Recursos totais captados"
  },
  { 
    label: "Propostas Aprovadas", 
    value: 100, 
    prefix: "", 
    suffix: "%",
    icon: FileCheck, 
    color: "text-ablf-green",
    desc: "Eficiência na aprovação"
  },
  { 
    label: "Ligas Ativas", 
    value: 45, 
    prefix: "+", 
    suffix: "",
    icon: Trophy, 
    color: "text-blue-400",
    desc: "Fortalecendo o futsal"
  },
];

export const PARTNERS_LIST = [
  "Liga Paulista", "Federação RJ", "Copa Sul", "Liga Nordeste", 
  "Penalty", "Umbro", "Sicredi", "Governo Federal"
];

export const FEATURES_LIST = [
  {
    icon: Gavel,
    title: "Assessoria Jurídica",
    desc: "Suporte completo para regularização de ligas e estatutos."
  },
  {
    icon: Users,
    title: "Gestão Integrada",
    desc: "Plataforma digital para cadastro de atletas e súmulas."
  },
  {
    icon: Trophy,
    title: "Campeonatos Oficiais",
    desc: "Organização de competições nacionais padronizadas."
  },
  {
    icon: TrendingUp,
    title: "Captação de Recursos",
    desc: "Projetos incentivados para financiar o esporte."
  }
];

export const NEWS_POSTS = [
  {
    id: 1,
    category: "Campeonato Brasileiro",
    title: "Final da Liga Nacional será disputada em Brasília com casa cheia",
    date: "12 OUT 2025",
    image: "https://images.unsplash.com/photo-1518605348305-68913b54cb25?q=80&w=2000&auto=format&fit=crop", // Futsal atmosphere
    link: "#"
  },
  {
    id: 2,
    category: "Institucional",
    title: "ABLF fecha parceria histórica com gigante de material esportivo",
    date: "08 OUT 2025",
    image: "https://images.unsplash.com/photo-1628779238951-be2c9f256544?q=80&w=2000&auto=format&fit=crop", // Handshake/Business or Jersey
    link: "#"
  },
  {
    id: 3,
    category: "Regulamento",
    title: "Novas regras para a temporada 2026 são aprovadas em assembleia",
    date: "01 OUT 2025",
    image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2000&auto=format&fit=crop", // Tactical board or referee
    link: "#"
  }
];

export const INSTAGRAM_FEED = [
  { id: 1, img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop", likes: "1.2k" },
  { id: 2, img: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800&auto=format&fit=crop", likes: "856" },
  { id: 3, img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop", likes: "2.1k" },
  { id: 4, img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop", likes: "940" },
  { id: 5, img: "https://images.unsplash.com/photo-1599474924187-334a405be2ce?q=80&w=800&auto=format&fit=crop", likes: "1.5k" },
  { id: 6, img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop", likes: "3.2k" },
];