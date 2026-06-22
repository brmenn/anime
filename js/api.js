const API_BASE = 'https://www.sankavollerei.web.id/anime';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || 'Unknown error');
  return json;
}

async function getHome() {
  return fetchJSON(`${API_BASE}/home`);
}

async function getUnlimited(start) {
  const url = start ? `${API_BASE}/unlimited?start=${start}` : `${API_BASE}/unlimited`;
  return fetchJSON(url);
}

async function getAnimeDetail(animeId) {
  return fetchJSON(`${API_BASE}/anime/${animeId}`);
}

async function getEpisode(episodeId) {
  return fetchJSON(`${API_BASE}/episode/${episodeId}`);
}

async function getServer(serverId) {
  return fetchJSON(`${API_BASE}/server/${serverId}`);
}

async function getBatch(animeId) {
  return fetchJSON(`${API_BASE}/batch/${animeId}`);
}

async function getSearch(query) {
  return fetchJSON(`${API_BASE}/search/${encodeURIComponent(query)}`);
}

async function getOngoing(page = 1) {
  return fetchJSON(`${API_BASE}/ongoing-anime?page=${page}`);
}

async function getCompleted(page = 1) {
  return fetchJSON(`${API_BASE}/complete-anime?page=${page}`);
}

async function getGenres() {
  return fetchJSON(`${API_BASE}/genre`);
}

async function getGenrePage(genreId, page = 1) {
  return fetchJSON(`${API_BASE}/genre/${genreId}?page=${page}`);
}

async function getSchedule() {
  return fetchJSON(`${API_BASE}/schedule`);
}
