export const clientScript = `(() => {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const delay = 5000;

  document.querySelectorAll(".news-entry").forEach((entry) => {
    const link = entry.querySelector(".article-link");
    const button = entry.querySelector(".summary-toggle");
    let timer;

    const hide = () => {
      window.clearTimeout(timer);
      entry.classList.remove("summary-visible");
      button.setAttribute("aria-expanded", "false");
    };
    const reveal = () => {
      entry.classList.add("summary-visible");
      button.setAttribute("aria-expanded", "true");
    };
    const schedule = () => {
      hide();
      timer = window.setTimeout(reveal, delay);
    };

    if (canHover.matches) {
      entry.addEventListener("pointerenter", schedule);
      entry.addEventListener("pointerleave", hide);
      entry.addEventListener("focusin", schedule);
      entry.addEventListener("focusout", (event) => {
        if (!entry.contains(event.relatedTarget)) hide();
      });
    } else {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        entry.classList.toggle("summary-visible");
        button.setAttribute("aria-expanded", String(entry.classList.contains("summary-visible")));
      });
    }

    button.addEventListener("click", () => {
      const visible = entry.classList.toggle("summary-visible");
      button.setAttribute("aria-expanded", String(visible));
    });
  });
})();`;
