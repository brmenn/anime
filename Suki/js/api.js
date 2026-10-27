/* =========================================================
   Suki — frontend only, semua data dari API otakudesu
   Ganti base API di sini kalau server jalan di host/port lain
   ========================================================= */

window.SUKI_API = window.SUKI_API || "http://localhost:3000/api";

(function () {
  const BASE = window.SUKI_API;

  async function request(path, options) {
    const res = await fetch(BASE + path, {
      headers: { Accept: "application/json" },
      ...options,
    });
    if (!res.ok) {
      let message = "Gagal memuat data (" + res.status + ")";
      try {
        const body = await res.json();
        if (body && body.message) message = body.message;
      } catch (_) {}
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  function post(path, payload) {
    return request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  window.SukiAPI = {
    base: BASE,

    home: () => request("/home"),
    schedule: () => request("/schedule"),
    ongoing: (page) => request("/ongoing/page/" + (page || 1)),
    completed: (page) => request("/completed/page/" + (page || 1)),
    genres: () => request("/genres"),
    byGenre: (id, page) =>
      request("/genre/" + encodeURIComponent(id) + "/page/" + (page || 1)),
    search: (query) => request("/search/" + encodeURIComponent(query)),
    anime: (id) => request("/anime/" + encodeURIComponent(id)),
    episode: (id) => request("/episode/" + encodeURIComponent(id)),
    batch: (id) => request("/batch/" + encodeURIComponent(id)),
    mirror: (episodeId, dataContent) =>
      post("/episode/" + encodeURIComponent(episodeId) + "/mirror", {
        data_content: dataContent,
      }),
  };
})();
