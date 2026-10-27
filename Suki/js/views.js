/* =========================================================
   Suki — semua template halaman
   ========================================================= */

window.SukiViews = (function () {
  const { esc, score, trimNumber, cleanEpisode, emptyState } = window.SukiUI;

  /* ---------- komponen ---------- */

  function posterCard(item) {
    const rating = score(item.score);
    return `
      <a class="card" href="#/anime/${encodeURIComponent(item.id)}">
        <div class="poster">
          ${
            item.episode
              ? `<span class="badge">${esc(episodeBadge(item.episode))}</span>`
              : ""
          }
          ${rating ? `<span class="rating">${rating.toFixed(2)}</span>` : ""}
          <img src="${esc(item.thumb)}" alt="${esc(item.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-title">${esc(item.title)}</div>
          <div class="card-meta">
            ${item.uploaded_on ? `<span>${esc(item.uploaded_on)}</span>` : ""}
            ${
              item.day_updated
                ? `<span>· ${esc(item.day_updated)}</span>`
                : ""
            }
          </div>
        </div>
      </a>`;
  }

  function genreCard(item) {
    const rating = score(item.score);
    return `
      <a class="card" href="#/anime/${encodeURIComponent(item.id)}">
        <div class="poster">
          ${rating ? `<span class="rating">${rating.toFixed(2)}</span>` : ""}
          <img src="${esc(item.thumb)}" alt="${esc(item.anime_name)}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-title">${esc(item.anime_name)}</div>
          <div class="card-meta">
            ${item.studio ? `<span>${esc(item.studio)}</span>` : ""}
            ${item.episode ? `<span>· ${esc(item.episode)}</span>` : ""}
          </div>
        </div>
      </a>`;
  }

  function searchCard(item) {
    const rating = score(item.score);
    return `
      <a class="card" href="#/anime/${encodeURIComponent(item.id)}">
        <div class="poster">
          ${rating ? `<span class="rating">${rating.toFixed(2)}</span>` : ""}
          <img src="${esc(item.thumb)}" alt="${esc(item.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-title">${esc(item.title)}</div>
          <div class="card-meta">
            ${item.status ? `<span>${esc(item.status)}</span>` : ""}
          </div>
        </div>
      </a>`;
  }

  function grid(list, renderer) {
    return `<div class="grid">${list.map(renderer).join("")}</div>`;
  }

  function section(title, sub, inner) {
    return `
      <div class="section">
        <div class="view-head">
          <h2>${esc(title)}</h2>
          ${sub ? `<span class="sub">${esc(sub)}</span>` : ""}
        </div>
        ${inner}
      </div>`;
  }

  function pager(page, maxPage, base) {
    if (!maxPage || maxPage < 2) return "";
    const p = Number(page) || 1;
    const total = Number(maxPage);
    const nums = [];
    const push = (n) => {
      if (n >= 1 && n <= total && !nums.includes(n)) nums.push(n);
    };
    push(1);
    for (let i = p - 1; i <= p + 1; i++) push(i);
    push(total);
    nums.sort((a, b) => a - b);

    let html =
      `<div class="pager" data-base="${esc(base)}">` +
      `<button ${p <= 1 ? "disabled" : ""} data-page="${p - 1}">‹</button>`;

    let last = 0;
    nums.forEach((n) => {
      if (n - last > 1) html += `<button disabled>…</button>`;
      html +=
        `<button class="${n === p ? "active" : ""}" data-page="${n}">${n}</button>`;
      last = n;
    });

    html += `<button ${p >= total ? "disabled" : ""} data-page="${p + 1}">›</button>`;
    html += "</div>";
    return html;
  }

  /* "12 Episode" / "Episode 12" / "12Episode" → label rapi */
  function episodeBadge(text) {
    const raw = String(text || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) return "";
    const before = raw.match(/^(\d+)\s*Episode/i);
    if (before) return before[1] + " Episode";
    const after = raw.match(/Episode\s*(\d+)/i);
    if (after) return "Episode " + after[1];
    return cleanEpisode(raw);
  }

  function loader(text) {
    return `<div class="center-loader"><div class="spinner"></div><span class="muted">${esc(
      text || "Memuat..."
    )}</span></div>`;
  }

  function hero(item) {
    if (!item) return "";
    return `
      <section class="hero glass">
        <div class="hero-bg" style="background-image:url('${esc(item.thumb)}')"></div>
        <div class="hero-content">
          <div class="chip-row">
            <span class="chip accent">${esc(
              episodeBadge(item.episode) || "On-Going"
            )}</span>
            ${item.day_updated ? `<span class="chip">${esc(item.day_updated)}</span>` : ""}
            ${item.uploaded_on ? `<span class="chip">${esc(item.uploaded_on)}</span>` : ""}
          </div>
          <h1>${esc(item.title)}</h1>
          <p>Episode terbaru di Otaku Desu</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/anime/${encodeURIComponent(item.id)}">Tonton</a>
            <a class="btn" href="#/ongoing">Daftar on-going</a>
          </div>
        </div>
      </section>`;
  }

  function epsItem(ep, activeId, poster) {
    const num = window.SukiUI.episodeNumber(ep.title) || ep.title;
    return `
      <a class="eps-item ${ep.id === activeId ? "active" : ""}"
         href="#/watch/${encodeURIComponent(ep.id)}" data-poster="${esc(
    poster || ""
  )}">
        <span class="eps-num">${esc(num)}</span>
        <span class="eps-info">
          <b>${esc(cleanEpisode(ep.title))}</b>
          ${ep.uploaded_on ? `<span>${esc(ep.uploaded_on)}</span>` : ""}
        </span>
        <span class="eps-play">&#9654;</span>
      </a>`;
  }

  function downloadPanel(list) {
    if (!list || !list.length) {
      return `<div class="panel"><h3>Download</h3>${emptyState(
        "Belum ada link download"
      )}</div>`;
    }
    const groups = list
      .map(
        (q) => `
        <div class="dl-group">
          <div class="dl-head">
            <b>${esc(q.quality || "-")}</b>
            <span class="chip">${esc(q.size || "")}</span>
          </div>
          <div class="dl-links">
            ${(q.download_links || [])
              .map(
                (l) =>
                  `<a class="dl-link" href="${esc(
                    l.link
                  )}" target="_blank" rel="noopener noreferrer">${esc(
                    l.host
                  )} &#8599;</a>`
              )
              .join("")}
          </div>
        </div>`
      )
      .join("");
    return `<div class="panel"><h3>Download</h3>${groups}</div>`;
  }

  /* ---------- halaman ---------- */

  const pages = {
    async home(app) {
      const data = await window.SukiAPI.home();
      const going = (data.home && data.home.on_going) || [];
      const done = (data.home && data.home.complete) || [];

      app.innerHTML = `
        ${hero(going[0])}
        ${section(
          "On-Going",
          going.length + " anime",
          `<div class="rail">${going.slice(0, 20).map(posterCard).join("")}</div>`
        )}
        ${section(
          "Selesai",
          done.length + " anime",
          grid(done, posterCard)
        )}
        ${section(
          "",
          "",
          `<div class="view-head"><h2>Lihat juga</h2></div>
           <div class="chip-row">
             <a class="btn btn-sm" href="#/ongoing">Semua on-going</a>
             <a class="btn btn-sm" href="#/completed">Semua selesai</a>
             <a class="btn btn-sm" href="#/genres">Jelajahi genre</a>
             <a class="btn btn-sm" href="#/schedule">Jadwal rilis</a>
           </div>`
        )}
      `;
    },

    async ongoing(app, params) {
      const page = params.page || 1;
      const data = await window.SukiAPI.ongoing(page);
      app.innerHTML =
        `<div class="view-head">
           <h2>On-Going</h2>
           <span class="sub">Halaman ${page} dari ${data.maxPage || "?"}</span>
         </div>` +
        (data.animeList.length
          ? grid(data.animeList, posterCard)
          : emptyState("Belum ada anime on-going")) +
        pager(page, data.maxPage, "#/ongoing");
    },

    async completed(app, params) {
      const page = params.page || 1;
      const data = await window.SukiAPI.completed(page);
      app.innerHTML =
        `<div class="view-head">
           <h2>Selesai</h2>
           <span class="sub">Halaman ${page} dari ${data.maxPage || "?"}</span>
         </div>` +
        (data.animeList.length
          ? grid(data.animeList, posterCard)
          : emptyState("Belum ada anime selesai")) +
        pager(page, data.maxPage, "#/completed");
    },

    async genres(app) {
      const data = await window.SukiAPI.genres();
      app.innerHTML =
        `<div class="view-head"><h2>Genre</h2><span class="sub">${
          data.genreList.length
        } genre</span></div>` +
        `<div class="chip-row">` +
        data.genreList
          .map(
            (g) =>
              `<a class="chip" href="#/genre/${encodeURIComponent(g.id)}">${esc(
                g.genre_name
              )}</a>`
          )
          .join("") +
        `</div>`;
    },

    async genre(app, params) {
      const page = params.page || 1;
      const data = await window.SukiAPI.byGenre(params.id, page);
      app.innerHTML =
        `<div class="view-head"><h2>Genre ${esc(params.id)}</h2>
          <span class="sub">Halaman ${page} dari ${data.maxPage || "?"}</span>
        </div>` +
        (data.animeList.length
          ? grid(data.animeList, genreCard)
          : emptyState("Belum ada anime di genre ini")) +
        pager(page, data.maxPage, "#/genre/" + params.id);
    },

    async schedule(app) {
      const data = await window.SukiAPI.schedule();
      const list = data.scheduleList || [];
      app.innerHTML =
        `<div class="view-head"><h2>Jadwal Rilis</h2></div>` +
        (list.length
          ? list
              .map(
                (d) => `
              <div class="day-block">
                <div class="day-title">${esc(d.day)}</div>
                <div class="mini-list">
                  ${(d.animeList || [])
                    .map(
                      (a) =>
                        `<a class="mini-item" href="#/anime/${encodeURIComponent(
                          a.id
                        )}">&#9654; <span>${esc(a.anime_name)}</span></a>`
                    )
                    .join("")}
                </div>
              </div>`
              )
              .join("")
          : emptyState("Jadwal belum tersedia"));
    },

    async search(app, params) {
      const q = params.query;
      if (!q) {
        app.innerHTML = emptyState("Ketik judul anime di kotak pencarian");
        return;
      }
      const data = await window.SukiAPI.search(q);
      const list = data.search_results || [];
      app.innerHTML =
        `<div class="view-head"><h2>Hasil: ${esc(q)}</h2>
          <span class="sub">${list.length} ditemukan</span>
        </div>` +
        (list.length
          ? grid(list, searchCard)
          : emptyState("Tidak ada hasil untuk kata itu", "Coba judul lain"));
    },

    async anime(app, params) {
      const data = await window.SukiAPI.anime(params.id);
      const eps = data.episode_list || [];
      const hasBatch = data.batch_link && data.batch_link.id !== "Masih kosong gan";
      const total = trimNumber(data.total_episode);

      app.innerHTML = `
        <div class="detail">
          <div class="detail-poster">
            <img src="${esc(data.thumb)}" alt="${esc(data.title || "")}" />
          </div>
          <div>
            <h1>${esc(data.title || data.anime_id)}</h1>
            ${data.japanase ? `<div class="jp">${esc(data.japanase)}</div>` : ""}

            <div class="chip-row">
              ${data.status ? `<span class="chip accent">${esc(data.status)}</span>` : ""}
              ${data.type ? `<span class="chip">${esc(data.type)}</span>` : ""}
              ${score(data.score) ? `<span class="chip">★ ${score(data.score).toFixed(2)}</span>` : ""}
            </div>

            <div class="stats">
              ${stat("Episode", total ? total : eps.length)}
              ${stat("Durasi", data.duration)}
              ${stat("Studio", data.studio)}
              ${stat("Produser", data.producer)}
              ${stat("Rilis", data.release_date)}
              ${stat("Status", data.status)}
            </div>

            <p class="synopsis">${esc(data.synopsis || "Sinopsis belum tersedia.")}</p>

            <div class="chip-row" style="margin-bottom:18px">
              ${(data.genre_list || [])
                .map(
                  (g) =>
                    `<a class="chip" href="#/genre/${encodeURIComponent(
                      g.genre_id
                    )}">${esc(g.genre_name)}</a>`
                )
                .join("")}
            </div>

            <div class="hero-actions">
              ${
                eps.length
                  ? `<a class="btn btn-primary" href="#/watch/${encodeURIComponent(
                      eps[0].id
                    )}" data-poster="${esc(data.thumb)}">▶ Putar episode</a>`
                  : ""
              }
              ${
                hasBatch
                  ? `<a class="btn" href="#/batch/${encodeURIComponent(
                      data.batch_link.id
                    )}">Download batch</a>`
                  : ""
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="view-head">
            <h2>Daftar Episode</h2>
            <span class="sub">${eps.length} episode</span>
          </div>
          ${
            eps.length
              ? `<div class="eps-list flow">${eps.map((e) => epsItem(e)).join("")}</div>`
              : emptyState("Belum ada episode")
          }
        </div>
      `;
    },

    async watch(app, params) {
      const data = await window.SukiAPI.episode(params.id);
      const eps = data.episode_list || [];
      const mirrors = data.mirror_list || [];
      const defaultMirror = mirrors.find((m) => m.host === "odcdn") || mirrors[0];
      const poster = sessionStorage.getItem("suki:poster") || "";
      const hasDirect = data.link_stream && data.link_stream !== "-";

      app.innerHTML = `
        <div class="watch">
          <div>
            <div class="player-box" id="player-box">
              <div class="player-poster" id="player-poster" style="${
                poster ? "background-image:url('" + poster + "')" : ""
              }">
                <button class="big-play" aria-label="Putar">&#9654;</button>
              </div>
              ${
                hasDirect
                  ? `<video id="native-player" controls playsinline style="width:100%;height:100%;display:none;background:#000" poster="${esc(poster)}"></video>`
                  : ""
              }
              <iframe
                id="player-frame"
                title="${esc(data.title || "")}"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowfullscreen
                referrerpolicy="no-referrer"
                scrolling="no"
              ></iframe>
            </div>

            <div class="panel" style="margin-top:16px">
              <h3>${esc(data.title || "")}</h3>
              <div class="hero-actions">
                ${
                  hasDirect
                    ? `<button class="btn btn-sm btn-primary" id="btn-toggle-mode">Gunakan Pemutar Langsung (Direkomendasikan)</button>`
                    : ""
                }
                ${
                  data.prev_eps_slug !== "-"
                    ? `<a class="btn btn-sm" href="#/watch/${encodeURIComponent(
                        data.prev_eps_slug
                      )}">‹ Sebelumnya</a>`
                    : `<button class="btn btn-sm" disabled>‹ Sebelumnya</button>`
                }
                ${
                  data.next_eps_slug !== "-"
                    ? `<a class="btn btn-sm" href="#/watch/${encodeURIComponent(
                        data.next_eps_slug
                      )}">Berikutnya ›</a>`
                    : `<button class="btn btn-sm" disabled>Berikutnya ›</button>`
                }
                ${data.id && data.id !== "-" ? `<a class="btn btn-sm" href="#/anime/${encodeURIComponent(data.id)}">Detail anime</a>` : ""}
              </div>
            </div>

            ${downloadPanel(data.download_list)}
          </div>

          <aside class="watch-side">
            <div class="panel">
              <h3>Mirror</h3>
              ${
                mirrors.length
                  ? `<div class="mirror-tabs" id="mirror-tabs">${mirrors
                      .map(
                        (m, i) =>
                          `<button class="mirror-tab ${
                            m === defaultMirror ? "active" : ""
                          }" data-index="${i}" data-content="${esc(
                            m.data_content
                          )}">${esc(m.quality)} · ${esc(m.host)}</button>`
                      )
                      .join("")}</div>`
                  : `<p class="muted">Mirror tidak tersedia</p>`
              }
            </div>

            <div class="panel">
              <h3>Episode lain</h3>
              ${
                eps.length
                  ? `<div class="eps-list">${eps
                      .map((e) => epsItem(e, params.id, poster))
                      .join("")}</div>`
                  : `<p class="muted">Tidak ada daftar episode</p>`
              }
            </div>
          </aside>
        </div>
      `;

      const box = document.getElementById("player-box");
      const posterEl = document.getElementById("player-poster");
      const nativeVid = document.getElementById("native-player");
      const toggleBtn = document.getElementById("btn-toggle-mode");
      let frame = document.getElementById("player-frame");
      let useNative = hasDirect;

      if (hasDirect && nativeVid) {
        nativeVid.src = data.link_stream;
      }

      function mountFrame() {
        frame = document.createElement("iframe");
        frame.id = "player-frame";
        frame.title = data.title || "player";
        frame.allow =
          "autoplay; fullscreen; encrypted-media; picture-in-picture";
        frame.setAttribute("allowfullscreen", "");
        frame.referrerPolicy = "no-referrer";
        frame.scrolling = "no";
        box.appendChild(frame);
        return frame;
      }

      function busy(message) {
        box.insertAdjacentHTML(
          "beforeend",
          `<div class="player-loading"><div class="spinner"></div>${
            message ? "<span>" + esc(message) + "</span>" : ""
          }</div>`
        );
      }

      function clearBusy() {
        const l = box.querySelector(".player-loading");
        if (l) l.remove();
      }

      function play(src) {
        if (useNative && nativeVid) {
          nativeVid.src = src;
          nativeVid.style.display = "block";
          if (frame) frame.style.display = "none";
          nativeVid.play().catch(() => {});
          clearBusy();
          return;
        }
        if (nativeVid) nativeVid.style.display = "none";
        if (frame) frame.style.display = "block";
        if (!frame.isConnected) mountFrame();
        frame.addEventListener("load", clearBusy, { once: true });
        frame.src = src;
        setTimeout(clearBusy, 12000);
      }

      /* mode toggle */
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          useNative = !useNative;
          toggleBtn.textContent = useNative
            ? "Gunakan Pemutar Langsung (Direkomendasikan)"
            : "Gunakan Mirror Iframe";
          posterEl.style.display = "none";
          if (useNative && nativeVid) {
            if (frame) frame.style.display = "none";
            nativeVid.style.display = "block";
            nativeVid.play().catch(() => {});
          } else {
            if (nativeVid) nativeVid.style.display = "none";
            if (!frame.isConnected) mountFrame();
            frame.style.display = "block";
            frame.src = data.stream_link;
          }
        });
      }

      /* klik poster → putar */
      posterEl.addEventListener("click", () => {
        posterEl.style.display = "none";
        if (useNative && data.link_stream && data.link_stream !== "-") {
          play(data.link_stream);
        } else if (data.stream_link) {
          play(data.stream_link);
        } else {
          window.SukiUI.toast("Stream tidak tersedia", "error");
        }
      });

      /* ganti mirror */
      const tabs = document.getElementById("mirror-tabs");
      if (tabs) {
        tabs.addEventListener("click", async (e) => {
          const btn = e.target.closest(".mirror-tab");
          if (!btn) return;
          window.SukiUI.$$(".mirror-tab", tabs).forEach((b) =>
            b.classList.remove("active")
          );
          btn.classList.add("active");

          posterEl.style.display = "none";
          clearBusy();
          busy("Membuka mirror...");

          try {
            const res = await window.SukiAPI.mirror(params.id, btn.dataset.content);
            if (!res.stream_link) throw new Error("Mirror tidak mengembalikan stream");
            // Kalau mirror punya link_stream, pakai itu
            const targetSrc = res.link_stream && res.link_stream !== "-" ? res.link_stream : res.stream_link;
            // Kalau targetSrc adalah langsung .mp4 atau kalau useNative aktif
            if (useNative && res.link_stream && res.link_stream !== "-") {
              play(res.link_stream);
              clearBusy();
            } else {
              play(res.stream_link);
            }
          } catch (err) {
            clearBusy();
            busy(err.message);
          }
        });
      }
    },

    async batch(app, params) {
      const data = await window.SukiAPI.batch(params.id);
      const groups = data.batch_list || [];
      app.innerHTML =
        `<div class="view-head"><h2>Batch</h2><span class="sub">${esc(
          data.title || ""
        )}</span></div>` +
        groups
          .map((g) =>
            downloadPanel(g.download_list).replace(
              "<h3>Download</h3>",
              `<h3>${esc(g.title || "Batch")}</h3>`
            )
          )
          .join("");
    },
  };

  function stat(label, value) {
    if (!value) return "";
    return `<div class="stat"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
  }

  return { pages, loader, pager };
})();
