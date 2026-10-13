import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Loading } from './components/common/ui';
import { isSupabaseConfigured } from './lib/supabase';

// Páginas que dependem do banco: carregadas sob demanda (a home continua leve).
const JogosPage = lazy(() => import('./pages/JogosPage'));
const JogoPage = lazy(() => import('./pages/JogoPage'));
const SumulaPage = lazy(() => import('./pages/SumulaPage'));
const TabelaPage = lazy(() => import('./pages/TabelaPage'));
const TimesPage = lazy(() => import('./pages/TimesPage'));
const TimePage = lazy(() => import('./pages/TimePage'));
const JogadorPage = lazy(() => import('./pages/JogadorPage'));
const DestaquesPage = lazy(() => import('./pages/DestaquesPage'));
const DocumentosPage = lazy(() => import('./pages/DocumentosPage'));
const FiliarPage = lazy(() => import('./pages/FiliarPage'));
const NoticiasPage = lazy(() => import('./pages/NoticiasPage'));
const NoticiaPage = lazy(() => import('./pages/NoticiaPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ablf-dark pt-32"><Loading /></div>}>
      <Routes>
        {isSupabaseConfigured && <Route path="admin/*" element={<AdminApp />} />}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {isSupabaseConfigured && (
            <>
              <Route path="jogos" element={<JogosPage />} />
              <Route path="jogos/:id" element={<JogoPage />} />
              <Route path="jogos/:id/sumula" element={<SumulaPage />} />
              <Route path="tabela" element={<TabelaPage />} />
              <Route path="times" element={<TimesPage />} />
              <Route path="times/:id" element={<TimePage />} />
              <Route path="jogadores/:id" element={<JogadorPage />} />
              <Route path="destaques" element={<DestaquesPage />} />
              <Route path="documentos" element={<DocumentosPage />} />
              <Route path="filiar" element={<FiliarPage />} />
              <Route path="noticias" element={<NoticiasPage />} />
              <Route path="noticias/:id" element={<NoticiaPage />} />
            </>
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
