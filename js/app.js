function navigate(hash) {
  location.hash = hash;
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  if (!location.hash) {
    location.hash = 'home';
  } else {
    handleRoute();
  }
}

function handleRoute() {
  const hash = location.hash.slice(1) || 'home';
  showLoader();
  scrollTo(0, 0);

  const parts = hash.split('/');
  const route = parts[0];
  const param = parts[1];
  const page = parseInt(parts[2]) || 1;

  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-links a[href="#${route}"]`);
  if (activeLink) activeLink.classList.add('active');

  switch (route) {
    case 'home':        renderHome(); break;
    case 'ongoing':     renderOngoing(page); break;
    case 'completed':   renderCompleted(page); break;
    case 'genre':       param ? renderGenrePage(param, page) : renderGenreList(); break;
    case 'anime':       param && renderDetail(param); break;
    case 'episode':     param && renderEpisode(param); break;
    case 'batch':       param && renderBatch(param); break;
    case 'schedule':    renderSchedule(); break;
    case 'search':      param && renderSearch(decodeURIComponent(param), page); break;
    case 'unlimited':   renderUnlimited(param || ''); break;
    default:            renderHome();
  }
}

let content;

function showLoader() {
  document.getElementById('loader').style.display = 'flex';
  content = document.getElementById('pageContent');
  content.innerHTML = '';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

function showError(msg) {
  hideLoader();
  content.innerHTML = `<div class="page-title" style="color:#f44;">Gagal memuat data. Coba refresh halaman.</div><p style="color:#888;font-size:0.9rem;">${msg}</p>`;
}

function paginationBar(current, total, base) {
  if (!total || total <= 1) return '';
  let html = '<div class="pagination">';
  if (current > 1) html += `<a href="#${base}/${current - 1}">Prev</a>`;
  html += `<span class="active">${current}</span>`;
  if (current < total) html += `<a href="#${base}/${current + 1}">Next</a>`;
  html += '</div>';
  return html;
}

function animeCard(item) {
  const poster = item.poster || '';
  const title = item.title || '';
  const id = item.animeId || item.slug || '';
  const episodes = item.episodes || item.episode || '';
  const score = item.score || '';
  const status = item.status || item.releaseDay || '';
  const date = item.latestReleaseDate || item.lastReleaseDate || item.releaseTime || '';

  return `
    <div class="anime-card" onclick="navigate('anime/${id}')">
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22><rect fill=%22%23222%22 width=%22300%22 height=%22400%22/><text fill=%22%23555%22 font-size=%2214%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>No Image</text></svg>'">
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          ${episodes ? `<span>${episodes} eps</span>` : ''}
          ${score ? `<span>★ ${score}</span>` : ''}
          ${status ? `<span>${status}</span>` : ''}
          ${date ? `<span>${date}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function smallCard(item) {
  const poster = item.poster || '';
  const title = item.title || '';
  const id = item.animeId || '';
  return `
    <div class="anime-card" onclick="navigate('anime/${id}')">
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22><rect fill=%22%23222%22 width=%22300%22 height=%22400%22/><text fill=%22%23555%22 font-size=%2214%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>No Image</text></svg>'">
      <div class="card-body">
        <div class="card-title">${title}</div>
      </div>
    </div>
  `;
}

async function renderHome() {
  try {
    const json = await getHome();
    hideLoader();
    const d = json.data;
    let html = '';

    const ongoingList = d.ongoing?.animeList || [];
    const completedList = d.completed?.animeList || [];

    if (ongoingList.length) {
      html += `<div class="home-section">
        <div class="section-title">${icon('flame')} Ongoing <span class="badge">Terbaru</span></div>
        <div class="anime-grid">${ongoingList.map(animeCard).join('')}</div>
      </div>`;
    }

    if (completedList.length) {
      html += `<div class="home-section">
        <div class="section-title">${icon('check')} Completed</div>
        <div class="anime-grid">${completedList.map(animeCard).join('')}</div>
      </div>`;
    }

    if (!html) html = '<p style="color:#888;">Tidak ada data.</p>';
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderOngoing(page) {
  try {
    const json = await getOngoing(page);
    hideLoader();
    const list = json.data?.animeList || [];
    const pag = json.pagination || {};
    let html = `<div class="page-title">${icon('flame')}  Anime Ongoing</div>`;
    if (list.length) {
      html += `<div class="anime-grid">${list.map(animeCard).join('')}</div>`;
    } else {
      html += `<p style="color:#888;">Tidak ada anime ongoing.</p>`;
    }
    html += paginationBar(page, pag.totalPages, 'ongoing');
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderCompleted(page) {
  try {
    const json = await getCompleted(page);
    hideLoader();
    const list = json.data?.animeList || [];
    const pag = json.pagination || {};
    let html = `<div class="page-title">${icon('check')}  Anime Completed</div>`;
    if (list.length) {
      html += `<div class="anime-grid">${list.map(animeCard).join('')}</div>`;
    } else {
      html += `<p style="color:#888;">Tidak ada anime completed.</p>`;
    }
    html += paginationBar(page, pag.totalPages, 'completed');
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderGenreList() {
  try {
    const json = await getGenres();
    hideLoader();
    const list = json.data?.genreList || [];
    let html = `<div class="page-title">${icon('theater')} Genre Anime</div>`;
    if (list.length) {
      html += `<div class="genre-grid">`;
      list.forEach(g => {
        html += `<a href="#genre/${g.genreId}">${g.title}</a>`;
      });
      html += `</div>`;
    } else {
      html += `<p style="color:#888;">Tidak ada genre.</p>`;
    }
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderGenrePage(genreId, page) {
  try {
    const json = await getGenrePage(genreId, page);
    hideLoader();
    const d = json.data;
    const list = d?.animeList || [];
    const genreName = d?.genre || genreId;
    const pag = json.pagination || {};
    let html = `<div class="page-title">${icon('theater')} Genre: ${genreName}</div>`;
    if (list.length) {
      html += `<div class="anime-grid">${list.map(animeCard).join('')}</div>`;
    } else {
      html += `<p style="color:#888;">Tidak ada anime di genre ini.</p>`;
    }
    html += paginationBar(page, pag.totalPages, `genre/${genreId}`);
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderDetail(animeId) {
  try {
    const json = await getAnimeDetail(animeId);
    hideLoader();
    const d = json.data;
    const poster = d.poster || '';
    const title = d.title || '';
    const jpn = d.japanese || '';
    const score = d.score || '';
    const status = d.status || '';
    const studios = d.studios || '';
    const type = d.type || '';
    const episodes = d.episodes || '';
    const duration = d.duration || '';
    const aired = d.aired || '';
    const producers = d.producers || '';
    const genreList = d.genreList || [];
    const synopsisObj = d.synopsis || {};
    const paragraphs = synopsisObj.paragraphs || [];
    const synopsis = paragraphs.join('<br><br>');
    const eps = d.episodeList || [];
    const recommendations = d.recommendedAnimeList || [];
    const batch = d.batch || null;

    let html = `<div class="detail-header">
      <div class="detail-poster"><img src="${poster}" alt="${title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22><rect fill=%22%23222%22 width=%22300%22 height=%22400%22/><text fill=%22%23555%22 font-size=%2214%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>No Image</text></svg>'"></div>
      <div class="detail-info">
        <h1>${title}</h1>
        ${jpn ? `<div class="japanese-title">${jpn}</div>` : ''}
        <div class="detail-meta">
          ${score ? `<span>${icon('star')} <strong>${score}</strong></span>` : ''}
          ${type ? `<span>Tipe: <strong>${type}</strong></span>` : ''}
          ${status ? `<span>Status: <strong>${status}</strong></span>` : ''}
          ${episodes ? `<span>Episode: <strong>${episodes}</strong></span>` : ''}
          ${duration ? `<span>Durasi: <strong>${duration}</strong></span>` : ''}
          ${studios ? `<span>Studio: <strong>${studios}</strong></span>` : ''}
          ${aired ? `<span>Tayang: <strong>${aired}</strong></span>` : ''}
          ${producers ? `<span>Produser: <strong>${producers}</strong></span>` : ''}
        </div>
        <div class="genre-tags">${genreList.map(g =>
          `<span class="genre-tag" onclick="navigate('genre/${g.genreId}')">${g.title}</span>`
        ).join('')}</div>
        ${synopsis ? `<div class="detail-synopsis">${synopsis}</div>` : ''}
      </div>
    </div>`;

    if (batch) {
      html += `<div style="margin-bottom:20px;">
        <a href="#batch/${batch.batchId}" class="server-tab active">${icon('package')} Download Batch</a>
      </div>`;
    }

    if (eps.length) {
      html += `<div class="episode-list"><div class="section-title">${icon('tv')} Daftar Episode</div>`;
      eps.slice().reverse().forEach(ep => {
        const eid = ep.episodeId || '';
        const en = ep.eps || ep.episodeNumber || '';
        const et = ep.title || '';
        const ed = ep.date || '';
        html += `<div class="episode-item" onclick="navigate('episode/${eid}')">
          <span class="ep-number">${en}</span>
          <span class="ep-title">${et || `Episode ${en}`}</span>
          <span class="ep-date">${ed}</span>
        </div>`;
      });
      html += `</div>`;
    }

    if (recommendations.length) {
      html += `<div class="home-section"><div class="section-title">${icon('lightbulb')} Rekomendasi</div>
        <div class="recommendation-grid">${recommendations.map(smallCard).join('')}</div></div>`;
    }

    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderEpisode(episodeId) {
  try {
    const json = await getEpisode(episodeId);
    hideLoader();
    const d = json.data;
    const title = d.title || '';
    const animeId = d.animeId || '';
    const releaseTime = d.releaseTime || '';
    const defaultStreamingUrl = d.defaultStreamingUrl || '';
    const hasPrev = d.hasPrevEpisode;
    const hasNext = d.hasNextEpisode;
    const prevEp = d.prevEpisode || null;
    const nextEp = d.nextEpisode || null;
    const serverData = d.server || {};
    const downloadData = d.downloadUrl || {};

    let html = `<div class="episode-header">
      ${animeId ? `<a href="#anime/${animeId}" style="color:#888;font-size:0.85rem;">${icon('arrow-left')} Kembali ke Detail</a>` : ''}
      <h1>${title}</h1>
      ${releaseTime ? `<div class="sub">${releaseTime}</div>` : ''}
    </div>`;

    const qualities = serverData.qualities || [];
    if (qualities.length) {
      html += `<div class="server-tabs" id="serverTabs">`;
      qualities.forEach(q => {
        const qTitle = q.title || '';
        const servers = q.serverList || [];
        servers.forEach(s => {
          html += `<button class="server-tab" data-server="${s.serverId}">${qTitle} - ${s.title}</button>`;
        });
      });
      html += `</div>`;

      html += `<div class="stream-wrapper" id="streamWrapper">
        <p class="stream-placeholder">Pilih server untuk streaming</p>
      </div>`;
    } else if (defaultStreamingUrl) {
      html += `<div class="stream-wrapper">
        <iframe src="${defaultStreamingUrl}" allowfullscreen></iframe>
      </div>`;
    }

    if (defaultStreamingUrl) {
      html += `<div style="margin-bottom:16px;">
        <a href="${defaultStreamingUrl}" target="_blank" class="server-tab active">${icon('external-link')} Buka Link Streaming</a>
      </div>`;
    }

    const dlQualities = downloadData.qualities || [];
    if (dlQualities.length) {
      html += `<div class="download-section"><h3>${icon('download')} Download</h3>`;
      dlQualities.forEach(q => {
        const qTitle = q.title || '';
        const size = q.size || '';
        const urls = q.urls || [];
        html += `<div class="download-quality">
          <h4>${qTitle} ${size ? `(${size})` : ''}</h4>
          <div class="mirror-links">`;
        urls.forEach(u => {
          html += `<a href="${u.url}" target="_blank" class="mirror-link">${u.title}</a>`;
        });
        html += `</div></div>`;
      });
      html += `</div>`;
    }

    if (hasPrev || hasNext) {
      html += `<div class="episode-nav">`;
      if (hasPrev && prevEp) {
        html += `<a href="#episode/${prevEp.episodeId}">${icon('arrow-left')} ${prevEp.title || 'Sebelumnya'}</a>`;
      }
      if (hasNext && nextEp) {
        html += `<a href="#episode/${nextEp.episodeId}">${nextEp.title || 'Berikutnya'} ${icon('arrow-right')}</a>`;
      }
      html += `</div>`;
    }

    content.innerHTML = html;

    document.querySelectorAll('.server-tab[data-server]').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.server-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sid = btn.dataset.server;
        const sw = document.getElementById('streamWrapper');
        if (!sw) return;
        sw.innerHTML = '<div class="loader" style="display:flex;"><div class="spinner"></div></div>';
        try {
          const srv = await getServer(sid);
          const url = srv.data?.url || '';
          if (url.match(/^https?:\/\//)) {
            sw.innerHTML = `<iframe src="${url}" allowfullscreen></iframe>`;
          } else if (url.includes('iframe') || url.startsWith('<')) {
            sw.innerHTML = url;
          } else {
            sw.innerHTML = `<p class="stream-placeholder">URL: ${url}</p>`;
          }
        } catch (e) {
          sw.innerHTML = `<p class="stream-placeholder">Gagal memuat server.</p>`;
        }
      });
    });
  } catch (e) {
    showError(e.message);
  }
}

async function renderBatch(batchId) {
  try {
    const json = await getBatch(batchId);
    hideLoader();
    const d = json.data;
    const title = d.title || '';
    const poster = d.poster || '';
    const animeId = d.animeId || '';
    const jpn = d.japanese || '';
    const type = d.type || '';
    const score = d.score || '';
    const downloadData = d.downloadUrl || {};
    const formats = downloadData.formats || [];

    let html = `<div class="page-title">${icon('package')} Batch Download</div>`;

    if (poster) {
      html += `<div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
        <img src="${poster}" style="width:120px;border-radius:8px;" onerror="this.style.display='none'">
        <div>
          <h2 style="color:#fff;">${title}</h2>
          ${jpn ? `<p style="color:#888;">${jpn}</p>` : ''}
          ${type ? `<p style="color:#aaa;">${type} ${score ? `| ${icon('star')} ${score}` : ''}</p>` : ''}
        </div>
      </div>`;
    }

    if (formats.length) {
      formats.forEach(fmt => {
        const fmtTitle = fmt.title || '';
        const qualities = fmt.qualities || [];
        html += `<div class="download-section"><h3>${fmtTitle}</h3>`;
        qualities.forEach(q => {
          const qTitle = q.title || '';
          const size = q.size || '';
          const urls = q.urls || [];
          html += `<div class="download-quality">
            <h4>${qTitle} ${size ? `(${size})` : ''}</h4>
            <div class="mirror-links">`;
          urls.forEach(u => {
            html += `<a href="${u.url}" target="_blank" class="mirror-link">${u.title}</a>`;
          });
          html += `</div></div>`;
        });
        html += `</div>`;
      });
    } else {
      html += `<p style="color:#888;">Batch tidak tersedia.</p>`;
    }

    if (animeId) {
      html += `<div style="margin-top:20px;"><a href="#anime/${animeId}" class="server-tab active">${icon('arrow-left')} Kembali ke Detail</a></div>`;
    }
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderSchedule() {
  try {
    const json = await getSchedule();
    hideLoader();
    const data = json.data || [];
    let html = `<div class="page-title">${icon('calendar')} Jadwal Anime</div>
      <div class="schedule-tabs" id="scheduleTabs">`;

    const dayMap = {};
    data.forEach(item => {
      const day = item.day || '';
      dayMap[day] = item.anime_list || [];
      html += `<button class="schedule-tab" data-day="${day}">${day}</button>`;
    });

    html += `</div><div id="scheduleContent"></div>`;
    content.innerHTML = html;

    function renderDay(day) {
      const sc = document.getElementById('scheduleContent');
      const list = dayMap[day] || [];
      document.querySelectorAll('.schedule-tab').forEach(b => b.classList.remove('active'));
      document.querySelector(`.schedule-tab[data-day="${day}"]`)?.classList.add('active');
      if (list.length) {
        sc.innerHTML = `<div class="anime-grid">${list.map(item => {
          return `<div class="anime-card" onclick="navigate('anime/${item.slug}')">
            <img src="${item.poster}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22><rect fill=%22%23222%22 width=%22300%22 height=%22400%22/><text fill=%22%23555%22 font-size=%2214%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>No Image</text></svg>'">
            <div class="card-body"><div class="card-title">${item.title}</div></div>
          </div>`;
        }).join('')}</div>`;
      } else {
        sc.innerHTML = `<p style="color:#888;">Tidak ada jadwal untuk hari ${day}.</p>`;
      }
    }

    document.querySelectorAll('.schedule-tab').forEach(btn => {
      btn.addEventListener('click', () => renderDay(btn.dataset.day));
    });

    const firstDay = data[0]?.day;
    if (firstDay) renderDay(firstDay);
  } catch (e) {
    showError(e.message);
  }
}

async function renderSearch(query, page) {
  try {
    const json = await getSearch(query);
    hideLoader();
    const list = json.data?.animeList || [];
    let html = `<div class="page-title">${icon('search')} Hasil Pencarian: "${query}"</div>`;
    if (list.length) {
      html += `<div class="search-status">Menampilkan ${list.length} hasil</div>`;
      html += `<div class="anime-grid">${list.map(animeCard).join('')}</div>`;
    } else {
      html += `<p style="color:#888;">Tidak ditemukan hasil untuk "${query}".</p>`;
    }
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

async function renderUnlimited(start) {
  try {
    const json = await getUnlimited(start);
    hideLoader();
    const list = json.data?.list || [];
    const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    let html = `<div class="page-title">${icon('book')} Daftar Semua Anime</div>`;
    html += `<div class="alphabet-nav">`;
    letters.forEach(l => {
      const active = (l === start) || (!start && l === '#');
      html += `<a href="#unlimited/${l}" class="${active ? 'active' : ''}">${l}</a>`;
    });
    html += `</div>`;

    if (list.length) {
      list.forEach(group => {
        const sw = group.startWith || '#';
        const animeList = group.animeList || [];
        html += `<div class="anime-letter-group">
          <div class="letter-header">${sw}</div>
          <div class="letter-list">`;
        animeList.forEach(a => {
          html += `<a href="#anime/${a.animeId}">${a.title}</a>`;
        });
        html += `</div></div>`;
      });
    } else {
      html += `<p style="color:#888;">Tidak ada anime untuk "${start || '#'}".</p>`;
    }
    content.innerHTML = html;
  } catch (e) {
    showError(e.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initRouter();

  document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value.trim();
    if (q) navigate(`search/${encodeURIComponent(q)}`);
  });

  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) navigate(`search/${encodeURIComponent(q)}`);
    }
  });

  document.getElementById('navToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
});
