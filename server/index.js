import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./db.js";
import { predictVoiceCheck } from "./vertex.js";

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

// Runs the Vertex AI model on audio-feature inputs and classifies human vs synthetic.
// Falls back to a deterministic heuristic when MODEL_ENDPOINT_URL isn't set (or the
// endpoint is undeployed) so the rest of the app keeps working without live GCP billing.
app.post("/api/analyze", async (req, res) => {
  const { pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness, durationSec } =
    req.body ?? {};

  if ([pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness].some((v) => v === undefined)) {
    return res.status(400).json({
      error: "pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness are required",
    });
  }

  const features = { pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness, durationSec };

  try {
    const prediction = await predictVoiceCheck(features);

    if (prediction) {
      const riskScore = Math.round(prediction.syntheticScore * 100);
      const status = riskScore >= 70 ? "synthetic" : riskScore >= 50 ? "uncertain" : "human";
      return res.json({ source: "vertex-ai", status, riskScore, ...prediction });
    }

    // No live endpoint configured — simple heuristic fallback from the raw features.
    const riskScore = Math.round(
      100 - (pitchStability + accentConsistency + pauseNaturalness) / 3 + frequencyAnomalyScore / 3
    );
    const clamped = Math.max(0, Math.min(100, riskScore));
    const status = clamped >= 70 ? "synthetic" : clamped >= 50 ? "uncertain" : "human";
    res.json({ source: "heuristic-fallback", status, riskScore: clamped });
  } catch (err) {
    res.status(502).json({ error: `Model call failed: ${err.message}` });
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
