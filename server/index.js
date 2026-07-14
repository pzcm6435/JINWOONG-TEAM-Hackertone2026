import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/scans", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM scans ORDER BY created_at DESC LIMIT 100");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/scans", async (req, res) => {
  const { fileName, status, riskScore, durationSec, accent, evidence } = req.body ?? {};

  if (!fileName || !status || riskScore === undefined) {
    return res.status(400).json({ error: "fileName, status, riskScore are required" });
  }
  if (!["human", "synthetic", "uncertain"].includes(status)) {
    return res.status(400).json({ error: "status must be human, synthetic, or uncertain" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO scans (file_name, status, risk_score, duration_sec, accent, evidence)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        fileName,
        status,
        riskScore,
        durationSec ?? null,
        accent ? JSON.stringify(accent) : null,
        evidence ? JSON.stringify(evidence) : null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scans/summary", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE risk_score >= 70)::int AS flagged,
        COALESCE(ROUND(AVG(risk_score)), 0)::int AS avg_risk,
        COUNT(*) FILTER (WHERE status = 'human')::int AS human_count,
        COUNT(*) FILTER (WHERE status = 'synthetic')::int AS synthetic_count,
        COUNT(*) FILTER (WHERE status = 'uncertain')::int AS uncertain_count
      FROM scans
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function ensureSchema() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
}

const port = process.env.PORT || 4000;

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Voice Check API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to prepare database schema:", err.message);
    process.exit(1);
  });
