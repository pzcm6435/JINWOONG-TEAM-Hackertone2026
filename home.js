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

analyzeBtn.addEventListener("click", () => {
  if (!audioInput.files[0]) {
    fileLabel.textContent = "먼저 오디오 파일을 선택해주세요";
    return;
  }
  analyzeBtn.disabled = true;
  setTimeout(async () => {
    resultArea.hidden = false;
    analyzeBtn.disabled = false;

    // NOTE: no real F1/F2 model wired up yet — this is a placeholder result
    // used to demonstrate the History/Reports persistence flow end-to-end.
    const file = audioInput.files[0];
    const riskScore = 87;
    const status = riskScore >= 70 ? "synthetic" : riskScore >= 50 ? "uncertain" : "human";
    riskValue.textContent = `${riskScore}%`;
    riskLabel.textContent = status === "synthetic" ? "High Risk" : status === "uncertain" ? "Uncertain" : "Low Risk";

    await saveScan({
      fileName: file.name,
      status,
      riskScore,
      accent: status === "human" ? [
        { country: "🇺🇸 US", pct: 52 },
        { country: "🇬🇧 UK", pct: 28 },
        { country: "🇦🇺 AU", pct: 12 },
      ] : null,
      evidence: [
        "비정상적으로 일정한 피치 패턴",
        "자연스러운 호흡/멈춤 부족",
        "주파수 스펙트럼에서 합성 아티팩트 감지",
      ],
    });
  }, 800);
});

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
