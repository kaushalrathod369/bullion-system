# Deploy Gold & Silver Bullion System Online

This guide will put your website on the internet so you can open it from laptop or mobile anytime.

---

## Option 1: Railway (Recommended – Easiest)

### 1. Push code to GitHub
1. Create a free account on https://github.com
2. Create a new repository (example name: `bullion-system`)
3. Upload the entire `gold-silver-system` folder to that repository

### 2. Deploy on Railway
1. Go to https://railway.app and login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will start building

### 3. Add PostgreSQL Database
1. Inside your Railway project click **+ New**
2. Choose **Database** → **PostgreSQL**
3. Railway will create the database and give you a `DATABASE_URL`

### 4. Set Environment Variables
In your web service → **Variables** tab, add:

```
JWT_SECRET = any-long-random-secret-you-like-make-it-strong
DATABASE_URL = (paste the value Railway gave you for Postgres)
```

### 5. Finish Setup
After the first deploy finishes:

1. Open the Railway service → click the three dots → **Shell**
2. Run these two commands:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

3. Click the public domain Railway gives you (example: `https://bullion-system.up.railway.app`)

Your website is now live!

---

## Option 2: Vercel + Neon (Also Good)

1. Create account on https://vercel.com and https://neon.tech
2. Create a free Postgres database on Neon → copy the connection string
3. Push code to GitHub
4. Import project on Vercel
5. In Vercel → Settings → Environment Variables add:
   - `JWT_SECRET`
   - `DATABASE_URL` (from Neon)
6. Deploy
7. After deploy, run the seed command using Vercel CLI or a one-time script

---

## After Deployment

- Open the live URL on laptop or mobile
- Login with:
  - Owner: 9999999999 / owner123
  - Manager: 8888888888 / manager123
  - Cashier: 7777777777 / cashier123

**Important:** Change the default passwords after first login in a real shop.

---

## Need Help?
If you get stuck at any step, tell me the exact error message and I will guide you.
