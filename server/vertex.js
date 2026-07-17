import { GoogleAuth } from "google-auth-library";

// Class order confirmed empirically against the deployed endpoint:
// scores[0] = synthetic probability, scores[1] = human probability.
const SCORE_INDEX = { synthetic: 0, human: 1 };

let authClient = null;

function getAuth() {
  if (!authClient) {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      : undefined;
    authClient = new GoogleAuth({
      credentials,
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
  }
  return authClient;
}

// features: { pitchStability, accentConsistency, frequencyAnomalyScore, pauseNaturalness, durationSec }
// Returns { humanScore, syntheticScore } or null if MODEL_ENDPOINT_URL isn't configured.
export async function predictVoiceCheck(features) {
  if (!process.env.MODEL_ENDPOINT_URL) return null;

  const client = await getAuth().getClient();
  const { token } = await client.getAccessToken();

  const instance = {
    pitch_stability: String(features.pitchStability),
    accent_consistency: String(features.accentConsistency),
    frequency_anomaly_score: String(features.frequencyAnomalyScore),
    pause_naturalness: String(features.pauseNaturalness),
    duration_sec: String(features.durationSec),
  };

  const res = await fetch(process.env.MODEL_ENDPOINT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instances: [instance] }),
  });

  if (!res.ok) {
    throw new Error(`Vertex AI predict failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const scores = data.predictions?.[0]?.scores;
  if (!scores) throw new Error("Unexpected Vertex AI response shape");

  return {
    syntheticScore: scores[SCORE_INDEX.synthetic],
    humanScore: scores[SCORE_INDEX.human],
  };
}
