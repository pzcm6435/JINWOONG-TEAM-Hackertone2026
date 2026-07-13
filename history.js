const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");
const filterOptions = document.querySelectorAll(".filter-option");
const historyItems = document.querySelectorAll(".history-item");

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
  human: { label: "Human", badge: "bg-emerald-100 text-emerald-600", risk: "text-emerald-500" },
  synthetic: { label: "Synthetic", badge: "bg-red-100 text-red-600", risk: "text-red-500" },
  uncertain: { label: "Uncertain", badge: "bg-amber-100 text-amber-600", risk: "text-amber-500" },
};

// Filter dropdown toggle
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
    historyItems.forEach((item) => {
      const match = filter === "all" || item.dataset.status === filter;
      item.style.display = match ? "" : "none";
    });
    filterMenu.classList.add("hidden");
  });
});

// Detail modal
historyItems.forEach((item) => {
  item.addEventListener("click", () => {
    const status = item.dataset.status;
    const style = statusStyles[status];

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
  });
});

modalClose.addEventListener("click", () => detailModal.classList.add("hidden"));
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) detailModal.classList.add("hidden");
});
