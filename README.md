# ABLF – site oficial

Site da Associação Brasileira de Ligas de Futsal (React + Vite + Tailwind) com
sistema de jogos, tabelas, times, fichas de jogadores e destaques (Supabase).

## Rodar localmente
```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build
```

## Sem banco x com banco
- **Sem variáveis de ambiente** o site é só a página institucional (como era antes).
- **Com** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` ganha: Jogos, Tabela, Times,
  Ficha do jogador, Destaques, Notícias do banco e o painel em `/admin`.

Passo a passo de configuração: [`supabase/README.md`](supabase/README.md).
Variáveis disponíveis: [`.env.example`](.env.example).

## Estrutura
```
src/pages/        páginas públicas (jogos, tabela, times, jogador, destaques, notícias)
src/admin/        painel administrativo (login, CRUD, súmula, upload de fotos)
src/lib/          cliente Supabase, consultas (api.js) e formatações
src/components/   seções da home e componentes compartilhados
supabase/         migração SQL, seed de demonstração e README
```

## Hospedagem
Rotas como `/jogos/3` precisam que o servidor devolva `index.html` para qualquer caminho.
Já incluídos: `public/_redirects` (Netlify/Cloudflare Pages) e `vercel.json` (Vercel).
