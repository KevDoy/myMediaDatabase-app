/* ============================================================
   My Media Database — Electron Main Process
   Unified: Movies + TV Shows + Games
   ============================================================ */
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path  = require('path');
const fs    = require('fs');
const https = require('https');
const http  = require('http');

// ──────────────────────────────────────────────────────────────
//  Paths
// ──────────────────────────────────────────────────────────────
const SETTINGS_PATH = path.join(app.getPath('userData'), 'electron-settings.json');

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8')); }
  catch { return {}; }
}
function writeSettings(s) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(s, null, 2) + '\n', 'utf-8');
}

function libraryPath()      { return readSettings().libraryPath || ''; }
function moviesPath()       { return path.join(libraryPath(), 'data', 'movies.json'); }
function tvshowsPath()      { return path.join(libraryPath(), 'data', 'tvshows.json'); }
function gamesPath()        { return path.join(libraryPath(), 'data', 'games.json'); }
function gamesystemsPath()  { return path.join(libraryPath(), 'data', 'gamesystems.json'); }
function configPath()       { return path.join(libraryPath(), 'data', 'config.json'); }
function postersDir()       { return path.join(libraryPath(), 'posters'); }
function coversDir()        { return path.join(libraryPath(), 'covers'); }

// ──────────────────────────────────────────────────────────────
//  Window
// ──────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    vibrancy: 'sidebar',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ──────────────────────────────────────────────────────────────
//  Shared helpers
// ──────────────────────────────────────────────────────────────

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'text/plain', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      reject(e);
    });
  });
}

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur);
  return cols;
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const nameIdx    = header.indexOf('name');
  const yearIdx    = header.indexOf('year');
  const ratingIdx  = header.indexOf('rating');
  const reviewIdx  = header.indexOf('review');
  const dateIdx    = header.indexOf('date');

  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCsvLine(lines[i]);
    const name = nameIdx >= 0 ? cols[nameIdx]?.trim() : '';
    const year = yearIdx >= 0 ? parseInt(cols[yearIdx], 10) || 0 : 0;
    const rating = ratingIdx >= 0 ? parseFloat(cols[ratingIdx]) || 0 : 0;
    const review = reviewIdx >= 0 ? cols[reviewIdx]?.trim() || '' : '';
    const date = dateIdx >= 0 ? cols[dateIdx]?.trim() || '' : '';
    if (name) entries.push({ name, year, rating, review, date });
  }
  return entries;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

// ──────────────────────────────────────────────────────────────
//  IPC: Settings
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-settings', () => readSettings());

ipcMain.handle('save-settings', (_e, partial) => {
  const current = readSettings();
  Object.assign(current, partial);
  writeSettings(current);
  return current;
});

ipcMain.handle('choose-library-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Library Directory',
    properties: ['openDirectory'],
    message: 'Choose the root of your My Media Database repository',
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

// ──────────────────────────────────────────────────────────────
//  IPC: Config (repo config.json)
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-config', () => {
  try { return JSON.parse(fs.readFileSync(configPath(), 'utf-8')); }
  catch { return {}; }
});

ipcMain.handle('save-config', (_e, cfg) => {
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
  return true;
});

// ──────────────────────────────────────────────────────────────
//  IPC: Movies
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-movies', () => {
  try { return JSON.parse(fs.readFileSync(moviesPath(), 'utf-8')); }
  catch { return []; }
});

ipcMain.handle('save-movies', (_e, movies) => {
  fs.writeFileSync(moviesPath(), JSON.stringify(movies, null, 2) + '\n', 'utf-8');
  return true;
});

// ──────────────────────────────────────────────────────────────
//  IPC: TV Shows
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-tvshows', () => {
  try { return JSON.parse(fs.readFileSync(tvshowsPath(), 'utf-8')); }
  catch { return []; }
});

ipcMain.handle('save-tvshows', (_e, shows) => {
  fs.writeFileSync(tvshowsPath(), JSON.stringify(shows, null, 2) + '\n', 'utf-8');
  return true;
});

// ──────────────────────────────────────────────────────────────
//  IPC: Games
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-games', () => {
  try { return JSON.parse(fs.readFileSync(gamesPath(), 'utf-8')); }
  catch { return []; }
});

ipcMain.handle('save-games', (_e, games) => {
  fs.writeFileSync(gamesPath(), JSON.stringify(games, null, 2) + '\n', 'utf-8');
  return true;
});

// ──────────────────────────────────────────────────────────────
//  IPC: Game Systems
// ──────────────────────────────────────────────────────────────

ipcMain.handle('get-gamesystems', () => {
  try { return JSON.parse(fs.readFileSync(gamesystemsPath(), 'utf-8')); }
  catch { return {}; }
});

ipcMain.handle('save-gamesystems', (_e, data) => {
  fs.writeFileSync(gamesystemsPath(), JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return true;
});

// ──────────────────────────────────────────────────────────────
//  IPC: TMDB proxy (Movies & TV)
// ──────────────────────────────────────────────────────────────

function getTmdbApiKey() {
  const s = readSettings();
  if (s.tmdbApiKey) return s.tmdbApiKey;
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
    return cfg.tmdbApiKey || '';
  } catch { return ''; }
}

ipcMain.handle('tmdb-search', async (_e, query) => {
  const key = getTmdbApiKey();
  if (!key) return { results: [] };
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false`;
  return fetchJson(url);
});

ipcMain.handle('tmdb-search-tv', async (_e, query) => {
  const key = getTmdbApiKey();
  if (!key) return { results: [] };
  const url = `https://api.themoviedb.org/3/search/tv?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false`;
  return fetchJson(url);
});

ipcMain.handle('tmdb-details', async (_e, tmdbId) => {
  const key = getTmdbApiKey();
  if (!key) return null;
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${encodeURIComponent(key)}&append_to_response=credits`;
  return fetchJson(url);
});

ipcMain.handle('tmdb-tv-details', async (_e, tmdbId) => {
  const key = getTmdbApiKey();
  if (!key) return null;
  const url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${encodeURIComponent(key)}&append_to_response=credits`;
  return fetchJson(url);
});

ipcMain.handle('tmdb-genre-list', async () => {
  const key = getTmdbApiKey();
  if (!key) return [];
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${encodeURIComponent(key)}&language=en-US`;
  const data = await fetchJson(url);
  return data.genres || [];
});

ipcMain.handle('tmdb-tv-genre-list', async () => {
  const key = getTmdbApiKey();
  if (!key) return [];
  const url = `https://api.themoviedb.org/3/genre/tv/list?api_key=${encodeURIComponent(key)}&language=en-US`;
  const data = await fetchJson(url);
  return data.genres || [];
});

// ──────────────────────────────────────────────────────────────
//  IPC: IGDB proxy (Games — primary)
// ──────────────────────────────────────────────────────────────

let igdbAccessToken = '';
let igdbTokenExpiry  = 0;

function getIgdbCredentials() {
  const s = readSettings();
  let clientId     = s.igdbClientId     || '';
  let clientSecret = s.igdbClientSecret || '';
  if (!clientId || !clientSecret) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
      if (!clientId)     clientId     = cfg.igdbClientId     || '';
      if (!clientSecret) clientSecret = cfg.igdbClientSecret || '';
    } catch {}
  }
  return { clientId, clientSecret };
}

async function getIgdbToken() {
  if (igdbAccessToken && Date.now() < igdbTokenExpiry) return igdbAccessToken;
  const { clientId, clientSecret } = getIgdbCredentials();
  if (!clientId || !clientSecret) return '';
  const url = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`;
  const data = await postJson(url, {}, '');
  igdbAccessToken  = data.access_token;
  igdbTokenExpiry  = Date.now() + (data.expires_in * 1000) - 60000;
  return igdbAccessToken;
}

ipcMain.handle('igdb-search', async (_e, query) => {
  const { clientId } = getIgdbCredentials();
  if (!clientId) return [];
  const token = await getIgdbToken();
  if (!token) return [];
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
    const baseUrl = cfg.igdbProxyUrl || 'https://api.igdb.com/v4';
    const body = `search "${query.replace(/"/g, '\\"')}"; fields name,cover.image_id,first_release_date,genres.name,platforms.id,platforms.name,summary; limit 10;`;
    return await postJson(`${baseUrl}/games`, {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
    }, body);
  } catch (e) {
    console.error('IGDB search error:', e.message);
    return [];
  }
});

ipcMain.handle('igdb-details', async (_e, igdbId) => {
  const { clientId } = getIgdbCredentials();
  if (!clientId || !igdbId) return null;
  const token = await getIgdbToken();
  if (!token) return null;
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
    const baseUrl = cfg.igdbProxyUrl || 'https://api.igdb.com/v4';
    const body = `fields involved_companies.company.name,involved_companies.developer,involved_companies.publisher; where id = ${igdbId};`;
    const data = await postJson(`${baseUrl}/games`, {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
    }, body);
    return (data && data[0]) ? data[0] : null;
  } catch (e) {
    console.error('IGDB details error:', e.message);
    return null;
  }
});

// ──────────────────────────────────────────────────────────────
//  IPC: RAWG proxy (Games — fallback)
// ──────────────────────────────────────────────────────────────

function getRawgApiKey() {
  const s = readSettings();
  if (s.rawgApiKey) return s.rawgApiKey;
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
    return cfg.rawgApiKey || '';
  } catch { return ''; }
}

ipcMain.handle('rawg-search', async (_e, query) => {
  const key = getRawgApiKey();
  if (!key) return { results: [] };
  const url = `https://api.rawg.io/api/games?key=${encodeURIComponent(key)}&search=${encodeURIComponent(query)}&page_size=10`;
  return fetchJson(url);
});

ipcMain.handle('rawg-details', async (_e, rawgId) => {
  const key = getRawgApiKey();
  if (!key) return null;
  const url = `https://api.rawg.io/api/games/${rawgId}?key=${encodeURIComponent(key)}`;
  return fetchJson(url);
});

// ──────────────────────────────────────────────────────────────
//  IPC: Poster download (Movies & TV)
// ──────────────────────────────────────────────────────────────

ipcMain.handle('download-poster', async (_e, tmdbId, posterPath) => {
  try {
    const key = getTmdbApiKey();
    if (!key || !posterPath || !tmdbId) return false;
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
    const imgBase = cfg.tmdbImageBase || 'https://image.tmdb.org/t/p/w500';
    const dir = postersDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, `${tmdbId}.jpg`);
    if (fs.existsSync(dest)) return true;
    await downloadFile(`${imgBase}${posterPath}`, dest);
    return true;
  } catch (e) {
    console.error(`Failed to download poster for ${tmdbId}:`, e.message);
    return false;
  }
});

ipcMain.handle('download-posters', async () => {
  const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
  let movies = [];
  try { movies = JSON.parse(fs.readFileSync(moviesPath(), 'utf-8')); } catch {}
  let tvshows = [];
  try { tvshows = JSON.parse(fs.readFileSync(tvshowsPath(), 'utf-8')); } catch {}
  const allItems = [...movies, ...tvshows];
  const imgBase = cfg.tmdbImageBase || 'https://image.tmdb.org/t/p/w500';
  const dir = postersDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let downloaded = 0, skipped = 0, failed = 0;
  const total = allItems.length;

  for (let i = 0; i < allItems.length; i++) {
    const m = allItems[i];
    const dest = path.join(dir, `${m.tmdbId}.jpg`);
    mainWindow.webContents.send('poster-progress', {
      current: i + 1, total, title: m.title,
      downloaded, skipped, failed,
    });
    if (fs.existsSync(dest)) { skipped++; continue; }
    if (!m.posterPath) { failed++; continue; }
    try {
      await downloadFile(`${imgBase}${m.posterPath}`, dest);
      downloaded++;
    } catch { failed++; }
    await new Promise(r => setTimeout(r, 200));
  }
  return { downloaded, skipped, failed, total };
});

ipcMain.handle('get-poster-path', (_e, tmdbId) => {
  const dir = postersDir();
  const p = path.join(dir, `${tmdbId}.jpg`);
  if (fs.existsSync(p)) return `file://${p}`;
  return null;
});

ipcMain.handle('reveal-posters', () => {
  const dir = postersDir();
  if (fs.existsSync(dir)) shell.openPath(dir);
});

// ──────────────────────────────────────────────────────────────
//  IPC: Cover download (Games)
// ──────────────────────────────────────────────────────────────

ipcMain.handle('download-cover', async (_e, gameId, coverUrl) => {
  try {
    if (!coverUrl || !gameId) return false;
    const dir = coversDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, `${gameId}.jpg`);
    if (fs.existsSync(dest)) return true;
    await downloadFile(coverUrl, dest);
    return true;
  } catch (e) {
    console.error(`Failed to download cover for ${gameId}:`, e.message);
    return false;
  }
});

ipcMain.handle('download-covers', async () => {
  let games = [];
  try { games = JSON.parse(fs.readFileSync(gamesPath(), 'utf-8')); } catch {}
  const dir = coversDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let downloaded = 0, skipped = 0, failed = 0;
  const total = games.length;

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const coverId = g.igdbId || g.rawgId;
    const dest = path.join(dir, `${coverId}.jpg`);
    mainWindow.webContents.send('cover-progress', {
      current: i + 1, total, title: g.title,
      downloaded, skipped, failed,
    });
    if (!coverId) { failed++; continue; }
    if (fs.existsSync(dest)) { skipped++; continue; }
    if (!g.coverPath) { failed++; continue; }
    try {
      await downloadFile(g.coverPath, dest);
      downloaded++;
    } catch { failed++; }
    await new Promise(r => setTimeout(r, 200));
  }
  return { downloaded, skipped, failed, total };
});

ipcMain.handle('get-cover-path', (_e, gameId) => {
  const dir = coversDir();
  const p = path.join(dir, `${gameId}.jpg`);
  if (fs.existsSync(p)) return `file://${p}`;
  return null;
});

ipcMain.handle('reveal-covers', () => {
  const dir = coversDir();
  if (fs.existsSync(dir)) shell.openPath(dir);
});

// ──────────────────────────────────────────────────────────────
//  IPC: Letterboxd import
// ──────────────────────────────────────────────────────────────

ipcMain.handle('parse-letterboxd', async (_e, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.zip') throw new Error('Please provide a Letterboxd export .zip file');

  const AdmZip = require('adm-zip');
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();

  let ratings = [];
  const ratingsEntry = entries.find(e => e.entryName.endsWith('ratings.csv'));
  if (ratingsEntry) {
    ratings = parseCsv(ratingsEntry.getData().toString('utf-8'));
  }

  let watched = [];
  const watchedEntry = entries.find(e => e.entryName.endsWith('watched.csv'));
  if (watchedEntry) {
    watched = parseCsv(watchedEntry.getData().toString('utf-8'));
  }

  const mergedMap = new Map();
  for (const r of ratings) {
    const key = `${r.name}|${r.year}`;
    mergedMap.set(key, { ...r, watched: true });
  }
  for (const w of watched) {
    const key = `${w.name}|${w.year}`;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...w, rating: 0, watched: true });
    }
  }
  return Array.from(mergedMap.values());
});

ipcMain.handle('pick-letterboxd-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Letterboxd Export',
    filters: [{ name: 'Letterboxd Export', extensions: ['zip'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

// ──────────────────────────────────────────────────────────────
//  IPC: HTML import (YouTube, Movies Anywhere, Fandango)
// ──────────────────────────────────────────────────────────────

function parseMoviesAnywhereTitles(html) {
  const skip = new Set(['add profile', 'web - my movies legal studios texts']);
  const re = /alt="([^"]+)"/g;
  const titles = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = decodeHtmlEntities(m[1]).trim();
    if (!raw || skip.has(raw.toLowerCase())) continue;
    titles.add(raw);
  }
  return [...titles];
}

function parseYouTubeTitles(html) {
  const re = /class="style-scope ytd-grid-movie-renderer"\s+title="([^"]*)"/g;
  const titles = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = decodeHtmlEntities(m[1]).trim();
    if (!raw) continue;
    titles.add(raw);
  }
  return [...titles];
}

function parseFandangoTitles(html) {
  const re = /class="contentPosterWrapper"[^>]*>[\s\S]*?<img[^>]+alt="([^"]+)"/g;
  const titles = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = decodeHtmlEntities(m[1]).trim();
    if (!raw) continue;
    titles.add(raw);
  }
  return [...titles];
}

ipcMain.handle('parse-import-html', async (_e, filePath, sourceType) => {
  const html = fs.readFileSync(filePath, 'utf-8');
  switch (sourceType) {
    case 'youtube':          return parseYouTubeTitles(html);
    case 'movies-anywhere':  return parseMoviesAnywhereTitles(html);
    case 'fandango':         return parseFandangoTitles(html);
    default: throw new Error(`Unknown source type: ${sourceType}`);
  }
});

ipcMain.handle('pick-import-html-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Saved HTML File',
    filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

// ──────────────────────────────────────────────────────────────
//  IPC: CSV import (Games)
// ──────────────────────────────────────────────────────────────

ipcMain.handle('parse-csv-import', async (_e, filePath) => {
  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const nameIdx = header.findIndex(h => /^(name|title|game)$/i.test(h));
  const platformIdx = header.findIndex(h => /^(platform|system|console)$/i.test(h));

  if (nameIdx < 0) {
    return lines.map(l => l.trim()).filter(Boolean).map(name => ({ name }));
  }

  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCsvLine(lines[i]);
    const name = nameIdx >= 0 ? (cols[nameIdx] || '').trim() : '';
    const platform = platformIdx >= 0 ? (cols[platformIdx] || '').trim() : '';
    if (name) entries.push({ name, platform });
  }
  return entries;
});

ipcMain.handle('pick-import-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Import File',
    filters: [{ name: 'Import Files', extensions: ['json', 'csv', 'txt'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

// ──────────────────────────────────────────────────────────────
//  IPC: Temp files & Reveal
// ──────────────────────────────────────────────────────────────

ipcMain.handle('save-temp-file', async (_e, buffer, filename) => {
  const tmp = path.join(app.getPath('temp'), `mmdb-${Date.now()}-${filename}`);
  fs.writeFileSync(tmp, Buffer.from(buffer));
  return tmp;
});
