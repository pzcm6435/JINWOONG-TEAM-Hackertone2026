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
