// Sem VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY o site funciona como antes (só a home estática).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise;

// O SDK é carregado sob demanda para não pesar no primeiro carregamento da home.
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.reject(new Error('Supabase não configurado'));
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, anonKey),
  );
  return clientPromise;
}
