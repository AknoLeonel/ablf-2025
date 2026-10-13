import React, { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { CalendarDays, ClipboardList, Home, LogOut, Menu, Users } from 'lucide-react';
import AuthProvider from './AuthProvider';
import ToastProvider from './ToastProvider';
import { useAuth } from './authContext';
import Dashboard from './Dashboard';
import Mesa from './Mesa';
import ResourceManager from './ResourceManager';
import { RESOURCES } from './resources';
import { Button, Sheet } from '../components/ui';
import { usePageTitle } from '../lib/usePageTitle';
import logoAblf from '../assets/logo.png';

// Menu agrupado. `admin: true` = só administrador (mesário vê apenas Hoje e Jogos).
const GRUPOS = [
  { titulo: 'Operação', itens: [{ to: '/admin', rotulo: 'Hoje', end: true }, { to: '/admin/jogos', rotulo: 'Jogos' }] },
  { titulo: 'Cadastros', admin: true, itens: ['competicoes', 'inscricoes', 'times', 'jogadores', 'ligas'].map((k) => ({ to: `/admin/${RESOURCES[k].path}`, rotulo: RESOURCES[k].titulo })) },
  { titulo: 'Conteúdo', admin: true, itens: ['fotos', 'noticias', 'destaques', 'documentos'].map((k) => ({ to: `/admin/${RESOURCES[k].path}`, rotulo: RESOURCES[k].titulo })) },
  { titulo: 'Gestão', admin: true, itens: ['filiacoes', 'auditoria'].map((k) => ({ to: `/admin/${RESOURCES[k].path}`, rotulo: RESOURCES[k].titulo })) },
];
const RECURSOS_ADMIN = Object.values(RESOURCES).filter((r) => r.path !== 'jogos');

function Login() {
  usePageTitle('Entrar no painel');
  const { user, isEquipe, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  if (user && isEquipe) return <Navigate to="/admin" replace />;

  const entrar = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErro('');
    try {
      await signIn(email, senha);
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setBusy(false);
    }
  };
  const campo = 'w-full min-h-12 mb-4 bg-ablf-surface border border-ablf-line text-white rounded-xl px-4 focus:outline-none focus:border-ablf-green';

  return (
    <div className="min-h-dvh bg-ablf-dark flex items-center justify-center px-4">
      <form onSubmit={entrar} className="w-full max-w-sm p-6 sm:p-8 bg-ablf-card border border-ablf-line rounded-3xl">
        <img src={logoAblf} alt="ABLF" className="w-14 h-14 object-contain mx-auto mb-4" />
        <h1 className="text-center font-display text-3xl font-black italic uppercase text-white mb-6">Painel ABLF</h1>
        {user && !isEquipe && (
          <div role="alert" className="mb-4 p-3 text-sm rounded-xl border border-yellow-800 bg-yellow-950/40 text-yellow-200">
            Esta conta ({user.email}) não tem acesso ao painel.{' '}
            <button type="button" onClick={signOut} className="underline">Sair</button>
          </div>
        )}
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5" htmlFor="senha">Senha</label>
        <input id="senha" type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} className={campo} />
        {erro && <p role="alert" className="mb-4 text-sm text-red-300">{erro}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
        <Link to="/" className="block text-center text-sm text-gray-400 hover:text-white mt-4 min-h-10 leading-10">← Voltar ao site</Link>
      </form>
    </div>
  );
}

function Pagina({ recurso, readOnly }) {
  usePageTitle(`${recurso.titulo} – Painel`);
  const { isAdmin } = useAuth();
  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-4xl font-black italic uppercase text-white mb-5">{recurso.titulo}</h1>
      <ResourceManager
        key={recurso.path}
        resource={recurso}
        readOnly={readOnly || !isAdmin}
        rowActions={recurso.path === 'jogos' ? (row) => (
          <Link to={`/admin/jogos/${row.id}`} className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-ablf-green hover:bg-white/5">
            <ClipboardList size={16} />Mesa
          </Link>
        ) : undefined}
      />
    </div>
  );
}

function Painel() {
  const { loading, user, isEquipe, isAdmin, papel, erro, recarregar, signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  usePageTitle('Painel');

  if (loading) return <div className="min-h-dvh bg-ablf-dark text-gray-400 flex items-center justify-center" role="status">Carregando…</div>;
  if (erro) {
    return (
      <div className="min-h-dvh bg-ablf-dark text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p role="alert" className="max-w-sm">Não foi possível verificar seu acesso agora (conexão instável?).</p>
        <div className="flex gap-3"><Button onClick={recarregar}>Tentar de novo</Button><Button variant="secondary" onClick={signOut}>Sair</Button></div>
      </div>
    );
  }
  if (!user || !isEquipe) return <Navigate to="/admin/login" replace />;

  const grupos = GRUPOS.filter((g) => !g.admin || isAdmin);
  const itemClasse = ({ isActive }) =>
    `flex items-center min-h-11 px-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-700 text-white' : 'text-gray-300 hover:bg-white/5'}`;
  const lista = (aoClicar) => (
    <nav aria-label="Painel" className="space-y-5">
      {grupos.map((g) => (
        <div key={g.titulo}>
          <div className="px-3 mb-1 text-[0.68rem] font-bold uppercase tracking-widest text-gray-400">{g.titulo}</div>
          <div className="space-y-0.5">
            {g.itens.map((i) => <NavLink key={i.to} to={i.to} end={i.end} onClick={aoClicar} className={itemClasse}>{i.rotulo}</NavLink>)}
          </div>
        </div>
      ))}
    </nav>
  );
  const rodape = (
    <div className="pt-4 border-t border-ablf-line text-xs text-gray-400 space-y-1">
      <p className="truncate px-3">{user.email}</p>
      <Link to="/" className="flex items-center min-h-10 px-3 rounded-lg hover:text-white">Ver o site</Link>
      <button type="button" onClick={signOut} className="flex items-center gap-2 min-h-10 px-3 rounded-lg hover:text-white w-full"><LogOut size={14} /> Sair</button>
    </div>
  );
  const tab = ({ isActive }) => `flex flex-1 flex-col items-center justify-center gap-0.5 min-h-14 text-[0.68rem] font-bold uppercase tracking-wide ${isActive ? 'text-ablf-yellow' : 'text-gray-400'}`;

  return (
    <div className="min-h-dvh bg-ablf-dark text-white md:flex">
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-dvh shrink-0 border-r border-ablf-line bg-ablf-card p-4 sticky top-0 self-start max-h-dvh overflow-y-auto">
        <Link to="/admin" className="flex items-center gap-2 mb-6 px-1">
          <img src={logoAblf} alt="" className="w-9 h-9 object-contain" />
          <span className="font-display text-xl font-bold">Painel ABLF</span>
        </Link>
        <div className="flex-1">{lista()}</div>
        {rodape}
      </aside>

      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 h-14 border-b border-ablf-line bg-ablf-dark/95 backdrop-blur">
        <Link to="/admin" className="flex items-center gap-2"><img src={logoAblf} alt="" className="w-8 h-8 object-contain" /><span className="font-display text-lg font-bold">Painel ABLF</span></Link>
        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">{papel === 'admin' ? 'Admin' : 'Mesário'}</span>
      </header>

      <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="jogos" element={<Pagina recurso={RESOURCES.jogos} />} />
          <Route path="jogos/:id" element={<Mesa />} />
          {isAdmin && RECURSOS_ADMIN.map((r) => <Route key={r.path} path={r.path} element={<Pagina recurso={r} />} />)}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>

      <nav aria-label="Atalhos" className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ablf-line bg-ablf-dark/95 backdrop-blur pb-safe">
        <div className="flex">
          <NavLink to="/admin" end className={tab}><Home size={22} aria-hidden="true" />Hoje</NavLink>
          <NavLink to="/admin/jogos" className={tab}><CalendarDays size={22} aria-hidden="true" />Jogos</NavLink>
          {isAdmin && <NavLink to="/admin/jogadores" className={tab}><Users size={22} aria-hidden="true" />Jogadores</NavLink>}
          <button type="button" onClick={() => setMenu(true)} aria-haspopup="dialog" className="flex flex-1 flex-col items-center justify-center gap-0.5 min-h-14 text-[0.68rem] font-bold uppercase tracking-wide text-gray-400"><Menu size={22} aria-hidden="true" />Menu</button>
        </div>
      </nav>
      <Sheet open={menu} onClose={() => setMenu(false)} title="Menu">
        {lista(() => setMenu(false))}
        <div className="mt-6">{rodape}</div>
      </Sheet>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Painel />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
