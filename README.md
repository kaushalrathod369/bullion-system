# Gold & Silver Bullion Management System

Production-ready system for managing Gold & Silver bullion business.

## Features

- Secure Login (JWT + bcrypt)
- Role based access (Owner / Manager / Cashier)
- Dashboard (Daily / Weekly / Monthly)
- Fixed & Unfixed Transactions
- Purity calculator (Fine Gold & Fine Silver)
- Automatic Stock (Main + Unfixed)
- Unfixed Fixing (Rate + Quantity)
- Cash Book & Bank Book
- Expenses module
- Live Reports
- 2-year data protection for non-owners

## Run Locally

```bash
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET + DATABASE_URL

npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo Logins
- Owner   → 9999999999 / owner123
- Manager → 8888888888 / manager123
- Cashier → 7777777777 / cashier123

## Deploy Online

See the full guide in **[DEPLOY.md](./DEPLOY.md)**

Recommended platform: **Railway** (easiest)

## Tech Stack

- Next.js 15 + TypeScript
- Prisma + PostgreSQL
- JWT Authentication
- Tailwind CSS
