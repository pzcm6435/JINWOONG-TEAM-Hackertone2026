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
- `POST /api/analyze` — classify audio features via the Vertex AI model `{ pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness, durationSec? }`. Falls back to a heuristic (no GCP call) when `MODEL_ENDPOINT_URL` is unset.
- `GET /api/scans` — list recent scans (newest first)
- `POST /api/scans` — save a scan `{ fileName, status, riskScore, durationSec?, accent?, evidence? }`
- `GET /api/scans/summary` — aggregate counts for the Reports screen

## Connecting the Vertex AI model (optional, costs money while deployed)

The model only answers requests while it's **deployed to an endpoint** — that endpoint bills by the hour whether or not it's used. Deploy it only when you're actively testing/demoing, then undeploy it right after (Vertex AI → Model Registry → your model → Deploy & test → the ⋮ menu on the deployment → Undeploy).

1. Deploy `voice_check_dataset` to an endpoint (smallest CPU machine type, 1 replica — see the model's "Deploy & test" tab).
2. Copy the endpoint ID and your project number from the console, then set `MODEL_ENDPOINT_URL` in `.env` to:
   `https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_NUMBER}/locations/us-central1/endpoints/{ENDPOINT_ID}:predict`
3. Local auth: `gcloud auth application-default login` (one-time, free).
4. Render auth: create a service account with the **Vertex AI User** role → Keys → create JSON key → paste the full JSON as `GOOGLE_APPLICATION_CREDENTIALS_JSON` in Render's Environment tab.
5. Leave `MODEL_ENDPOINT_URL` blank to skip GCP entirely — `/api/analyze` still works off the built-in heuristic, at $0 cost.
