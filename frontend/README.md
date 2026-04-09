# Nautilus shareholder portal (Next.js)

**Run the UI only from this folder** — not from any legacy `apps/portal` path.

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use Node.js **20+** (see `package.json` `engines`).

The API defaults to `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`).
