import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { AuthContext } from './authContext';

// Sessão do Supabase Auth + checagem se o usuário está na tabela `admins`.
// (A segurança de verdade está nas regras RLS do banco; isto só decide o que mostrar.)
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false });

  useEffect(() => {
    let vivo = true;
    let cancelar = () => {};

    (async () => {
      const sb = await getSupabase();
      const carregar = async (session) => {
        const user = session?.user ?? null;
        let isAdmin = false;
        if (user) {
          const { data } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
          isAdmin = Boolean(data);
        }
        if (vivo) setState({ loading: false, user, isAdmin });
      };
      const { data } = await sb.auth.getSession();
      await carregar(data.session);
      const { data: sub } = sb.auth.onAuthStateChange((_evento, session) => {
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
