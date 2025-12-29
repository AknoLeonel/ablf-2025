import { FileCheck, Coins, Activity, Trophy, Users, Gavel, TrendingUp } from 'lucide-react';

// IMPORTANDO AS IMAGENS LOCAIS (NOTÍCIAS)
// Certifique-se que post1.png, post2.png e post3.png estão na pasta src/assets/
import post1 from '../assets/post1.png';
import post2 from '../assets/post2.png';
import post3 from '../assets/post3.png';

// DICA PARA O INSTAGRAM:
// Quando tiver as fotos reais, salve como insta1.jpg, insta2.jpg etc.
// e importe elas aqui da mesma forma que fizemos com os posts acima.

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
    image: post1, // Usando a imagem local post1.png
    link: "#"
  },
  {
    id: 2,
    category: "Institucional",
    title: "ABLF fecha parceria histórica com gigante de material esportivo",
    date: "08 OUT 2025",
    image: post2, // Usando a imagem local post2.png
    link: "#"
  },
  {
    id: 3,
    category: "Regulamento",
    title: "Novas regras para a temporada 2026 são aprovadas em assembleia",
    date: "01 OUT 2025",
    image: post3, // Usando a imagem local post3.png
    link: "#"
  }
];

// Mantenha esses links provisórios até salvar as fotos reais do Instagram na pasta assets
export const INSTAGRAM_FEED = [
  { id: 1, img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop", likes: "1.2k" },
  { id: 2, img: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800&auto=format&fit=crop", likes: "856" },
  { id: 3, img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop", likes: "2.1k" },
  { id: 4, img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop", likes: "940" },
  { id: 5, img: "https://images.unsplash.com/photo-1599474924187-334a405be2ce?q=80&w=800&auto=format&fit=crop", likes: "1.5k" },
  { id: 6, img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop", likes: "3.2k" },
];