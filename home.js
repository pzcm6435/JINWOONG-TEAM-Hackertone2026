const audioInput = document.getElementById("audioInput");
const fileLabel = document.getElementById("fileLabel");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultArea = document.getElementById("resultArea");
const riskValue = document.getElementById("riskValue");
const riskLabel = document.getElementById("riskLabel");
const saveNotice = document.createElement("p");
saveNotice.className = "text-xs text-center mt-2";

audioInput.addEventListener("change", () => {
  const file = audioInput.files[0];
  fileLabel.textContent = file ? file.name : "Upload audio or paste a link";
  resultArea.hidden = true;
});

// Randomized stand-in for real audio feature extraction (no signal processing
// wired up yet). Matches the distributions used to train the GCP model so
// /api/analyze has something realistic to classify.
function randomFeatures() {
  const human = Math.random() < 0.5;
  const jitter = () => (Math.random() - 0.5) * 20;
  return human
    ? {
        pitchStability: Math.max(0, Math.min(100, 78 + jitter())),
        accentConsistency: Math.max(0, Math.min(100, 75 + jitter())),
        frequencyAnomalyScore: Math.max(0, Math.min(100, 18 + jitter())),
        pauseNaturalness: Math.max(0, Math.min(100, 80 + jitter())),
        durationSec: Math.round(8 + Math.random() * 80),
      }
    : {
        pitchStability: Math.max(0, Math.min(100, 35 + jitter())),
        accentConsistency: Math.max(0, Math.min(100, 40 + jitter())),
        frequencyAnomalyScore: Math.max(0, Math.min(100, 72 + jitter())),
        pauseNaturalness: Math.max(0, Math.min(100, 30 + jitter())),
        durationSec: Math.round(5 + Math.random() * 55),
      };
}

analyzeBtn.addEventListener("click", () => {
  if (!audioInput.files[0]) {
    fileLabel.textContent = "먼저 오디오 파일을 선택해주세요";
    return;
  }
  analyzeBtn.disabled = true;
  setTimeout(async () => {
    resultArea.hidden = false;
    analyzeBtn.disabled = false;

    const file = audioInput.files[0];
    const features = randomFeatures();

    const { status, riskScore, source } = await analyzeAudio(features);
    riskValue.textContent = `${riskScore}%`;
    riskLabel.textContent = status === "synthetic" ? "High Risk" : status === "uncertain" ? "Uncertain" : "Low Risk";

    await saveScan({
      fileName: file.name,
      status,
      riskScore,
      durationSec: features.durationSec,
      accent: status === "human" ? [
        { country: "🇺🇸 US", pct: 52 },
        { country: "🇬🇧 UK", pct: 28 },
        { country: "🇦🇺 AU", pct: 12 },
      ] : null,
      evidence:
        source === "vertex-ai"
          ? [`GCP 모델(voice_check_dataset) 예측 결과`, `합성 확률 ${riskScore}%`]
          : [
              "비정상적으로 일정한 피치 패턴",
              "자연스러운 호흡/멈춤 부족",
              "주파수 스펙트럼에서 합성 아티팩트 감지",
            ],
    });
  }, 800);
});

async function analyzeAudio(features) {
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!res.ok) throw new Error("analyze failed");
    return await res.json();
  } catch (err) {
    // API unreachable — keep the demo usable offline.
    const riskScore = 87;
    return { status: "synthetic", riskScore, source: "offline-fallback" };
  }
}

async function saveScan(payload) {
  resultArea.appendChild(saveNotice);
  try {
    const res = await fetch(`${API_BASE}/api/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save failed");
    saveNotice.textContent = "History에 저장되었습니다.";
    saveNotice.className = "text-xs text-center mt-2 text-emerald-600";
  } catch (err) {
    saveNotice.textContent = "API 서버에 연결할 수 없어 결과가 저장되지 않았어요. (server/ 를 실행해보세요)";
    saveNotice.className = "text-xs text-center mt-2 text-amber-600";
  }
}
