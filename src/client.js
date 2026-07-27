export const clientScript = `(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    const frame = panel.querySelector("iframe[data-src]");
    if (frame && !frame.getAttribute("src")) frame.src = frame.dataset.src;
  }));

  document.querySelectorAll(".news-entry").forEach((entry) => {
    const button = entry.querySelector(".summary-toggle");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const visible = entry.classList.toggle("summary-visible");
      button.setAttribute("aria-expanded", String(visible));
    });
  });

  const main = document.querySelector("main[data-recent-key]");
  if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const storageKey = "pbi-news-recent-entries";
  try {
    if (window.sessionStorage.getItem(storageKey) !== main.dataset.recentKey) {
      document.querySelectorAll(".recent-entry").forEach((entry) => entry.classList.add("new-entry-glow"));
      window.sessionStorage.setItem(storageKey, main.dataset.recentKey);
      window.setTimeout(() => document.querySelectorAll(".new-entry-glow").forEach((entry) => entry.classList.remove("new-entry-glow")), 3750);
    }
  } catch { /* Storage can be unavailable in strict privacy modes. */ }
})();`;
