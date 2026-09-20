export const clientScript = `(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];

  const activateTab = (tab) => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.classList.toggle("active", active);
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));

  document.querySelectorAll(".news-expand-toggle").forEach((expandButton) => {
    expandButton.addEventListener("click", () => {
      const panel = expandButton.closest(".news-panel");
      panel?.querySelectorAll(".additional-news").forEach((entry) => { entry.hidden = false; });
      expandButton.remove();
    });
  });

  const main = document.querySelector("main[data-recent-key]");
  if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const storageKey = "pbi-news-recent-entries";
  try {
    if (window.sessionStorage.getItem(storageKey) !== main.dataset.recentKey) {
      document.querySelectorAll(".recent-entry").forEach((entry) => entry.classList.add("new-entry-glow"));
      window.sessionStorage.setItem(storageKey, main.dataset.recentKey);
      window.setTimeout(() => {
        document.querySelectorAll(".new-entry-glow").forEach((entry) => entry.classList.remove("new-entry-glow"));
      }, 1650);
    }
  } catch { /* Storage can be unavailable in strict privacy modes. */ }
})();`;
