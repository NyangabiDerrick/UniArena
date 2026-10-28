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
4. Run migrations: `npx prisma migrate deploy`

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