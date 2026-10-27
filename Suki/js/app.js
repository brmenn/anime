/* =========================================================
   Suki — router + bootstrap
   ========================================================= */

(function () {
  const { $, toast } = window.SukiUI;
  const { pages, loader } = window.SukiViews;
  const app = $("#app");

  const titles = {
    home: "Beranda",
    ongoing: "On-Going",
    completed: "Selesai",
    genres: "Genre",
    schedule: "Jadwal",
    genre: "Genre",
    search: "Pencarian",
    anime: "Detail",
    watch: "Nonton",
    batch: "Batch",
  };

  const routes = [
    { name: "home", pattern: /^#\/home$/, handler: () => pages.home(app) },
    {
      name: "ongoing",
      pattern: /^#\/ongoing(?:\/(\d+))?$/,
      handler: (m) => pages.ongoing(app, { page: m[1] }),
    },
    {
      name: "completed",
      pattern: /^#\/completed(?:\/(\d+))?$/,
      handler: (m) => pages.completed(app, { page: m[1] }),
    },
    { name: "genres", pattern: /^#\/genres$/, handler: () => pages.genres(app) },
    {
      name: "schedule",
      pattern: /^#\/schedule$/,
      handler: () => pages.schedule(app),
    },
    {
      name: "genre",
      pattern: /^#\/genre\/([^/]+)(?:\/(\d+))?$/,
      handler: (m) => pages.genre(app, { id: decodeURIComponent(m[1]), page: m[2] }),
    },
    {
      name: "search",
      pattern: /^#\/search\/(.+)$/,
      handler: (m) => pages.search(app, { query: decodeURIComponent(m[1]) }),
    },
    {
      name: "anime",
      pattern: /^#\/anime\/([^/]+)$/,
      handler: (m) => pages.anime(app, { id: decodeURIComponent(m[1]) }),
    },
    {
      name: "watch",
      pattern: /^#\/watch\/([^/]+)$/,
      handler: (m) => pages.watch(app, { id: decodeURIComponent(m[1]) }),
    },
    {
      name: "batch",
      pattern: /^#\/batch\/([^/]+)$/,
      handler: (m) => pages.batch(app, { id: decodeURIComponent(m[1]) }),
    },
  ];

  let token = 0;

  function resolve(hash) {
    const clean = (hash || "").replace(/\/+$/, "") || "#/home";
    for (const r of routes) {
      const m = clean.match(r.pattern);
      if (m) return { route: r, params: m };
    }
    return null;
  }

  function setActiveNav(name) {
    window.SukiUI.$$(".nav a").forEach((a) => {
      const target = a.dataset.route || a.getAttribute("href");
      const hit =
        target === "#/" + name ||
        (name === "genre" && target === "#/genres") ||
        (name === "ongoing" && target === "#/ongoing");
      a.classList.toggle("active", hit);
    });
  }

  async function render() {
    const found = resolve(location.hash);
    if (!found) {
      app.innerHTML =
        window.SukiUI.emptyState("Halaman tidak ditemukan", "") +
        '<div class="pager"><button data-goto-home>Kembali ke beranda</button></div>';
      return;
    }

    const current = ++token;
    setActiveNav(found.route.name);
    document.title = "Suki · " + titles[found.route.name];
    closeMenu();

    if (found.route.name !== "watch") {
      app.innerHTML = loader("Memuat...");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    try {
      await found.route.handler(found.params);
    } catch (err) {
      if (current !== token) return;
      app.innerHTML =
        window.SukiUI.emptyState(
          err.status === 404 ? "Data tidak ditemukan" : "Gagal memuat",
          err.message
        ) +
        '<div class="pager"><button data-goto-home>Kembali ke beranda</button></div>';
      toast(err.message, "error");
    }
  }

  /* ---------- interaksi global ---------- */

  document.addEventListener("click", (e) => {
    const pageBtn = e.target.closest(".pager button[data-page]");
    if (pageBtn && !pageBtn.disabled) {
      const base = pageBtn.closest(".pager").dataset.base || "";
      location.hash = base + "/" + pageBtn.dataset.page;
      return;
    }

    const back = e.target.closest("[data-goto-home]");
    if (back) {
      location.hash = "#/home";
      return;
    }

    const withPoster = e.target.closest("[data-poster]");
    if (withPoster) {
      const poster = withPoster.dataset.poster;
      if (poster) sessionStorage.setItem("suki:poster", poster);
    }
  });

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim();
    if (q) location.hash = "#/search/" + encodeURIComponent(q);
  });

  /* cari langsung saat mengetik */
  $("#search-input").addEventListener(
    "input",
    window.SukiUI.debounce(function () {
      const q = this.value.trim();
      if (q.length >= 2 && !location.hash.startsWith("#/search/")) {
        location.hash = "#/search/" + encodeURIComponent(q);
      }
    }, 600)
  );

  const nav = $("#nav");
  const burger = $("#burger");

  function closeMenu() {
    nav.classList.remove("open");
  }

  burger.addEventListener("click", () => nav.classList.toggle("open"));

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  window.addEventListener("hashchange", render);

  /* ---------- mulai ---------- */
  $("#api-base").textContent = window.SukiAPI.base;

  fetch(window.SukiAPI.base + "/home")
    .then((r) => (r.ok ? r : Promise.reject(new Error("API tidak merespons"))))
    .catch((err) => {
      toast("Tidak bisa menghubungi API: " + window.SukiAPI.base, "error");
    });

  if (!location.hash) location.hash = "#/home";
  render();
})();
