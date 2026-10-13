import React, { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { ClipboardList, LogOut, Menu, X } from 'lucide-react';
import AuthProvider from './AuthProvider';
import { useAuth } from './authContext';
import ResourceManager from './ResourceManager';
import Sumula from './Sumula';
import { RESOURCES } from './resources';
import logoAblf from '../assets/logo.png';

const MENU = ['jogos', 'competicoes', 'inscricoes', 'times', 'jogadores', 'fotos', 'noticias', 'destaques', 'ligas', 'auditoria'];

function Login() {
  const { user, isAdmin, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  if (user && isAdmin) return <Navigate to="/admin" replace />;

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

  return (
    <div className="min-h-screen bg-ablf-dark flex items-center justify-center px-4">
      <form onSubmit={entrar} className="w-full max-w-sm p-8 bg-ablf-card border border-gray-800 rounded-2xl">
        <img src={logoAblf} alt="ABLF" className="w-14 h-14 object-contain mx-auto mb-4" />
        <h1 className="text-center font-display text-3xl font-black italic uppercase text-white mb-6">Painel ABLF</h1>
        {user && !isAdmin && (
          <div role="alert" className="mb-4 p-3 text-sm rounded-lg border border-yellow-800 bg-yellow-950/40 text-yellow-200">
            Esta conta ({user.email}) não tem permissão de administrador.{' '}
            <button type="button" onClick={signOut} className="underline">Sair</button>
          </div>
        )}
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-ablf-green" />
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1" htmlFor="senha">Senha</label>
        <input id="senha" type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-ablf-green" />
        {erro && <p role="alert" className="mb-4 text-sm text-red-300">{erro}</p>}
        <button type="submit" disabled={busy} className="w-full bg-ablf-yellow text-ablf-blue font-bold py-2.5 rounded-lg hover:bg-white disabled:opacity-50">
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-white mt-4">← Voltar ao site</Link>
      </form>
    </div>
  );
}

function Painel() {
  const { loading, user, isAdmin, signOut } = useAuth();
  const [aberto, setAberto] = useState(false);

  if (loading) return <div className="min-h-screen bg-ablf-dark text-gray-400 flex items-center justify-center">Carregando…</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const itemClasse = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-ablf-green text-white' : 'text-gray-300 hover:bg-gray-800'}`;

  return (
    <div className="min-h-screen bg-ablf-dark text-white md:flex">
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link to="/admin" className="font-display text-xl font-bold">Painel ABLF</Link>
        <button type="button" onClick={() => setAberto(!aberto)} aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto} className="p-2 text-gray-300">
          {aberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <aside className={`${aberto ? 'block' : 'hidden'} md:block md:w-60 md:min-h-screen shrink-0 border-r border-gray-800 bg-ablf-card p-4`}>
        <Link to="/admin" className="hidden md:flex items-center gap-2 mb-6">
          <img src={logoAblf} alt="" className="w-9 h-9 object-contain" />
          <span className="font-display text-xl font-bold">Painel ABLF</span>
        </Link>
        <nav aria-label="Painel" className="space-y-1">
          {MENU.map((k) => (
            <NavLink key={k} to={`/admin/${RESOURCES[k].path}`} onClick={() => setAberto(false)} className={itemClasse}>
              {RESOURCES[k].titulo}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-2">
          <p className="truncate">{user.email}</p>
          <Link to="/" className="block hover:text-white">Ver o site</Link>
          <button type="button" onClick={signOut} className="flex items-center gap-1 hover:text-white"><LogOut size={14} /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8">
        <Routes>
          <Route index element={<Navigate to="jogos" replace />} />
          <Route path="jogos/:id" element={<Sumula />} />
          {MENU.map((k) => {
            const r = RESOURCES[k];
            return (
              <Route
                key={k}
                path={r.path}
                element={
                  <div>
                    <h1 className="font-display text-4xl font-black italic uppercase mb-6">{r.titulo}</h1>
                    <ResourceManager
                      key={r.path}
                      resource={r}
                      rowActions={k === 'jogos' ? (row) => (
                        <Link to={`/admin/jogos/${row.id}`} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase text-ablf-green hover:text-white">
                          <ClipboardList size={14} /> Súmula
                        </Link>
                      ) : undefined}
                    />
                  </div>
                }
              />
            );
          })}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<Painel />} />
      </Routes>
    </AuthProvider>
  );
}
