/* =========================================================
   Suki — helper tampilan
   ========================================================= */

window.SukiUI = (function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) =>
    Array.from((root || document).querySelectorAll(sel));

  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function episodeNumber(text) {
    const m = String(text || "").match(/\d+/);
    return m ? m[0] : "";
  }

  function cleanEpisode(text) {
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    return raw.replace(/\s*Subtitle Indonesia$/i, "");
  }

  function score(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = parseFloat(value);
    return Number.isNaN(n) ? null : n;
  }

  function trimNumber(text) {
    const n = parseInt(String(text || "").replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? null : n;
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait || 350);
    };
  }

  function emptyState(title, hint) {
    return (
      '<div class="empty glass">' +
      '<div class="empty-icon">∅</div>' +
      "<p>" +
      esc(title) +
      "</p>" +
      (hint ? '<span class="muted">' + esc(hint) + "</span>" : "") +
      "</div>"
    );
  }

  function toast(message, kind) {
    let box = $("#toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast";
      document.body.appendChild(box);
    }
    box.className = "toast show " + (kind === "error" ? "error" : "");
    box.textContent = message;
    clearTimeout(box._timer);
    box._timer = setTimeout(() => {
      box.className = "toast";
    }, 3200);
  }

  return {
    $,
    $$,
    esc,
    score,
    trimNumber,
    episodeNumber,
    cleanEpisode,
    debounce,
    emptyState,
    toast,
  };
})();
