import { FileCheck, Coins, Activity, Trophy, Users, Gavel, TrendingUp } from 'lucide-react';

// IMPORTANDO AS IMAGENS LOCAIS (NOTÍCIAS)
import post1 from '../assets/post1.png';
import post2 from '../assets/post2.png';
import post3 from '../assets/post3.png';

// IMPORTANDO AS IMAGENS LOCAIS (INSTAGRAM)
// Certifique-se de renomear os arquivos na pasta assets para: instagram1.png, instagram2.png, etc.
import instagram1 from '../assets/instagram1.png';
import instagram2 from '../assets/instagram2.png';
import instagram3 from '../assets/instagram3.png';
import instagram4 from '../assets/instagram4.png';
import instagram5 from '../assets/instagram5.png';
import instagram6 from '../assets/instagram6.png';

export const COMPANY_INFO = {
  name: "Associação Brasileira de Ligas de Futsal",
  acronym: "ABLF",
  whatsapp: "5511999999999", 
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
    image: post1, 
    link: "#"
  },
  {
    id: 2,
    category: "Institucional",
    title: "ABLF fecha parceria histórica com gigante de material esportivo",
    date: "08 OUT 2025",
    image: post2, 
    link: "#"
  },
  {
    id: 3,
    category: "Regulamento",
    title: "Novas regras para a temporada 2026 são aprovadas em assembleia",
    date: "01 OUT 2025",
    image: post3, 
    link: "#"
  }
];

export const INSTAGRAM_FEED = [
  { id: 1, img: instagram1, likes: "1.2k" },
  { id: 2, img: instagram2, likes: "856" },
  { id: 3, img: instagram3, likes: "2.1k" },
  { id: 4, img: instagram4, likes: "940" },
  { id: 5, img: instagram5, likes: "1.5k" },
  { id: 6, img: instagram6, likes: "3.2k" },
];