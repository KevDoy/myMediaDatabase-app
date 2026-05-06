/* ============================================================
   My Media Database — Preload (Context Bridge)
   Unified: Movies + TV Shows + Games
   ============================================================ */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  /* ── Settings ─────────────────────────────────────────────── */
  getSettings:        ()       => ipcRenderer.invoke('get-settings'),
  saveSettings:       (s)      => ipcRenderer.invoke('save-settings', s),
  chooseLibraryDir:   ()       => ipcRenderer.invoke('choose-library-dir'),

  /* ── Config ───────────────────────────────────────────────── */
  getConfig:          ()       => ipcRenderer.invoke('get-config'),
  saveConfig:         (c)      => ipcRenderer.invoke('save-config', c),

  /* ── Movies ───────────────────────────────────────────────── */
  getMovies:          ()       => ipcRenderer.invoke('get-movies'),
  saveMovies:         (m)      => ipcRenderer.invoke('save-movies', m),

  /* ── TV Shows ─────────────────────────────────────────────── */
  getTvShows:         ()       => ipcRenderer.invoke('get-tvshows'),
  saveTvShows:        (s)      => ipcRenderer.invoke('save-tvshows', s),

  /* ── Games ────────────────────────────────────────────────── */
  getGames:           ()       => ipcRenderer.invoke('get-games'),
  saveGames:          (g)      => ipcRenderer.invoke('save-games', g),

  /* ── Game Systems ─────────────────────────────────────────── */
  getGameSystems:     ()       => ipcRenderer.invoke('get-gamesystems'),
  saveGameSystems:    (d)      => ipcRenderer.invoke('save-gamesystems', d),

  /* ── TMDB (Movies & TV) ──────────────────────────────────── */
  tmdbSearch:         (q)      => ipcRenderer.invoke('tmdb-search', q),
  tmdbSearchTv:       (q)      => ipcRenderer.invoke('tmdb-search-tv', q),
  tmdbDetails:        (id)     => ipcRenderer.invoke('tmdb-details', id),
  tmdbTvDetails:      (id)     => ipcRenderer.invoke('tmdb-tv-details', id),
  tmdbGenreList:      ()       => ipcRenderer.invoke('tmdb-genre-list'),
  tmdbTvGenreList:    ()       => ipcRenderer.invoke('tmdb-tv-genre-list'),

  /* ── RAWG (Games) ─────────────────────────────────────────── */
  rawgSearch:         (q)      => ipcRenderer.invoke('rawg-search', q),
  rawgDetails:        (id)     => ipcRenderer.invoke('rawg-details', id),

  /* ── IGDB (Games — primary) ──────────────────────────────── */
  igdbSearch:         (q)      => ipcRenderer.invoke('igdb-search', q),
  igdbDetails:        (id)     => ipcRenderer.invoke('igdb-details', id),

  /* ── Poster download ──────────────────────────────────────── */
  downloadPoster:     (id, p)  => ipcRenderer.invoke('download-poster', id, p),
  downloadPosters:    ()       => ipcRenderer.invoke('download-posters'),
  getPosterPath:      (id)     => ipcRenderer.invoke('get-poster-path', id),
  revealPosters:      ()       => ipcRenderer.invoke('reveal-posters'),
  onPosterProgress:   (cb)     => ipcRenderer.on('poster-progress', (_e, d) => cb(d)),

  /* ── Cover download ───────────────────────────────────────── */
  downloadCover:      (id, u)  => ipcRenderer.invoke('download-cover', id, u),
  downloadCovers:     ()       => ipcRenderer.invoke('download-covers'),
  getCoverPath:       (id)     => ipcRenderer.invoke('get-cover-path', id),
  revealCovers:       ()       => ipcRenderer.invoke('reveal-covers'),
  onCoverProgress:    (cb)     => ipcRenderer.on('cover-progress', (_e, d) => cb(d)),

  /* ── Letterboxd import ────────────────────────────────────── */
  parseLetterboxd:    (fp)     => ipcRenderer.invoke('parse-letterboxd', fp),
  pickLetterboxdFile: ()       => ipcRenderer.invoke('pick-letterboxd-file'),

  /* ── HTML import (Movies) ─────────────────────────────────── */
  parseImportHtml:    (fp, st) => ipcRenderer.invoke('parse-import-html', fp, st),
  pickImportHtmlFile: ()       => ipcRenderer.invoke('pick-import-html-file'),

  /* ── CSV import (Games) ───────────────────────────────────── */
  parseCsvImport:     (fp)     => ipcRenderer.invoke('parse-csv-import', fp),
  pickImportFile:     ()       => ipcRenderer.invoke('pick-import-file'),

  /* ── Utility ──────────────────────────────────────────────── */
  saveTempFile:       (b, n)   => ipcRenderer.invoke('save-temp-file', b, n),
});
