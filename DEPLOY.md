# EDURA — Production Deployment Guide

Step-by-step from dev to live on a real domain. Estimated time: **45 minutes**.

---

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free tier works for the first 1-2 schools)
- [ ] Your Supabase project is **not paused** and on a **paid tier** if expecting traffic (free tier pauses after 1 week of inactivity)
- [ ] An Anthropic API key with billing enabled (optional — falls back to deterministic summary)
- [ ] (Optional) A custom domain you own

---

## Step 1 — Push to GitHub

```bash
cd "C:\Users\Hamada Salim G Trd\Desktop\edura"
git init
git add .
git commit -m "Initial commit — EDURA MVP"
```

**Critical:** check that `.env` is in `.gitignore` BEFORE pushing:

```bash
cat .gitignore | grep ".env"
```

You should see `.env` listed. If not, add it:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
git rm --cached .env 2>/dev/null
git add .gitignore
git commit -m "Ignore env files"
```

Then create a private repo on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/edura.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Connect Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your `edura` repo
3. Framework preset: **Next.js** (auto-detected)
4. Build command: leave default (`next build`)
5. **DO NOT click Deploy yet** — first set env vars (next step)

---

## Step 3 — Set environment variables in Vercel

In the Vercel project setup, expand **"Environment Variables"** and add **every** variable from your `.env`:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | from Supabase → Settings → Database → "Transaction" connection (port 6543) | URL-encode special chars in password |
| `DIRECT_URL` | from Supabase → Settings → Database → "Direct connection" (port 5432) | Used for migrations only |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fwaqyoatqfgyydqvmazk.supabase.co` | Your project ref |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Settings → API → anon key | Public-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Settings → API → service_role key | **Server only — never expose** |
| `CRON_SECRET` | generate fresh: `openssl rand -hex 32` | Different from dev! |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` from console.anthropic.com | Optional |

> **Don't reuse your dev `CRON_SECRET`.** Generate a new one for production.

Click **Deploy**.

---

## Step 4 — Set up the database

While Vercel is building, prepare your production database. Two options:

### Option A — Same Supabase project as dev (faster, but mixed data)
Skip to Step 5.

### Option B — Separate production Supabase project (recommended for real schools)
1. Create a new Supabase project (e.g., "edura-prod")
2. From your **prod** project, copy the new connection strings into Vercel env vars
3. Run migrations against prod:
   ```bash
   # Locally, with prod URLs in your env temporarily
   $env:DIRECT_URL="<prod-direct-url>"
   pnpm prisma migrate deploy
   ```

---

## Step 5 — Smoke test

Vercel gives you a URL like `edura-xxx.vercel.app`. Visit it:

- [ ] `/signup` — create a test director account
- [ ] `/app` — should show the dashboard with stat cards
- [ ] Click "Générer les données de démo" — seed should populate
- [ ] `/app/students` — students appear
- [ ] `/app/insights` — click "Recalculer maintenant"
- [ ] Download a PDF bulletin
- [ ] Invite a teacher via `/app/settings/team`

If any step fails, check Vercel → your project → **Logs** tab.

---

## Step 6 — Configure the cron

Vercel automatically picks up `vercel.json` and schedules `/api/cron/recompute-risk` for **01:00 UTC daily** (= 02:00 Algiers).

Verify in Vercel → your project → **Settings → Cron Jobs**. You should see one entry.

To test it manually:

```bash
curl https://your-app.vercel.app/api/cron/recompute-risk \
  -H "Authorization: Bearer <YOUR_PRODUCTION_CRON_SECRET>"
```

You should get JSON back with `ok: true`.

---

## Step 7 — Custom domain (optional)

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g., `app.edura.dz`)
3. Update DNS at your registrar:
   - Either add a `CNAME` record pointing to `cname.vercel-dns.com`
   - Or use the A records Vercel provides
4. SSL is automatic — wait 5–10 min for the certificate

---

## Step 8 — Hardening checklist (do before real schools sign up)

- [ ] **Disable signup if you want only invited schools.** In `app/(auth)/signup/page.tsx`, return `redirect("/login")` so only your sales process can onboard.
- [ ] **Apply Row-Level Security.** Open Supabase → SQL Editor, paste `prisma/rls.sql`, run. (Application-layer scoping is the primary defense; this is a safety net.)
- [ ] **Email confirmation.** In Supabase → Authentication → Providers → Email, turn ON "Confirm email" so signups must verify.
- [ ] **Rate limiting.** Vercel doesn't rate-limit by default. Add Upstash + `@upstash/ratelimit` on `/api/auth/setup-school` and `/api/students/import` if you expect abuse.
- [ ] **Monitor.** Sign up for Vercel's free Analytics + Sentry's free tier for error tracking.
- [ ] **Backup.** Supabase free tier: daily backups for 7 days. Pro tier: point-in-time recovery for 30 days. Upgrade before your first paying customer.

---

## Common deploy issues

| Error | Fix |
|---|---|
| `P1001: Can't reach database` | Check Supabase project isn't paused; verify `DIRECT_URL` is correct |
| `Tenant or user not found` | Wrong host in URL — must be `db.PROJECT_REF.supabase.co` for direct, `aws-X-region.pooler.supabase.com` for pooled |
| `Module not found: @prisma/client` | Add `prisma generate` to build command: change to `prisma generate && next build` |
| Functions timing out (10s default) | Edit Vercel → Settings → Functions → Max Duration → 60s for Pro plan |
| Cold starts > 5s | Hit `/api/health` (you'd need to create this) every 5 min via cron-job.org to keep functions warm |

---

## Post-deploy: invite your first 3 schools

1. Each director signs up at `your-domain.com/signup`
2. They get a 30-day trial (set up in `setup-school` route)
3. After trial, they pay 200,000 DZD/year (Phase 12 will add the upgrade flow)

You're live. Now go sell.
