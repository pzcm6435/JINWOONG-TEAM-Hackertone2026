const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");
const filterOptions = document.querySelectorAll(".filter-option");
const historyList = document.getElementById("historyList");
const totalCount = document.getElementById("totalCount");
const flaggedCount = document.getElementById("flaggedCount");
const offlineNotice = document.getElementById("offlineNotice");

const detailModal = document.getElementById("detailModal");
const modalClose = document.getElementById("modalClose");
const modalFile = document.getElementById("modalFile");
const modalStatus = document.getElementById("modalStatus");
const modalTime = document.getElementById("modalTime");
const modalRisk = document.getElementById("modalRisk");
const modalAccentWrap = document.getElementById("modalAccentWrap");
const modalAccent = document.getElementById("modalAccent");
const modalEvidence = document.getElementById("modalEvidence");

const statusStyles = {
  human: { label: "Human", badge: "bg-emerald-100 text-emerald-600", risk: "text-emerald-500", icon: "mic" },
  synthetic: { label: "Synthetic", badge: "bg-red-100 text-red-600", risk: "text-red-500", icon: "alert" },
  uncertain: { label: "Uncertain", badge: "bg-amber-100 text-amber-600", risk: "text-amber-500", icon: "warn" },
};

const icons = {
  mic: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />',
  alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />',
  warn: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />',
};

// Fallback demo data, used when the API (server/) isn't running/reachable yet.
const demoScans = [
  { file_name: "unknown_caller_0731.mp3", status: "synthetic", risk_score: 87, created_at: new Date().toISOString(),
    accent: null, evidence: ["비정상적으로 일정한 피치 패턴", "자연스러운 호흡/멈춤 부족", "주파수 스펙트럼에서 합성 아티팩트 감지"] },
  { file_name: "client_call_0729.wav", status: "human", risk_score: 6, created_at: "2026-07-12T15:21:00+09:00",
    accent: [{ country: "🇺🇸 US", pct: 52 }, { country: "🇬🇧 UK", pct: 28 }, { country: "🇦🇺 AU", pct: 12 }],
    evidence: ["자연스러운 억양 변화 감지", "일관된 호흡 패턴", "모델 합성 아티팩트 없음"] },
  { file_name: "voicemail_0728.mp3", status: "uncertain", risk_score: 54, created_at: "2026-07-12T09:47:00+09:00",
    accent: null, evidence: ["배경 잡음으로 인한 낮은 신호 품질", "합성/실음성 판별 신뢰도 낮음", "추가 샘플 확보 권장"] },
  { file_name: "support_line_0725.wav", status: "human", risk_score: 9, created_at: "2026-07-10T17:58:00+09:00",
    accent: [{ country: "🇬🇧 UK", pct: 41 }, { country: "🇺🇸 US", pct: 33 }, { country: "🇮🇪 IE", pct: 14 }],
    evidence: ["자연스러운 억양 변화 감지", "일관된 호흡 패턴", "모델 합성 아티팩트 없음"] },
];

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function renderItem(scan) {
  const style = statusStyles[scan.status] ?? statusStyles.uncertain;
  const accentSummary = scan.accent?.length ? ` · ${scan.accent[0].country} ${scan.accent[0].pct}%` : "";

  const article = document.createElement("article");
  article.className = "history-item rounded-2xl bg-white shadow-sm p-4 flex items-center gap-3 text-left w-full cursor-pointer";
  article.dataset.status = scan.status;
  article.dataset.file = scan.file_name;
  article.dataset.time = formatTime(scan.created_at);
  article.dataset.risk = scan.risk_score;
  article.dataset.accent = (scan.accent ?? []).map((a) => `${a.country} ${a.pct}%`).join("|");
  article.dataset.evidence = (scan.evidence ?? []).join("|");

  article.innerHTML = `
    <div class="w-11 h-11 shrink-0 rounded-full ${style.badge.split(" ")[0]} flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ${style.risk}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        ${icons[style.icon]}
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p class="font-semibold text-sm truncate">${scan.file_name}</p>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}">${style.label}</span>
      </div>
      <p class="text-xs text-slate-400 mt-0.5">${formatTime(scan.created_at)}${accentSummary}</p>
    </div>
    <div class="text-right shrink-0">
      <p class="text-sm font-bold ${style.risk}">${scan.risk_score}%</p>
      <p class="text-[10px] text-slate-400">risk</p>
    </div>
  `;

  article.addEventListener("click", () => openDetail(article));
  return article;
}

function renderList(scans) {
  historyList.innerHTML = "";
  scans.forEach((scan) => historyList.appendChild(renderItem(scan)));

  totalCount.textContent = scans.length;
  flaggedCount.textContent = scans.filter((s) => s.risk_score >= 70).length;
}

async function loadScans() {
  try {
    const res = await fetch(`${API_BASE}/api/scans`);
    if (!res.ok) throw new Error("API error");
    const scans = await res.json();
    renderList(scans.length ? scans : demoScans);
    if (!scans.length) showOfflineNotice("아직 저장된 스캔이 없어 데모 데이터를 보여드려요.");
  } catch (err) {
    renderList(demoScans);
    showOfflineNotice("API 서버에 연결할 수 없어 데모 데이터를 보여드려요. (server/ 를 실행해보세요)");
  }
}

function showOfflineNotice(msg) {
  offlineNotice.textContent = msg;
  offlineNotice.classList.remove("hidden");
}

// Filter dropdown
filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterMenu.classList.toggle("hidden");
});
document.addEventListener("click", () => filterMenu.classList.add("hidden"));
filterMenu.addEventListener("click", (e) => e.stopPropagation());

filterOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    filterOptions.forEach((o) => o.classList.remove("text-indigo-600"));
    opt.classList.add("text-indigo-600");
    const filter = opt.dataset.filter;
    document.querySelectorAll(".history-item").forEach((item) => {
      const match = filter === "all" || item.dataset.status === filter;
      item.style.display = match ? "" : "none";
    });
    filterMenu.classList.add("hidden");
  });
});

// Detail modal
function openDetail(item) {
  const status = item.dataset.status;
  const style = statusStyles[status] ?? statusStyles.uncertain;

  modalFile.textContent = item.dataset.file;
  modalStatus.textContent = style.label;
  modalStatus.className = `text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`;
  modalTime.textContent = item.dataset.time;
  modalRisk.textContent = `${item.dataset.risk}%`;
  modalRisk.className = `text-2xl font-extrabold ${style.risk}`;

  if (item.dataset.accent) {
    modalAccentWrap.hidden = false;
    modalAccent.innerHTML = item.dataset.accent
      .split("|")
      .map((entry) => {
        const [flag, pct] = entry.trim().split(/\s(?=\d)/);
        const value = parseInt(pct, 10);
        return `
          <div class="flex items-center gap-2 text-xs">
            <span class="w-20 shrink-0">${flag}</span>
            <div class="flex-1 bg-slate-100 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width:${value}%"></div></div>
            <span class="w-9 text-right text-slate-400">${pct}</span>
          </div>`;
      })
      .join("");
  } else {
    modalAccentWrap.hidden = true;
  }

  modalEvidence.innerHTML = item.dataset.evidence
    .split("|")
    .map((e) => `<li>${e}</li>`)
    .join("");

  detailModal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => detailModal.classList.add("hidden"));
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) detailModal.classList.add("hidden");
});

loadScans();
