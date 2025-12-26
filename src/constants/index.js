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