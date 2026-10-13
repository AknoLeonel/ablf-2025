# Banco de dados da ABLF (Supabase)

## 1. Criar o projeto
1. Crie um projeto em <https://supabase.com> (plano gratuito atende).
2. Em **SQL Editor**, cole e execute **em ordem** (cada arquivo inteiro, sem nada selecionado):
   1. `migrations/20261013000000_schema_inicial.sql`
   2. `migrations/20261013120000_correcoes_revisao.sql` (exclusão segura, integridade da súmula e histórico de alterações)
3. (Opcional) execute `demo_seed.sql` para ver o site com dados fictícios `[DEMO]`.
   O bloco de limpeza está no fim do arquivo.

## 2. Ligar o site ao banco
Em **Project Settings → API** copie a *Project URL* e a chave *anon public*
e crie um arquivo `.env.local` na raiz (veja `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Na hospedagem (Vercel/Netlify/etc.) cadastre as mesmas duas variáveis.
**Sem elas o site continua exatamente como era** – as páginas novas ficam
escondidas do menu.

> A chave `anon` é pública por natureza. Quem protege os dados são as regras RLS
> da migração (leitura pública, escrita só para administradores). **Nunca** coloque
> a chave `service_role` no site.

## 3. Criar o primeiro administrador
1. **Authentication → Users → Add user**: informe e-mail e senha (marque *Auto Confirm*).
2. No **SQL Editor**:
   ```sql
   insert into admins (user_id)
   select id from auth.users where email = 'seu@email.com';
   ```
3. Acesse `/admin` no site e entre com esse e-mail.

Recomendado: em **Authentication → Providers → Email** desative *Allow new users to sign up*,
para que só quem você criar consiga ter conta.

## O que existe no banco
| Tabela | Para quê |
|---|---|
| `ligas`, `competicoes`, `times`, `competicao_times` | cadastros e inscrição dos times em cada competição |
| `jogadores` | ficha técnica (posição, pé, altura, peso, número, foto, bio). Guarda só o **ano** de nascimento |
| `jogos` | calendário e placar (`agendado`, `ao_vivo`, `encerrado`, `adiado`, `cancelado`) |
| `eventos_jogo` | súmula: gol, gol contra, assistência, cartões (com minuto) |
| `escalacoes` | quem entrou em quadra (opcional; quem tem evento já conta como participante) |
| `fotos` | galeria ligada a jogo / jogador / time / competição |
| `noticias` | notícias da home e da página de notícias |
| `destaques` | "craque da rodada" e destaques escolhidos à mão |
| `admins` | quem pode editar |
| `auditoria` | histórico automático de tudo que foi criado/alterado/excluído (tela **Histórico** no painel) |

Calculado automaticamente (não precisa digitar): `v_classificacao`,
`v_estatisticas_jogador_competicao`, `v_estatisticas_jogador` — só jogos **encerrados** contam.

Fotos ficam no bucket público `midia` (JPG/PNG/WebP, até 5 MB; o painel já reduz e converte para WebP antes de enviar).
