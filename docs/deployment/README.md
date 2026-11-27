# UniArena — Deployment Guide

## Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **New Project**
3. Import the `NyangabiDerrick/UniArena` GitHub repo
4. Set **Root Directory** to `frontend`
5. Add all environment variables from `frontend/.env.production.example`
6. Click **Deploy**

Your frontend will be live at `https://uniarena.vercel.app`

---

## Backend — Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project → Deploy from GitHub**
3. Select the `UniArena` repo
4. Set **Root Directory** to `backend`
5. Add all environment variables from `backend/.env.production.example`
6. Railway auto-detects Node.js and deploys

Your API will be live at `https://uniarena-api.railway.app`

---

## Database — Supabase (PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy the **Connection String** from Settings → Database
3. Set it as `DATABASE_URL` in your Railway environment variables
4. Run migrations as the database **owner** (the app itself should use a limited user): `DATABASE_URL="<owner url>" npx prisma migrate deploy`
5. Use the pooled connection string for the running app, so many requests do not use up database connections

---

## Post-Deployment Checklist

- [ ] Frontend live on Vercel
- [ ] Backend live on Railway
- [ ] Database connected and migrations run
- [ ] Environment variables set on both platforms
- [ ] CORS updated to production URLs
- [ ] Test login works on production
- [ ] Test club directory loads real data
- [ ] Test event ticket purchase works
- [ ] `NODE_ENV=production`, `TRUST_PROXY_HOPS=1`, `NEXTAUTH_SECRET` and a separate `API_JWT_SECRET` (same values on both sides)
- [ ] Supabase storage, Brevo email and `ALLOWED_EMAIL_DOMAIN` set (the API refuses to start in production without them)
- [ ] Host health check points at `/health/ready`
- [ ] Backups switched on and one restore tested: see [BACKUPS.md](BACKUPS.md)
- [ ] Uptime monitor and error tracking connected to a person who will see the alerts
- [ ] Test accounts and test events removed from the production database
- [ ] Two-factor sign-in on GitHub, Vercel, Railway, Supabase and Brevo
