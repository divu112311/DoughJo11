# DoughJo: your AI money sensei 🥋

**An AI personal-finance coach that connects to your real bank accounts and turns money skills into a game.** Built for the **Bolt Hackathon**.

Most people don't avoid budgeting because it's hard. They avoid it because it's boring and generic advice doesn't fit their life. DoughJo connects to your actual accounts through Plaid. An AI "Sensei" then coaches you based on your real spending and goals, and you level up from White Belt to Grand Master as you build better habits.

## What it does

- **🏦 Connect your bank (Plaid).** Securely link checking, savings and credit accounts with Plaid Link. Balances refresh automatically, and webhooks keep data in sync.
- **🤖 AI Sensei chat.** A conversational coach that knows your accounts, goals and chat history. It answers questions like "Can I afford this trip?" with advice tailored to you.
- **📊 Financial health dashboard.** Spending analysis, a financial health view and AI-generated insights on where your money goes.
- **🎯 Goals.** Set savings goals and track progress visually.
- **📚 AI learning path.** Personalized lessons, quizzes and daily practice generated from your situation.
- **🎮 Gamified progress.** Earn XP, unlock badges and climb the belt ranks as you learn and hit milestones.
- **🔐 Security first.** Supabase auth with Google sign-in, session timeouts and security warnings. Bank tokens are handled server-side, never in the browser.

## How it works

```
React app ──► Supabase Auth (email / Google)
    │
    ├──► Edge function: plaid-create-link-token ──► Plaid Link (user connects bank)
    ├──► Edge function: plaid-exchange-token     ──► stores access token server-side
    ├──► Edge function: plaid-refresh-accounts   ──► balances & accounts
    ├──◄ Edge function: plaid-webhook            ◄── Plaid pushes account updates
    │
    └──► Edge function: chat-ai ──► LLM (via OpenRouter) with the user's financial context
                │
                ▼
         Supabase Postgres: profiles, goals, XP, chat history, accounts
```

All secrets (Plaid and AI keys) live in Supabase edge-function secrets. The browser only ever sees the public Supabase anon key, and data is protected by row-level security.

## Tech stack

| Layer | Tools |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Banking** | Plaid (Link, Auth/Balance, webhooks) |
| **AI** | LLM via OpenRouter (OpenAI-compatible), called from a Supabase edge function |
| **Backend** | Supabase (Postgres, Auth with Google OAuth, Edge Functions in Deno) |

## Running locally

```bash
npm install
cp .env.example .env   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Set server-side secrets for the edge functions with the Supabase CLI. Never put them in the frontend.

```bash
supabase secrets set OPENROUTER_API_KEY=... PLAID_CLIENT_ID=... PLAID_SECRET=... PLAID_ENV=sandbox
supabase functions deploy chat-ai
supabase functions deploy plaid-create-link-token
supabase functions deploy plaid-exchange-token
supabase functions deploy plaid-refresh-accounts
supabase functions deploy plaid-webhook
```

In Plaid's **sandbox**, you can sign in to any test bank with `user_good` / `pass_good`.

Detailed setup notes are in the repo: [Plaid sandbox setup](PLAID_SANDBOX_SETUP.md), [edge functions](EDGE_FUNCTION_SETUP.md), [Google OAuth](GOOGLE_OAUTH_SETUP.md) and [deployment](DEPLOYMENT_GUIDE.md).

## Repository structure

```
src/components/          dashboard, chat, bank accounts, goals, learning center, onboarding
src/hooks/               auth, chat, goals, profile, session security
supabase/functions/      chat-ai and plaid-* edge functions
supabase/migrations/     database schema
```

## The belt system

White → Yellow → Green → Blue → Brown → Black Belt → Master → Grand Master. Every lesson, goal and good money decision earns XP toward the next belt.

---

Built by **Divya Mahajan** · [Website](https://divu112311.github.io) · [LinkedIn](https://www.linkedin.com/in/divyamahajan11)
