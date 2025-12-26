import { FileCheck, Coins, Activity, LayoutDashboard, ShieldCheck, Trophy } from 'lucide-react';

// Informações Gerais
export const COMPANY_INFO = {
  name: "Associação Brasileira de Ligas de Futsal",
  acronym: "ABLF",
  email: "contato@ablf.com.br",
  cnpj: "37.030.834/0001-50",
  address: "São Paulo - SP",
  instagram: "https://instagram.com/ablfoficial",
};

// Menu de Navegação
export const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#transparencia", label: "Transparência" },
  { href: "#ligas", label: "Ligas Filiadas" },
  { href: "#sobre", label: "A Associação" },
];

// Dados da Transparência (Atualize aqui e muda no site todo)
export const TRANSPARENCY_STATS = [
  { 
    label: "Valor Global", 
    value: 196000, 
    prefix: "R$ ", 
    suffix: "",
    icon: Coins, 
    color: "text-ablf-yellow",
    desc: "Recursos totais captados para fomento"
  },
  { 
    label: "Propostas Aprovadas", 
    value: 100, 
    prefix: "", 
    suffix: "%",
    icon: FileCheck, 
    color: "text-ablf-green",
    desc: "Eficiência total na aprovação de projetos"
  },
  { 
    label: "Ligas Ativas", 
    value: 45, // Exemplo
    prefix: "+", 
    suffix: "",
    icon: Trophy, 
    color: "text-blue-400",
    desc: "Ligas fortalecendo o futsal nacional"
  },
];