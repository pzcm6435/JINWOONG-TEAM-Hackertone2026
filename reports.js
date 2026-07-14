document.querySelectorAll(".range-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".range-tab").forEach((t) => {
      t.classList.remove("bg-indigo-600", "text-white");
      t.classList.add("text-slate-500");
    });
    tab.classList.add("bg-indigo-600", "text-white");
    tab.classList.remove("text-slate-500");
  });
});

const demoSummary = { total: 28, flagged: 7, avg_risk: 34, human_count: 21, synthetic_count: 6, uncertain_count: 1 };

function renderSummary(s) {
  document.getElementById("statTotal").textContent = s.total;
  document.getElementById("statSynthetic").textContent = s.synthetic_count;
  document.getElementById("statAvgRisk").textContent = `${s.avg_risk}%`;
  document.getElementById("statFlagged").textContent = s.flagged;

  const humanPct = s.total ? Math.round((s.human_count / s.total) * 100) : 0;
  const syntheticPct = s.total ? Math.round((s.synthetic_count / s.total) * 100) : 0;

  document.getElementById("barHuman").style.width = `${humanPct}%`;
  document.getElementById("pctHuman").textContent = `${humanPct}%`;
  document.getElementById("barSynthetic").style.width = `${syntheticPct}%`;
  document.getElementById("pctSynthetic").textContent = `${syntheticPct}%`;
}

async function loadSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/scans/summary`);
    if (!res.ok) throw new Error("API error");
    const summary = await res.json();
    renderSummary(summary.total ? summary : demoSummary);
    if (!summary.total) showOfflineNotice("아직 저장된 스캔이 없어 데모 데이터를 보여드려요.");
  } catch (err) {
    renderSummary(demoSummary);
    showOfflineNotice("API 서버에 연결할 수 없어 데모 데이터를 보여드려요. (server/ 를 실행해보세요)");
  }
}

function showOfflineNotice(msg) {
  const el = document.getElementById("offlineNotice");
  el.textContent = msg;
  el.classList.remove("hidden");
}

loadSummary();
