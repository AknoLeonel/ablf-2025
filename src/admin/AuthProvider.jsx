import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { AuthContext } from './authContext';

// Sessão do Supabase Auth + checagem se o usuário está na tabela `admins`.
// (A segurança de verdade está nas regras RLS do banco; isto só decide o que mostrar.)
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false });
  const adminDe = useRef(null); // id do usuário já confirmado como admin
  const sequencia = useRef(0); // descarta respostas antigas que chegam fora de ordem

  useEffect(() => {
    let vivo = true;
    let cancelar = () => {};

    (async () => {
      const sb = await getSupabase();

      const carregar = async (session) => {
        const minha = ++sequencia.current;
        const user = session?.user ?? null;
        if (!user) {
          adminDe.current = null;
          if (vivo) setState({ loading: false, user: null, isAdmin: false });
          return;
        }
        // Já confirmado para este usuário (ex.: renovação de token): não consulta de novo.
        if (adminDe.current === user.id) {
          if (vivo && minha === sequencia.current) setState({ loading: false, user, isAdmin: true });
          return;
        }
        const { data, error } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
        if (!vivo || minha !== sequencia.current) return;
        if (error) {
          // Falha de rede/servidor NÃO é "não é admin": mantém o que já sabíamos e não derruba o painel.
          setState((s) => ({ loading: false, user, isAdmin: s.isAdmin && s.user?.id === user.id }));
          return;
        }
        adminDe.current = data ? user.id : null;
        setState({ loading: false, user, isAdmin: Boolean(data) });
      };

      const { data } = await sb.auth.getSession();
      await carregar(data.session);
      const { data: sub } = sb.auth.onAuthStateChange((evento, session) => {
        if (evento === 'INITIAL_SESSION') return; // já tratado acima
        // adia para fora do callback (o SDK não aceita chamadas ao Supabase aqui dentro)
        setTimeout(() => carregar(session), 0);
      });
      cancelar = () => sub.subscription.unsubscribe();
    })().catch(() => vivo && setState({ loading: false, user: null, isAdmin: false }));

    return () => {
      vivo = false;
      cancelar();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const sb = await getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const sb = await getSupabase();
    await sb.auth.signOut();
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
