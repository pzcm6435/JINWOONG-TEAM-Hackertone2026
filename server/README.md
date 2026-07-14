# Voice Check API

Small Express + Postgres API that persists scan results (F1 human/synthetic + F2 accent + F3 evidence) for the History and Reports screens.

## Local setup

1. `cp .env.example .env` and set `DATABASE_URL` to the connection string for the `dpg-d9bbvn6q1p3s73aooib0-a` Postgres instance (Render dashboard → your database → Connections → External Database URL).
2. `npm install`
3. `npm run migrate` — creates the `scans` table.
4. `npm run dev` — starts the API on `http://localhost:4000`.

## Deploying on Render

1. New → Web Service → point at this repo, root directory `server`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment → add `DATABASE_URL`. If the Web Service is in the same Render account/region as the `dpg-d9bbvn6q1p3s73aooib0-a` database, use the **Internal Database URL** (faster, no egress); otherwise use the **External Database URL**.
5. After the first deploy, run the migration once (Render Shell tab): `npm run migrate`.

## Endpoints

- `GET /api/health` — DB connectivity check
- `GET /api/scans` — list recent scans (newest first)
- `POST /api/scans` — save a scan `{ fileName, status, riskScore, durationSec?, accent?, evidence? }`
- `GET /api/scans/summary` — aggregate counts for the Reports screen
