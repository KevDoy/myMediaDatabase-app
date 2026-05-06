/* ============================================================
   My Media Database — Unified Renderer
   Modes: Movies · TV Shows · Games
   ============================================================ */

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  //  STATE
  // ══════════════════════════════════════════════════════════════
  let movies     = [];
  let tvShows    = [];
  let games      = [];
  let config     = {};
  let settings   = {};
  let genreMap   = {};
  let tvGenreMap = {};
  let editIndex  = -1;
  let currentRating  = 0;
  let currentTags    = [];
  let batchQueue     = [];
  let viewMode       = 'grid';        // grid | list
  let manageMode     = 'movies';      // 'movies' | 'tv' | 'games'
  let savedLibraryScroll = 0;          // preserved scroll offset
  let activeGameApi   = 'igdb';        // 'igdb' | 'rawg'
  let availablePlatforms = [];        // from IGDB/RAWG search result

  const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
  const IGDB_IMG_SMALL = 'https://images.igdb.com/igdb/image/upload/t_cover_small/';
  const IGDB_IMG_BIG   = 'https://images.igdb.com/igdb/image/upload/t_cover_big/';

  // ══════════════════════════════════════════════════════════════
  //  CONSTANTS
  // ══════════════════════════════════════════════════════════════

  // ── Format logo map (Movies / TV) ──
  const FORMAT_LOGOS = {
    'VCD':             'logos/vcd.svg',
    'DVD':             'logos/dvd.svg',
    'Blu-Ray':         'logos/blu-ray.svg',
    'UHD Blu-Ray':     'logos/uhd-blu-ray.svg',
    '3D DVD':          'logos/dvd-3d.svg',
    '3D Blu-Ray':      'logos/blu-ray-3d.svg',
    'Apple TV':        'logos/apple-tv.svg',
    'YouTube':         'logos/youtube.svg',
    'Google Play':     'logos/google-play.svg',
    'Fandango At Home':'logos/fandango-at-home.svg',
    'Xfinity':         'logos/xfinity.svg',
    'Verizon':         'logos/verizon.svg',
    'DirecTV':         'logos/directv.svg',
    'Prime Video':     'logos/prime-video.svg',
    'Movies Anywhere': 'logos/moviesanywhere.png',
    'Plex':            'logos/plex.svg',
  };

  const PHYSICAL_FORMATS  = ['VCD', 'DVD', 'Blu-Ray', 'UHD Blu-Ray', '3D DVD', '3D Blu-Ray'];
  const DIGITAL_SERVICES  = ['Apple TV', 'YouTube', 'Google Play', 'Fandango At Home', 'Xfinity', 'Verizon', 'DirecTV', 'Prime Video', 'Movies Anywhere', 'Plex'];

  // ── Platform / Store / Condition definitions (Games) ──
  const PLATFORM_META = {
    'NES':                { family: 'Nintendo',   label: 'NES' },
    'SNES':               { family: 'Nintendo',   label: 'SNES' },
    'Nintendo 64':        { family: 'Nintendo',   label: 'N64' },
    'GameCube':           { family: 'Nintendo',   label: 'GameCube' },
    'Wii':                { family: 'Nintendo',   label: 'Wii' },
    'Wii U':              { family: 'Nintendo',   label: 'Wii U' },
    'Nintendo Switch':    { family: 'Nintendo',   label: 'Switch' },
    'Game Boy':           { family: 'Nintendo',   label: 'Game Boy' },
    'Game Boy Color':     { family: 'Nintendo',   label: 'GBC' },
    'Game Boy Advance':   { family: 'Nintendo',   label: 'GBA' },
    'Nintendo DS':        { family: 'Nintendo',   label: 'DS' },
    'Nintendo 3DS':       { family: 'Nintendo',   label: '3DS' },
    'PlayStation':        { family: 'PlayStation', label: 'PS1' },
    'PlayStation 2':      { family: 'PlayStation', label: 'PS2' },
    'PlayStation 3':      { family: 'PlayStation', label: 'PS3' },
    'PlayStation 4':      { family: 'PlayStation', label: 'PS4' },
    'PlayStation 5':      { family: 'PlayStation', label: 'PS5' },
    'PSP':                { family: 'PlayStation', label: 'PSP' },
    'PS Vita':            { family: 'PlayStation', label: 'PS Vita' },
    'Xbox':               { family: 'Xbox',       label: 'Xbox' },
    'Xbox 360':           { family: 'Xbox',       label: 'Xbox 360' },
    'Xbox One':           { family: 'Xbox',       label: 'Xbox One' },
    'Xbox Series S/X':    { family: 'Xbox',       label: 'Xbox Series' },
    'PC':                 { family: 'PC',         label: 'PC' },
    'macOS':              { family: 'PC',         label: 'macOS' },
    'Linux':              { family: 'PC',         label: 'Linux' },
    'Genesis':            { family: 'Sega',       label: 'Genesis' },
    'Sega Saturn':        { family: 'Sega',       label: 'Saturn' },
    'Dreamcast':          { family: 'Sega',       label: 'Dreamcast' },
    'Game Gear':          { family: 'Sega',       label: 'Game Gear' },
    'Sega Master System': { family: 'Sega',       label: 'Master System' },
    'Atari 2600':         { family: 'Atari',      label: 'Atari 2600' },
    'Atari 5200':         { family: 'Atari',      label: 'Atari 5200' },
    'Atari 7800':         { family: 'Atari',      label: 'Atari 7800' },
    'Atari Jaguar':       { family: 'Atari',      label: 'Jaguar' },
    'Atari Lynx':         { family: 'Atari',      label: 'Lynx' },
    // Mobile
    'Android':            { family: 'Mobile',     label: 'Android' },
    'iOS':                { family: 'Mobile',     label: 'iOS' },
    'iPadOS':             { family: 'Mobile',     label: 'iPadOS' },
    // Other
    'Neo Geo':            { family: 'Other',      label: 'Neo Geo' },
    'TurboGrafx-16':      { family: 'Other',      label: 'TurboGrafx-16' },
    '3DO':                { family: 'Other',      label: '3DO' },
  };

  const STORE_META = {
    'Steam':             { label: 'Steam' },
    'PlayStation Store': { label: 'PS Store' },
    'Xbox Store':        { label: 'Xbox Store' },
    'Nintendo eShop':    { label: 'eShop' },
    'Epic Games Store':  { label: 'Epic Games' },
    'GOG':               { label: 'GOG' },
    'Humble Bundle':     { label: 'Humble' },
    'EA App':            { label: 'EA App' },
    'Ubisoft Connect':   { label: 'Ubisoft' },
    'Battle.net':        { label: 'Battle.net' },
    'itch.io':           { label: 'itch.io' },
    'Amazon Luna':       { label: 'Luna' },
    'Google Play':       { label: 'Google Play' },
    'Apple App Store':   { label: 'Apple App Store' },
  };

  const CONDITIONS = [
    'Sealed / New',
    'Complete in Box with Manual',
    'Complete in Box',
    'Loose Disc',
    'Loose Cart',
    'Box Only',
    'Manual Only',
  ];

  const RAWG_PLATFORM_MAP = {
    'PC': 'PC', 'PlayStation 5': 'PlayStation 5', 'PlayStation 4': 'PlayStation 4',
    'PlayStation 3': 'PlayStation 3', 'PlayStation 2': 'PlayStation 2', 'PlayStation': 'PlayStation',
    'PS Vita': 'PS Vita', 'PSP': 'PSP', 'Xbox Series S/X': 'Xbox Series S/X',
    'Xbox One': 'Xbox One', 'Xbox 360': 'Xbox 360', 'Xbox': 'Xbox',
    'Nintendo Switch': 'Nintendo Switch', 'Wii U': 'Wii U', 'Wii': 'Wii',
    'GameCube': 'GameCube', 'Nintendo 64': 'Nintendo 64', 'SNES': 'SNES', 'NES': 'NES',
    'Nintendo 3DS': 'Nintendo 3DS', 'Nintendo DS': 'Nintendo DS',
    'Game Boy Advance': 'Game Boy Advance', 'Game Boy Color': 'Game Boy Color', 'Game Boy': 'Game Boy',
    'macOS': 'macOS', 'Linux': 'Linux', 'Dreamcast': 'Dreamcast',
    'Sega Saturn': 'Sega Saturn', 'Genesis': 'Genesis', 'Game Gear': 'Game Gear',
    'SEGA Master System': 'Sega Master System',
    'Atari 2600': 'Atari 2600', 'Atari 5200': 'Atari 5200', 'Atari 7800': 'Atari 7800',
    'Atari Jaguar': 'Atari Jaguar', 'Atari Lynx': 'Atari Lynx',
    'Neo Geo': 'Neo Geo', '3DO': '3DO',
    'iOS': 'iOS', 'Android': 'Android',
  };

  const IGDB_PLATFORM_MAP = {
    6: 'PC', 14: 'macOS', 3: 'Linux',
    7: 'PlayStation', 8: 'PlayStation 2', 9: 'PlayStation 3',
    48: 'PlayStation 4', 167: 'PlayStation 5', 38: 'PSP', 46: 'PS Vita',
    11: 'Xbox', 12: 'Xbox 360', 49: 'Xbox One', 169: 'Xbox Series S/X',
    18: 'NES', 19: 'SNES', 4: 'Nintendo 64', 21: 'GameCube',
    5: 'Wii', 41: 'Wii U', 130: 'Nintendo Switch',
    33: 'Game Boy', 22: 'Game Boy Color', 24: 'Game Boy Advance',
    20: 'Nintendo DS', 37: 'Nintendo 3DS',
    29: 'Genesis', 32: 'Sega Saturn', 23: 'Dreamcast',
    35: 'Game Gear', 64: 'Sega Master System',
    59: 'Atari 2600', 66: 'Atari 5200', 60: 'Atari 7800',
    62: 'Atari Jaguar', 61: 'Atari Lynx',
    // Mobile
    34: 'Android', 39: 'iOS',
    // Other
    80: 'Neo Geo', 86: 'TurboGrafx-16', 50: '3DO',
  };

  // ══════════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════════

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  function formatPill(name) {
    const logo = FORMAT_LOGOS[name];
    const img = logo ? `<img src="${logo}" alt="" class="chip-logo" style="width:14px;height:14px;object-fit:contain;border-radius:2px;">` : '';
    return `<span class="modal-format-pill">${img}${esc(name)}</span>`;
  }

  function ratingStars(r) {
    if (!r) return '';
    let s = '';
    for (let i = 1; i <= 5; i++) {
      if (r >= i) s += '\u2605';
      else if (r >= i - 0.5) s += '\u00BD';
    }
    return s;
  }

  function isGamesMode()  { return manageMode === 'games'; }
  function isTvMode()     { return manageMode === 'tv'; }
  function isMoviesMode() { return manageMode === 'movies'; }
  function isIgdbMode()   { return activeGameApi === 'igdb'; }

  // ══════════════════════════════════════════════════════════════
  //  BOOT
  // ══════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', async () => {
    settings = await window.api.getSettings();
    if (!settings.libraryPath) {
      showSetup();
    } else {
      await loadLibrary();
      navigate('library');
    }
    bindNavigation();
    bindModeToggle();
    bindGameApiToggle();
    bindSetup();
    bindLibrary();
    bindAddEdit();
    bindBatch();
    bindImport();
    bindSettings();
    bindSeasonsBuilder();
    renderCustomFieldCheckboxes();
  });

  // ══════════════════════════════════════════════════════════════
  //  NAVIGATION
  // ══════════════════════════════════════════════════════════════

  function bindNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.view));
    });
  }

  function navigate(view) {
    // Save library scroll position before switching away
    const content = document.getElementById('content');
    const currentView = document.querySelector('.view.active');
    if (currentView && currentView.id === 'view-library' && content) {
      savedLibraryScroll = content.scrollTop;
    }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add('active');
    if (view === 'library') {
      renderLibrary();
      // Restore scroll position after render
      if (content) requestAnimationFrame(() => { content.scrollTop = savedLibraryScroll; });
    }
    if (view === 'settings') populateSettings();
  }

  function showSetup() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-setup').classList.add('active');
  }

  // ══════════════════════════════════════════════════════════════
  //  MODE TOGGLE (Movies / TV / Games)
  // ══════════════════════════════════════════════════════════════

  function updateModeToggle() {
    const toggle = document.getElementById('mode-toggle');
    if (!toggle) return;
    // Show/hide individual buttons based on config
    const tvBtn = toggle.querySelector('[data-mode="tv"]');
    const gBtn  = toggle.querySelector('[data-mode="games"]');
    if (tvBtn) tvBtn.style.display = config.tvShows === false ? 'none' : '';
    if (gBtn)  gBtn.style.display  = config.games  === false ? 'none' : '';

    // If the active mode was hidden, fall back to movies
    if (manageMode === 'tv' && config.tvShows === false) {
      manageMode = 'movies';
      toggle.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'movies'));
    }
    if (manageMode === 'games' && config.games === false) {
      manageMode = 'movies';
      toggle.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'movies'));
    }
  }

  function bindModeToggle() {
    const toggle = document.getElementById('mode-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === manageMode) return;
        manageMode = mode;
        toggle.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        resetForm();
        updateCount();
        populateFilters();
        renderLibrary();
        updateModeUI();
        // Clear batch queue when switching to avoid cross-type items
        batchQueue = [];
        renderBatchQueue();
      });
    });
  }

  // ── Game API Toggle (IGDB / RAWG) ──
  function bindGameApiToggle() {
    const toggle = document.getElementById('game-api-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('[data-game-api]').forEach(btn => {
      btn.addEventListener('click', () => {
        const api = btn.dataset.gameApi;
        if (api === activeGameApi) return;
        activeGameApi = api;
        toggle.querySelectorAll('[data-game-api]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Clear search results
        const list = document.getElementById('rawg-results-list');
        if (list) { list.innerHTML = ''; list.classList.remove('open'); }
        // Update labels
        const rawgLabel = document.querySelector('#rawg-search-wrapper > label');
        if (rawgLabel) rawgLabel.textContent = isIgdbMode() ? 'Search IGDB' : 'Search RAWG';
        const batchLabel = document.getElementById('batch-label');
        if (batchLabel) batchLabel.textContent = isIgdbMode() ? 'Search IGDB to add to queue' : 'Search RAWG to add to queue';
      });
    });
    updateGameApiToggle();
  }

  function updateGameApiToggle() {
    const toggle = document.getElementById('game-api-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('[data-game-api]').forEach(b => b.classList.remove('active'));
    toggle.querySelector(`[data-game-api="${activeGameApi}"]`)?.classList.add('active');
  }

  /** Update all mode-sensitive UI (labels, visibility, form toggles) */
  function updateModeUI() {
    const gm = isGamesMode();
    const tv = isTvMode();

    // ── Search wrappers ──
    const tmdbWrap = document.getElementById('tmdb-search-wrapper');
    const rawgWrap = document.getElementById('rawg-search-wrapper');
    if (tmdbWrap) tmdbWrap.style.display = gm ? 'none' : '';
    if (rawgWrap) rawgWrap.style.display = gm ? '' : 'none';

    // ── Game API toggle ──
    const gameApiToggle = document.getElementById('game-api-toggle');
    if (gameApiToggle) gameApiToggle.style.display = gm ? '' : 'none';
    const rawgLabel = document.querySelector('#rawg-search-wrapper > label');
    if (rawgLabel) rawgLabel.textContent = isIgdbMode() ? 'Search IGDB' : 'Search RAWG';

    // ── Nav labels ──
    const addLabel = document.getElementById('nav-add-label');
    if (addLabel) addLabel.textContent = gm ? 'Add Game' : tv ? 'Add TV Show' : 'Add Movie';

    // ── Library filter toggles ──
    const fmtFilter  = document.getElementById('lib-format-filter');
    const platFilter = document.getElementById('lib-platform-filter');
    if (fmtFilter)  fmtFilter.style.display  = gm ? 'none' : '';
    if (platFilter) platFilter.style.display = gm ? '' : 'none';

    // ── Add/Edit form sections ──
    const movieFmtGroup = document.getElementById('movie-formats-group');
    const tvGroup       = document.getElementById('tv-seasons-group');
    const copiesGroup   = document.getElementById('copies-group');
    const watchedGroup  = document.getElementById('watched-group');
    const playedGroup   = document.getElementById('played-group');
    if (movieFmtGroup) movieFmtGroup.style.display = (!gm && !tv) ? '' : 'none';
    if (tvGroup)       tvGroup.style.display        = tv ? '' : 'none';
    if (copiesGroup)   copiesGroup.style.display     = gm ? '' : 'none';
    if (watchedGroup)  watchedGroup.style.display     = gm ? 'none' : '';
    if (playedGroup)   playedGroup.style.display      = gm ? '' : 'none';

    // ── Heading & save button labels ──
    const typeLabel = gm ? 'Game' : tv ? 'TV Show' : 'Movie';
    const heading = document.getElementById('add-heading');
    const saveBtn = document.getElementById('btn-save');
    const dateLabel = document.getElementById('f-date-label');
    if (heading) heading.textContent = editIndex >= 0 ? `Edit ${typeLabel}` : `Add ${typeLabel}`;
    if (saveBtn) saveBtn.textContent = editIndex >= 0 ? `Update ${typeLabel}` : `Add ${typeLabel}`;
    if (dateLabel) dateLabel.textContent = tv ? 'First Air Date' : 'Release Date';

    // ── Search input placeholder ──
    const tmdbInput = document.getElementById('tmdb-search-input');
    if (tmdbInput) tmdbInput.placeholder = tv ? 'Type a TV show title\u2026' : 'Type a movie title\u2026';

    // ── Batch UI ──
    const batchHeading    = document.getElementById('batch-heading');
    const batchDesc       = document.getElementById('batch-description');
    const batchInput      = document.getElementById('batch-search-input');
    const batchLabel      = document.getElementById('batch-search-label');
    const batchMovieFmts  = document.getElementById('batch-movie-formats');
    const batchTvFmts     = document.getElementById('batch-tv-formats');
    const batchGamePresets = document.getElementById('batch-game-presets');
    if (batchHeading) batchHeading.textContent = gm ? 'Batch Add Games' : tv ? 'Batch Add TV Shows' : 'Batch Add Movies';
    if (batchDesc) batchDesc.textContent = gm
      ? 'Search and queue multiple games, then add them all at once.'
      : tv
        ? 'Search and queue multiple TV shows, then add them all at once. Select digital services to assign as a box set.'
        : 'Search and queue multiple movies, then add them all at once. Great for cataloging an entire digital library like Apple TV.';
    if (batchInput) batchInput.placeholder = gm ? 'Type a game title\u2026' : tv ? 'Type a TV show title\u2026' : 'Type a movie title\u2026';
    if (batchLabel) batchLabel.textContent = gm ? (isIgdbMode() ? 'Search IGDB to add to queue' : 'Search RAWG to add to queue') : 'Search TMDB to add to queue';
    if (batchMovieFmts)  batchMovieFmts.style.display  = (!gm && !tv) ? '' : 'none';
    if (batchTvFmts)     batchTvFmts.style.display      = tv ? '' : 'none';
    if (batchGamePresets) batchGamePresets.style.display  = gm ? '' : 'none';

    // ── Import cards ──
    document.querySelectorAll('.movie-import').forEach(el => { el.style.display = gm ? 'none' : ''; });
    document.querySelectorAll('.game-import').forEach(el => { el.style.display = gm ? '' : 'none'; });
    const importDesc = document.getElementById('import-description');
    if (importDesc) importDesc.textContent = gm
      ? 'Import your game library from CSV or text files.'
      : 'Import your library from various digital platforms and services.';
  }

  // ══════════════════════════════════════════════════════════════
  //  SETUP
  // ══════════════════════════════════════════════════════════════

  function bindSetup() {
    document.getElementById('setup-choose-dir').addEventListener('click', async () => {
      const dir = await window.api.chooseLibraryDir();
      if (!dir) return;
      await window.api.saveSettings({ libraryPath: dir });
      settings.libraryPath = dir;
      await loadLibrary();
      navigate('library');
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  LOAD LIBRARY
  // ══════════════════════════════════════════════════════════════

  async function loadLibrary() {
    try {
      config  = await window.api.getConfig();
      movies  = await window.api.getMovies();
      tvShows = await window.api.getTvShows();
      games   = await window.api.getGames();
    } catch (e) {
      console.error('Failed to load library:', e);
    }
    // Genre maps (non-critical)
    try {
      const genres = await window.api.tmdbGenreList();
      genreMap = {};
      genres.forEach(g => { genreMap[g.id] = g.name; });
    } catch (e) { console.warn('Could not load TMDB genres:', e); }
    try {
      const tvGenres = await window.api.tmdbTvGenreList();
      tvGenreMap = {};
      tvGenres.forEach(g => { tvGenreMap[g.id] = g.name; });
    } catch (e) { console.warn('Could not load TMDB TV genres:', e); }

    // Set active game API from config
    activeGameApi = config.gameApi === 'rawg' ? 'rawg' : 'igdb';
    updateGameApiToggle();

    updateModeToggle();
    updateCount();
    populateFilters();
    renderLibrary();
    renderCustomFieldCheckboxes();
    populateBatchPlatforms();
    updateModeUI();
  }

  function updateCount() {
    const el = document.getElementById('sidebar-count');
    if (!el) return;
    if (isGamesMode()) {
      el.textContent = `${games.length} game${games.length !== 1 ? 's' : ''}`;
    } else {
      const data = isTvMode() ? tvShows : movies;
      const label = isTvMode() ? 'show' : 'title';
      el.textContent = `${data.length} ${label}${data.length !== 1 ? 's' : ''}`;
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  LIBRARY VIEW
  // ══════════════════════════════════════════════════════════════

  function bindLibrary() {
    document.getElementById('lib-search')?.addEventListener('input', debounce(() => renderLibrary(), 200));
    document.getElementById('lib-genre-filter')?.addEventListener('change', () => renderLibrary());
    document.getElementById('lib-format-filter')?.addEventListener('change', () => renderLibrary());
    document.getElementById('lib-platform-filter')?.addEventListener('change', () => renderLibrary());
    document.getElementById('lib-sort')?.addEventListener('change', () => renderLibrary());

    document.getElementById('view-toggle')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      viewMode = btn.dataset.mode;
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === viewMode));
      renderLibrary();
    });
  }

  function populateFilters() {
    if (isGamesMode()) {
      // Genres
      const genreSet = new Set();
      games.forEach(g => (g.genres || []).forEach(genre => genreSet.add(genre)));
      const genreSelect = document.getElementById('lib-genre-filter');
      if (genreSelect) {
        genreSelect.innerHTML = '<option value="">All Genres</option>' +
          [...genreSet].sort().map(g => `<option value="${g}">${g}</option>`).join('');
      }
      // Platforms
      const platSet = new Set();
      games.forEach(g => (g.copies || []).forEach(c => { if (c.platform) platSet.add(c.platform); }));
      const platSelect = document.getElementById('lib-platform-filter');
      if (platSelect) {
        platSelect.innerHTML = '<option value="">All Platforms</option>' +
          [...platSet].sort().map(p => `<option value="${p}">${PLATFORM_META[p]?.label || p}</option>`).join('');
      }
    } else {
      const data = isTvMode() ? tvShows : movies;
      // Genres
      const genreSet = new Set();
      data.forEach(m => (m.genres || []).forEach(g => genreSet.add(g)));
      const genreSelect = document.getElementById('lib-genre-filter');
      if (genreSelect) {
        genreSelect.innerHTML = '<option value="">All Genres</option>' +
          [...genreSet].sort().map(g => `<option value="${g}">${g}</option>`).join('');
      }
      // Formats
      const fmtSet = new Set();
      if (isTvMode()) {
        data.forEach(s => {
          (s.seasons || []).forEach(sn => {
            if (sn.physical) fmtSet.add(sn.physical);
            (sn.digital || []).forEach(f => fmtSet.add(f));
          });
          if (s.boxSet?.physical) fmtSet.add(s.boxSet.physical);
          if (Array.isArray(s.boxSet?.digital)) s.boxSet.digital.forEach(f => fmtSet.add(f));
        });
      } else {
        data.forEach(m => {
          [...(m.formats?.physical || []), ...(m.formats?.digital || [])].forEach(f => fmtSet.add(f));
        });
      }
      const fmtSelect = document.getElementById('lib-format-filter');
      if (fmtSelect) {
        fmtSelect.innerHTML = '<option value="">All Formats</option>' +
          [...fmtSet].sort().map(f => `<option value="${f}">${f}</option>`).join('');
      }
    }
  }

  // ── Filtering ──

  function getFilteredItems() {
    if (isGamesMode()) return getFilteredGames();
    return getFilteredMoviesTv();
  }

  function getFilteredMoviesTv() {
    const search = (document.getElementById('lib-search')?.value || '').toLowerCase().trim();
    const genre  = document.getElementById('lib-genre-filter')?.value || '';
    const format = document.getElementById('lib-format-filter')?.value || '';
    const sort   = document.getElementById('lib-sort')?.value || 'title-asc';
    const tv = isTvMode();
    const data = tv ? tvShows : movies;

    let list = data.filter(m => {
      if (search) {
        const hay = `${m.title} ${m.director || ''} ${m.creator || ''} ${(m.cast||[]).join(' ')} ${(m.genres||[]).join(' ')} ${(m.tags||[]).join(' ')}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (genre && !(m.genres || []).includes(genre)) return false;
      if (format) {
        if (tv) {
          const allFmts = new Set();
          (m.seasons || []).forEach(s => { if (s.physical) allFmts.add(s.physical); (s.digital || []).forEach(f => allFmts.add(f)); });
          if (m.boxSet?.physical) allFmts.add(m.boxSet.physical);
          if (Array.isArray(m.boxSet?.digital)) m.boxSet.digital.forEach(f => allFmts.add(f));
          if (!allFmts.has(format)) return false;
        } else {
          const all = [...(m.formats?.physical || []), ...(m.formats?.digital || [])];
          if (!all.includes(format)) return false;
        }
      }
      return true;
    });

    const [field, dir] = sort.split('-');
    list.sort((a, b) => {
      let va, vb;
      if (field === 'title')      { va = a.title?.toLowerCase() || ''; vb = b.title?.toLowerCase() || ''; }
      else if (field === 'date')  { va = (tv ? a.firstAirDate : a.releaseDate) || ''; vb = (tv ? b.firstAirDate : b.releaseDate) || ''; }
      else if (field === 'rating'){ va = a.rating || 0; vb = b.rating || 0; }
      else if (field === 'added') { return dir === 'desc' ? 1 : -1; }
      else { va = a.title; vb = b.title; }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    if (field === 'added' && dir === 'desc') list.reverse();
    return list;
  }

  function getFilteredGames() {
    const search   = (document.getElementById('lib-search')?.value || '').toLowerCase().trim();
    const genre    = document.getElementById('lib-genre-filter')?.value || '';
    const platform = document.getElementById('lib-platform-filter')?.value || '';
    const sort     = document.getElementById('lib-sort')?.value || 'title-asc';

    let list = games.filter(g => {
      if (search) {
        const hay = `${g.title} ${g.developer || ''} ${g.publisher || ''} ${(g.genres||[]).join(' ')} ${(g.tags||[]).join(' ')}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (genre && !(g.genres || []).includes(genre)) return false;
      if (platform && !(g.copies || []).some(c => c.platform === platform)) return false;
      return true;
    });

    const [field, dir] = sort.split('-');
    list.sort((a, b) => {
      let va, vb;
      if (field === 'title')      { va = a.title?.toLowerCase() || ''; vb = b.title?.toLowerCase() || ''; }
      else if (field === 'date')  { va = a.releaseDate || ''; vb = b.releaseDate || ''; }
      else if (field === 'rating'){ va = a.rating || 0; vb = b.rating || 0; }
      else if (field === 'added') { return dir === 'desc' ? 1 : -1; }
      else { va = a.title; vb = b.title; }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    if (field === 'added' && dir === 'desc') list.reverse();
    return list;
  }

  // ── Poster / Cover src helpers ──

  function getPosterSrc(movie) {
    const mode = config.posterMode || 'local';
    if (mode === 'local' && settings.libraryPath && movie.tmdbId) {
      return `file://${settings.libraryPath}/posters/${movie.tmdbId}.jpg`;
    }
    if (movie.posterPath) return `${config.tmdbImageBase || TMDB_IMG}${movie.posterPath}`;
    return null;
  }

  function getCoverSrc(game) {
    const mode = config.coverMode || 'remote';
    const coverId = game.igdbId || game.rawgId;
    if (mode === 'local' && settings.libraryPath && coverId) {
      return `file://${settings.libraryPath}/covers/${coverId}.jpg`;
    }
    if (game.coverPath) return game.coverPath;
    return null;
  }

  function getItemImageSrc(item) {
    return isGamesMode() ? getCoverSrc(item) : getPosterSrc(item);
  }

  // ── Render ──

  function renderLibrary() {
    const container = document.getElementById('library-container');
    if (!container) return;

    if (isGamesMode()) { renderLibraryGames(container); }
    else               { renderLibraryMoviesTv(container); }
  }

  function renderLibraryMoviesTv(container) {
    const filtered = getFilteredMoviesTv();
    const tv = isTvMode();
    const data = tv ? tvShows : movies;
    const emptyLabel = tv ? 'TV shows' : 'movies';

    if (filtered.length === 0) {
      container.className = '';
      container.innerHTML = `<div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 48c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20zm-2-30h4v12h-4V22zm0 16h4v4h-4v-4z"/></svg>
        <p>${data.length === 0 ? `Your library is empty. Add some ${emptyLabel} to get started!` : `No ${emptyLabel} match your filters.`}</p>
      </div>`;
      return;
    }

    if (viewMode === 'grid') {
      container.className = 'library-grid';
      container.innerHTML = filtered.map(m => {
        const idx = data.indexOf(m);
        const posterSrc = getPosterSrc(m);
        const stars = ratingStars(m.rating);
        const year = (tv ? m.firstAirDate : m.releaseDate) ? (tv ? m.firstAirDate : m.releaseDate).substring(0, 4) : '';
        const seasonsBadge = tv && m.totalSeasons ? `<div class="card-seasons">${m.totalSeasons} Season${m.totalSeasons !== 1 ? 's' : ''}</div>` : '';
        const watchedBadge = m.watched ? '<div class="card-watched" title="Watched">\u2713 Watched</div>' : '';
        return `
          <div class="movie-card${m.watched ? ' is-watched' : ''}" data-index="${idx}">
            ${posterSrc
              ? `<img class="poster" src="${esc(posterSrc)}" alt="${esc(m.title)}" loading="lazy">`
              : `<div class="poster-placeholder">${esc(m.title?.charAt(0) || '?')}</div>`}
            <div class="card-info">
              <div class="card-title" title="${esc(m.title)}">${esc(m.title)}</div>
              <div class="card-year">${year}</div>
              ${seasonsBadge}
              ${stars ? `<div class="card-stars">${stars}</div>` : ''}
              ${watchedBadge}
            </div>
          </div>`;
      }).join('');
    } else {
      container.className = '';
      const hdr = `<div class="list-header"><span></span><span>Title</span><span>Year</span><span>${tv ? 'Seasons' : 'Formats'}</span><span>Rating</span><span></span></div>`;
      container.innerHTML = hdr + '<div class="library-list">' + filtered.map(m => {
        const idx = data.indexOf(m);
        const posterSrc = getPosterSrc(m);
        const year = (tv ? m.firstAirDate : m.releaseDate) ? (tv ? m.firstAirDate : m.releaseDate).substring(0, 4) : '';
        let col = '';
        if (tv) {
          col = `<span class="row-formats">${m.totalSeasons || 0} Season${(m.totalSeasons || 0) !== 1 ? 's' : ''}</span>`;
        } else {
          const formats = [...(m.formats?.physical || []), ...(m.formats?.digital || [])];
          const icons = formats.map(f => { const l = FORMAT_LOGOS[f]; return l ? `<img src="${l}" alt="${esc(f)}" title="${esc(f)}" class="row-format-icon">` : ''; }).filter(Boolean).join('');
          col = `<span class="row-formats" title="${esc(formats.join(', '))}">${icons || esc(formats.join(', '))}</span>`;
        }
        return `
          <div class="list-row" data-index="${idx}">
            ${posterSrc ? `<img class="row-poster" src="${esc(posterSrc)}" alt="" loading="lazy">` : '<div class="row-poster-placeholder"></div>'}
            <span class="row-title">${esc(m.title)}${m.watched ? ' <span class="watched-badge" title="Watched">\u2713</span>' : ''}</span>
            <span class="row-year">${year}</span>
            ${col}
            <span class="row-rating">${ratingStars(m.rating)}</span>
            <span class="row-actions"><button class="btn btn-sm" data-edit="${idx}">Edit</button></span>
          </div>`;
      }).join('') + '</div>';
    }

    bindLibraryClicks(container);
  }

  function renderLibraryGames(container) {
    const filtered = getFilteredGames();

    if (filtered.length === 0) {
      container.className = '';
      container.innerHTML = `<div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor"><path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 48c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20zm-2-30h4v12h-4V22zm0 16h4v4h-4v-4z"/></svg>
        <p>${games.length === 0 ? 'Your library is empty. Add some games to get started!' : 'No games match your filters.'}</p>
      </div>`;
      return;
    }

    if (viewMode === 'grid') {
      container.className = 'library-grid';
      container.innerHTML = filtered.map(g => {
        const idx = games.indexOf(g);
        const coverSrc = getCoverSrc(g);
        const stars = ratingStars(g.rating);
        const year = g.releaseDate ? g.releaseDate.substring(0, 4) : '';
        const platforms = [...new Set((g.copies || []).map(c => PLATFORM_META[c.platform]?.label || c.platform))].join(', ');
        const playedBadge = g.played ? '<div class="card-watched" title="Played">\u2713 Played</div>' : '';
        return `
          <div class="movie-card${g.played ? ' is-watched' : ''}" data-index="${idx}">
            ${coverSrc
              ? `<img class="poster" src="${esc(coverSrc)}" alt="${esc(g.title)}" loading="lazy">`
              : `<div class="poster-placeholder">${esc(g.title?.charAt(0) || '?')}</div>`}
            <div class="card-info">
              <div class="card-title" title="${esc(g.title)}">${esc(g.title)}</div>
              <div class="card-year">${year}</div>
              ${platforms ? `<div class="card-seasons">${esc(platforms)}</div>` : ''}
              ${stars ? `<div class="card-stars">${stars}</div>` : ''}
              ${playedBadge}
            </div>
          </div>`;
      }).join('');
    } else {
      container.className = '';
      const hdr = '<div class="list-header"><span></span><span>Title</span><span>Year</span><span>Platforms</span><span>Rating</span><span></span></div>';
      container.innerHTML = hdr + '<div class="library-list">' + filtered.map(g => {
        const idx = games.indexOf(g);
        const coverSrc = getCoverSrc(g);
        const year = g.releaseDate ? g.releaseDate.substring(0, 4) : '';
        const platforms = [...new Set((g.copies || []).map(c => PLATFORM_META[c.platform]?.label || c.platform))].join(', ');
        return `
          <div class="list-row" data-index="${idx}">
            ${coverSrc ? `<img class="row-poster" src="${esc(coverSrc)}" alt="" loading="lazy">` : '<div class="row-poster-placeholder"></div>'}
            <span class="row-title">${esc(g.title)}${g.played ? ' <span class="watched-badge" title="Played">\u2713</span>' : ''}</span>
            <span class="row-year">${year}</span>
            <span class="row-formats">${esc(platforms)}</span>
            <span class="row-rating">${ratingStars(g.rating)}</span>
            <span class="row-actions"><button class="btn btn-sm" data-edit="${idx}">Edit</button></span>
          </div>`;
      }).join('') + '</div>';
    }

    bindLibraryClicks(container);
  }

  function bindLibraryClicks(container) {
    container.querySelectorAll('[data-index]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit]')) return;
        openEditModal(parseInt(el.dataset.index));
      });
    });
    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate('add');
        startEdit(parseInt(btn.dataset.edit));
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  EDIT MODAL (quick view)
  // ══════════════════════════════════════════════════════════════

  function openEditModal(idx) {
    if (isGamesMode()) { openGameModal(idx); return; }
    openMovieTvModal(idx);
  }

  function openMovieTvModal(idx) {
    const tv = isTvMode();
    const data = tv ? tvShows : movies;
    const m = data[idx];
    if (!m) return;
    const modal = document.getElementById('edit-modal');
    const body  = document.getElementById('modal-body');
    document.getElementById('modal-title').textContent = m.title;
    const posterSrc = getPosterSrc(m);
    const year = (tv ? m.firstAirDate : m.releaseDate) ? (tv ? m.firstAirDate : m.releaseDate).substring(0, 4) : '';

    let detailsHtml = '';
    if (tv) {
      const creatorLine = m.creator ? `<div style="font-size:12px;color:var(--text-secondary)">Created by <strong>${esc(m.creator)}</strong></div>` : '';
      const castLine = m.cast?.length ? `<div style="font-size:12px;color:var(--text-secondary)">Cast: ${esc(m.cast.join(', '))}</div>` : '';
      const genresLine = m.genres?.length ? `<div style="font-size:12px;color:var(--text-secondary)">Genres: ${esc(m.genres.join(', '))}</div>` : '';
      const seasonsLine = m.totalSeasons ? `<div style="font-size:12px;color:var(--text-secondary)">${m.totalSeasons} Season${m.totalSeasons !== 1 ? 's' : ''}</div>` : '';
      let boxSetHtml = '';
      if (m.boxSet?.physical || (Array.isArray(m.boxSet?.digital) && m.boxSet.digital.length)) {
        const parts = [];
        if (m.boxSet.physical) parts.push(formatPill(m.boxSet.physical));
        if (Array.isArray(m.boxSet.digital)) m.boxSet.digital.forEach(f => parts.push(formatPill(f)));
        const boxSetBackedUp = m.boxSet.backedUp ? '<span class="backed-up-badge backed-up-badge-sm" title="Backed Up">💾</span>' : '';
        boxSetHtml = `<div style="margin-top:8px"><span class="format-heading">Box Set</span><div class="modal-format-pills">${parts.join('')}${boxSetBackedUp}</div></div>`;
      }
      let seasonsDetailHtml = '';
      if (m.seasons?.length) {
        seasonsDetailHtml = '<div style="margin-top:8px"><span class="format-heading">Seasons</span><div class="modal-seasons-list">';
        m.seasons.forEach(s => {
          const parts = [];
          if (s.physical) parts.push(formatPill(s.physical));
          (s.digital || []).forEach(f => parts.push(formatPill(f)));
          if (parts.length) {
            const seasonBackedUp = s.backedUp ? '<span class="backed-up-badge backed-up-badge-sm" title="Backed Up">💾</span>' : '';
            seasonsDetailHtml += `<div class="modal-season-row"><span class="modal-season-num">S${s.seasonNumber}</span><div class="modal-format-pills">${parts.join('')}${seasonBackedUp}</div></div>`;
          }
        });
        seasonsDetailHtml += '</div></div>';
      }
      detailsHtml = `${creatorLine}${castLine}${genresLine}${seasonsLine}
        <div style="color:var(--star-filled);font-size:14px;margin:4px 0">${ratingStars(m.rating) || '<span style="color:var(--text-muted)">Not rated</span>'}</div>
        ${m.overview ? `<div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-top:4px">${esc(m.overview)}</div>` : ''}
        ${boxSetHtml}${seasonsDetailHtml}
        ${m.tags?.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${m.tags.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('')}</div>` : ''}
        ${m.watched ? '<div style="margin-top:6px;font-size:12px;color:var(--success)">\u2713 Watched</div>' : '<div style="margin-top:6px;font-size:12px;color:var(--text-muted)">Unwatched</div>'}`;
    } else {
      const formats = [...(m.formats?.physical || []), ...(m.formats?.digital || [])];
      detailsHtml = `
        ${m.director ? `<div style="font-size:12px;color:var(--text-secondary)">Directed by <strong>${esc(m.director)}</strong></div>` : ''}
        ${m.cast?.length ? `<div style="font-size:12px;color:var(--text-secondary)">Cast: ${esc(m.cast.join(', '))}</div>` : ''}
        ${m.genres?.length ? `<div style="font-size:12px;color:var(--text-secondary)">Genres: ${esc(m.genres.join(', '))}</div>` : ''}
        <div style="color:var(--star-filled);font-size:14px;margin:4px 0">${ratingStars(m.rating) || '<span style="color:var(--text-muted)">Not rated</span>'}</div>
        ${m.overview ? `<div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-top:4px">${esc(m.overview)}</div>` : ''}
        ${formats.length ? `<div style="margin-top:8px"><span class="format-heading">Formats</span><div class="modal-format-pills">${formats.map(f => formatPill(f)).join('')}</div>${m.backedUp ? '<span class="backed-up-badge" title="Backed Up">\uD83D\uDCBE Backed Up</span>' : ''}</div>` : ''}
        ${(m.digitalQuality||[]).length ? `<div style="margin-top:4px"><span class="format-heading">Quality</span><div class="modal-format-pills">${m.digitalQuality.map(q => `<span class="modal-format-pill">${esc(q)}</span>`).join('')}</div></div>` : ''}
        ${m.tags?.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${m.tags.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('')}</div>` : ''}
        ${m.watched ? '<div style="margin-top:6px;font-size:12px;color:var(--success)">\u2713 Watched</div>' : '<div style="margin-top:6px;font-size:12px;color:var(--text-muted)">Unwatched</div>'}`;
    }

    body.innerHTML = `
      <div style="display:flex;gap:20px">
        <div style="flex-shrink:0">
          ${posterSrc
            ? `<img src="${esc(posterSrc)}" alt="" style="width:160px;border-radius:var(--radius);background:var(--bg-input);" onerror="this.style.display='none'">`
            : `<div style="width:160px;aspect-ratio:2/3;background:var(--bg-input);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">No Poster</div>`}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div><span style="font-size:18px;font-weight:700">${esc(m.title)}</span><span style="color:var(--text-muted);margin-left:6px">${year}</span></div>
          ${detailsHtml}
          <div style="margin-top:auto;padding-top:12px;display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" id="modal-edit-btn">Edit</button>
            <button class="btn btn-danger btn-sm" id="modal-delete-btn">Delete</button>
          </div>
        </div>
      </div>`;

    modal.style.display = 'flex';
    document.getElementById('modal-edit-btn').addEventListener('click', () => { modal.style.display = 'none'; navigate('add'); startEdit(idx); });
    document.getElementById('modal-delete-btn').addEventListener('click', async () => {
      if (confirm(`Remove "${m.title}" from your library?`)) {
        data.splice(idx, 1);
        if (tv) await window.api.saveTvShows(tvShows);
        else    await window.api.saveMovies(movies);
        modal.style.display = 'none';
        updateCount(); renderLibrary();
      }
    });
    document.getElementById('modal-close').onclick = () => { modal.style.display = 'none'; };
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  function openGameModal(idx) {
    const g = games[idx];
    if (!g) return;
    const modal = document.getElementById('edit-modal');
    const body  = document.getElementById('modal-body');
    document.getElementById('modal-title').textContent = g.title;
    const coverSrc = getCoverSrc(g);
    const year = g.releaseDate ? g.releaseDate.substring(0, 4) : '';

    let copiesHtml = '';
    if (g.copies?.length) {
      copiesHtml = '<div style="margin-top:8px"><span class="format-heading">Copies</span><div class="modal-format-pills">';
      g.copies.forEach(c => {
        const platLabel = PLATFORM_META[c.platform]?.label || c.platform;
        const typeBadge = c.type === 'physical' ? '\uD83D\uDCE6' : '\uD83D\uDCBE';
        const detail = c.type === 'physical' ? (c.condition || '') : (c.store || '');
        copiesHtml += `<span class="modal-format-pill">${typeBadge} ${esc(platLabel)}${detail ? ' \u2014 ' + esc(detail) : ''}</span>`;
        if (c.type === 'physical' && c.backedUp) {
          copiesHtml += '<span class="backed-up-badge" title="Backed Up">💾 Backed Up</span>';
        }
      });
      copiesHtml += '</div></div>';
    }

    body.innerHTML = `
      <div style="display:flex;gap:20px">
        <div style="flex-shrink:0">
          ${coverSrc
            ? `<img src="${esc(coverSrc)}" alt="" style="width:160px;border-radius:var(--radius);background:var(--bg-input);" onerror="this.style.display='none'">`
            : `<div style="width:160px;aspect-ratio:2/3;background:var(--bg-input);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">No Cover</div>`}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div><span style="font-size:18px;font-weight:700">${esc(g.title)}</span><span style="color:var(--text-muted);margin-left:6px">${year}</span></div>
          ${g.developer ? `<div style="font-size:12px;color:var(--text-secondary)">Developer: <strong>${esc(g.developer)}</strong></div>` : ''}
          ${g.publisher ? `<div style="font-size:12px;color:var(--text-secondary)">Publisher: <strong>${esc(g.publisher)}</strong></div>` : ''}
          ${g.genres?.length ? `<div style="font-size:12px;color:var(--text-secondary)">Genres: ${esc(g.genres.join(', '))}</div>` : ''}
          <div style="color:var(--star-filled);font-size:14px;margin:4px 0">${ratingStars(g.rating) || '<span style="color:var(--text-muted)">Not rated</span>'}</div>
          ${g.overview ? `<div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-top:4px">${esc(g.overview)}</div>` : ''}
          ${copiesHtml}
          ${g.tags?.length ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${g.tags.map(t => `<span class="tag-pill">${esc(t)}</span>`).join('')}</div>` : ''}
          <div style="margin-top:6px;font-size:12px;display:flex;gap:12px">
            ${g.played ? '<span style="color:var(--success)">\u2713 Played</span>' : '<span style="color:var(--text-muted)">Not played</span>'}
            ${g.completed ? '<span style="color:var(--success)">\u2713 Completed</span>' : ''}
          </div>
          <div style="margin-top:auto;padding-top:12px;display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" id="modal-edit-btn">Edit</button>
            <button class="btn btn-danger btn-sm" id="modal-delete-btn">Delete</button>
          </div>
        </div>
      </div>`;

    modal.style.display = 'flex';
    document.getElementById('modal-edit-btn').addEventListener('click', () => { modal.style.display = 'none'; navigate('add'); startEdit(idx); });
    document.getElementById('modal-delete-btn').addEventListener('click', async () => {
      if (confirm(`Remove "${g.title}" from your library?`)) {
        games.splice(idx, 1);
        await window.api.saveGames(games);
        modal.style.display = 'none';
        updateCount(); renderLibrary();
      }
    });
    document.getElementById('modal-close').onclick = () => { modal.style.display = 'none'; };
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  // ══════════════════════════════════════════════════════════════
  //  ADD / EDIT
  // ══════════════════════════════════════════════════════════════

  function bindAddEdit() {
    // ── TMDB search (movies & TV) ──
    const tmdbInput = document.getElementById('tmdb-search-input');
    const tmdbList  = document.getElementById('tmdb-results-list');
    tmdbInput?.addEventListener('input', debounce(async () => {
      const q = tmdbInput.value.trim();
      if (q.length < 2) { tmdbList.classList.remove('open'); return; }
      if (isTvMode()) {
        const data = await window.api.tmdbSearchTv(q);
        renderTmdbTvResults(tmdbList, data.results || [], r => selectTmdbTvResult(r));
      } else {
        const data = await window.api.tmdbSearch(q);
        renderTmdbResults(tmdbList, data.results || [], r => selectTmdbResult(r));
      }
    }, 350));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#tmdb-search-wrapper')) tmdbList?.classList.remove('open');
    });

    // ── RAWG / IGDB search (games) ──
    const rawgInput = document.getElementById('rawg-search-input');
    const rawgList  = document.getElementById('rawg-results-list');
    rawgInput?.addEventListener('input', debounce(async () => {
      const q = rawgInput.value.trim();
      if (q.length < 2) { rawgList.classList.remove('open'); return; }
      if (isIgdbMode()) {
        const results = await window.api.igdbSearch(q);
        renderIgdbResults(rawgList, results || [], r => selectIgdbResult(r));
      } else {
        const data = await window.api.rawgSearch(q);
        renderRawgResults(rawgList, data.results || [], r => selectRawgResult(r));
      }
    }, 350));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#rawg-search-wrapper')) rawgList?.classList.remove('open');
    });

    // ── Star picker ──
    initStarPicker('star-picker');

    // ── Tag input ──
    const tagInput = document.getElementById('f-tag-input');
    const tagAdd   = document.getElementById('f-tag-add');
    const addTag = () => {
      const v = tagInput.value.trim();
      if (v && !currentTags.includes(v)) { currentTags.push(v); renderTagList(); }
      tagInput.value = '';
    };
    tagInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });
    tagAdd?.addEventListener('click', addTag);

    // ── Toggle backed-up checkbox visibility when physical formats change (movies) ──
    document.querySelectorAll('#item-form .fmt-cb').forEach(cb => {
      if (cb.dataset.cat === 'physical') {
        cb.addEventListener('change', () => {
          const anyPhys = Array.from(document.querySelectorAll('#item-form .fmt-cb:checked')).some(c => c.dataset.cat === 'physical');
          const section = document.getElementById('movie-backed-up-section');
          if (section) section.style.display = anyPhys ? '' : 'none';
          if (!anyPhys) { const cb2 = document.getElementById('f-backedUp'); if (cb2) cb2.checked = false; }
        });
      }
    });

    // ── Add Copy button (games) ──
    document.getElementById('btn-add-copy')?.addEventListener('click', () => addCopyRow());

    // ── Form submit ──
    document.getElementById('item-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveItem();
    });

    document.getElementById('btn-cancel-edit')?.addEventListener('click', resetForm);

    document.getElementById('btn-delete')?.addEventListener('click', async () => {
      if (editIndex < 0) return;
      if (isGamesMode()) {
        if (!confirm(`Remove "${games[editIndex]?.title}" from your library?`)) return;
        games.splice(editIndex, 1);
        await window.api.saveGames(games);
      } else {
        const data = isTvMode() ? tvShows : movies;
        if (!confirm(`Remove "${data[editIndex]?.title}" from your library?`)) return;
        data.splice(editIndex, 1);
        if (isTvMode()) await window.api.saveTvShows(tvShows);
        else            await window.api.saveMovies(movies);
      }
      updateCount();
      resetForm();
      navigate('library');
    });
  }

  // ── TMDB results rendering ──

  function renderTmdbResults(list, results, onSelect) {
    list.innerHTML = '';
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No results found</li>'; list.classList.add('open'); return; }
    results.slice(0, 10).forEach(r => {
      const year = r.release_date ? r.release_date.substring(0, 4) : '\u2014';
      const thumb = r.poster_path ? `${TMDB_IMG}${r.poster_path}` : '';
      const li = document.createElement('li');
      li.innerHTML = `${thumb ? `<img src="${esc(thumb)}" alt="">` : '<div class="result-thumb-placeholder"></div>'}
        <span><span class="result-title">${esc(r.title)}</span><span class="result-year">(${year})</span></span>`;
      li.addEventListener('click', () => { onSelect(r); list.classList.remove('open'); });
      list.appendChild(li);
    });
    list.classList.add('open');
  }

  function renderTmdbTvResults(list, results, onSelect) {
    list.innerHTML = '';
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No results found</li>'; list.classList.add('open'); return; }
    results.slice(0, 10).forEach(r => {
      const year = r.first_air_date ? r.first_air_date.substring(0, 4) : '\u2014';
      const thumb = r.poster_path ? `${TMDB_IMG}${r.poster_path}` : '';
      const li = document.createElement('li');
      li.innerHTML = `${thumb ? `<img src="${esc(thumb)}" alt="">` : '<div class="result-thumb-placeholder"></div>'}
        <span><span class="result-title">${esc(r.name || r.original_name)}</span><span class="result-year">(${year})</span></span>`;
      li.addEventListener('click', () => { onSelect(r); list.classList.remove('open'); });
      list.appendChild(li);
    });
    list.classList.add('open');
  }

  function renderRawgResults(list, results, onSelect) {
    list.innerHTML = '';
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No results found</li>'; list.classList.add('open'); return; }
    results.slice(0, 10).forEach(r => {
      const year = r.released ? r.released.substring(0, 4) : '\u2014';
      const thumb = r.background_image || '';
      const platforms = (r.platforms || []).map(p => p.platform.name).join(', ');
      const li = document.createElement('li');
      li.innerHTML = `${thumb ? `<img src="${esc(thumb)}" alt="">` : '<div class="result-thumb-placeholder"></div>'}
        <span><span class="result-title">${esc(r.name)}</span><span class="result-year">(${year})</span><br><span style="font-size:10px;color:var(--text-muted)">${esc(platforms)}</span></span>`;
      li.addEventListener('click', () => { onSelect(r); list.classList.remove('open'); });
      list.appendChild(li);
    });
    list.classList.add('open');
  }

  function renderIgdbResults(list, results, onSelect) {
    list.innerHTML = '';
    if (results.length === 0) { list.innerHTML = '<li class="no-results">No results found</li>'; list.classList.add('open'); return; }
    results.forEach(r => {
      const year = r.first_release_date
        ? new Date(r.first_release_date * 1000).getFullYear()
        : '\u2014';
      const thumb = r.cover?.image_id
        ? `${IGDB_IMG_SMALL}${r.cover.image_id}.jpg`
        : '';
      const platforms = (r.platforms || []).map(p => p.name).join(', ');
      const li = document.createElement('li');
      li.innerHTML = `${thumb ? `<img src="${esc(thumb)}" alt="">` : '<div class="result-thumb-placeholder"></div>'}
        <span><span class="result-title">${esc(r.name || '')}</span><span class="result-year">(${year})</span><br><span style="font-size:10px;color:var(--text-muted)">${esc(platforms)}</span></span>`;
      li.addEventListener('click', () => { onSelect(r); list.classList.remove('open'); });
      list.appendChild(li);
    });
    list.classList.add('open');
  }

  // ── Select result handlers ──

  async function selectTmdbResult(r) {
    document.getElementById('tmdb-search-input').value = r.title;
    document.getElementById('f-tmdbId').value = r.id || '';
    document.getElementById('f-title').value = r.title || '';
    document.getElementById('f-releaseDate').value = r.release_date || '';
    document.getElementById('f-overview').value = r.overview || '';
    document.getElementById('f-posterPath').value = r.poster_path || '';
    document.getElementById('f-genres').value = (r.genre_ids || []).map(id => genreMap[id]).filter(Boolean).join(', ');
    if (r.id) {
      try {
        const details = await window.api.tmdbDetails(r.id);
        if (details) {
          const director = (details.credits?.crew || []).find(c => c.job === 'Director');
          document.getElementById('f-director').value = director ? director.name : '';
          document.getElementById('f-cast').value = (details.credits?.cast || []).slice(0, 3).map(c => c.name).join(', ');
          if (details.genres) document.getElementById('f-genres').value = details.genres.map(g => g.name).join(', ');
        }
      } catch (e) { console.warn('Could not fetch credits:', e); }
    }
    updatePosterPreview(r.poster_path);
  }

  async function selectTmdbTvResult(r) {
    document.getElementById('tmdb-search-input').value = r.name || r.original_name;
    document.getElementById('f-tmdbId').value = r.id || '';
    document.getElementById('f-title').value = r.name || r.original_name || '';
    document.getElementById('f-releaseDate').value = r.first_air_date || '';
    document.getElementById('f-overview').value = r.overview || '';
    document.getElementById('f-posterPath').value = r.poster_path || '';
    document.getElementById('f-genres').value = (r.genre_ids || []).map(id => tvGenreMap[id]).filter(Boolean).join(', ');
    if (r.id) {
      try {
        const details = await window.api.tmdbTvDetails(r.id);
        if (details) {
          document.getElementById('f-creator').value = (details.created_by || []).map(c => c.name).join(', ');
          document.getElementById('f-cast').value = (details.credits?.cast || []).slice(0, 3).map(c => c.name).join(', ');
          if (details.genres) document.getElementById('f-genres').value = details.genres.map(g => g.name).join(', ');
          const totalSeasons = details.number_of_seasons || 1;
          const el = document.getElementById('f-totalSeasons');
          if (el) el.value = totalSeasons;
          buildSeasonsUI(totalSeasons);
        }
      } catch (e) { console.warn('Could not fetch TV details:', e); }
    }
    updatePosterPreview(r.poster_path);
  }

  async function selectRawgResult(r) {
    document.getElementById('rawg-search-input').value = r.name;
    document.getElementById('f-rawgId').value = r.id || '';
    document.getElementById('f-title').value = r.name || '';
    document.getElementById('f-releaseDate').value = r.released || '';
    document.getElementById('f-coverPath').value = r.background_image || '';
    document.getElementById('f-genres').value = (r.genres || []).map(g => g.name).join(', ');
    const rawgPlatforms = (r.platforms || []).map(p => p.platform.name);
    availablePlatforms = rawgPlatforms.map(name => RAWG_PLATFORM_MAP[name] || name).filter(p => PLATFORM_META[p]);
    document.getElementById('f-availablePlatforms').value = availablePlatforms.join(', ');
    if (r.id) {
      try {
        const details = await window.api.rawgDetails(r.id);
        if (details) {
          document.getElementById('f-developer').value = (details.developers || []).map(d => d.name).join(', ');
          document.getElementById('f-publisher').value = (details.publishers || []).map(p => p.name).join(', ');
          if (details.description_raw) document.getElementById('f-overview').value = details.description_raw.substring(0, 1000);
          if (details.genres) document.getElementById('f-genres').value = details.genres.map(g => g.name).join(', ');
        }
      } catch (e) { console.warn('Could not fetch game details:', e); }
    }
    updateCoverPreview(r.background_image);
  }

  async function selectIgdbResult(r) {
    document.getElementById('rawg-search-input').value = r.name || '';
    document.getElementById('f-igdbId').value = r.id || '';
    document.getElementById('f-title').value = r.name || '';

    // Convert Unix timestamp to YYYY-MM-DD
    if (r.first_release_date) {
      const d = new Date(r.first_release_date * 1000);
      document.getElementById('f-releaseDate').value = d.toISOString().split('T')[0];
    } else {
      document.getElementById('f-releaseDate').value = '';
    }

    document.getElementById('f-overview').value = r.summary || '';

    // Cover image
    if (r.cover?.image_id) {
      document.getElementById('f-coverPath').value = `${IGDB_IMG_BIG}${r.cover.image_id}.jpg`;
    } else {
      document.getElementById('f-coverPath').value = '';
    }

    // Genres
    document.getElementById('f-genres').value = (r.genres || []).map(g => g.name).join(', ');

    // Platforms
    const igdbPlatforms = r.platforms || [];
    availablePlatforms = igdbPlatforms
      .map(p => IGDB_PLATFORM_MAP[p.id] || null)
      .filter(p => p && PLATFORM_META[p]);
    document.getElementById('f-availablePlatforms').value = availablePlatforms.join(', ');

    // Fetch full details for developer/publisher
    document.getElementById('f-developer').value = '';
    document.getElementById('f-publisher').value = '';
    if (r.id) {
      try {
        const data = await window.api.igdbDetails(r.id);
        if (data && data[0]) {
          const companies = data[0].involved_companies || [];
          const developers = companies.filter(c => c.developer).map(c => c.company?.name).filter(Boolean);
          const publishers = companies.filter(c => c.publisher).map(c => c.company?.name).filter(Boolean);
          document.getElementById('f-developer').value = developers.join(', ');
          document.getElementById('f-publisher').value = publishers.join(', ');
        }
      } catch (e) { console.warn('Could not fetch IGDB details:', e); }
    }

    const coverUrl = r.cover?.image_id ? `${IGDB_IMG_BIG}${r.cover.image_id}.jpg` : '';
    updateCoverPreview(coverUrl);
  }

  function updatePosterPreview(posterPath) {
    const preview = document.getElementById('poster-preview');
    if (!preview) return;
    preview.innerHTML = posterPath
      ? `<img src="${TMDB_IMG}${posterPath}" alt="Poster">`
      : '<span class="poster-placeholder">No Poster</span>';
  }

  function updateCoverPreview(coverUrl) {
    const preview = document.getElementById('poster-preview');
    if (!preview) return;
    preview.innerHTML = coverUrl
      ? `<img src="${coverUrl}" alt="Cover">`
      : '<span class="poster-placeholder">No Cover</span>';
  }

  // ══════════════════════════════════════════════════════════════
  //  SAVE ITEM (unified dispatcher)
  // ══════════════════════════════════════════════════════════════

  async function saveItem() {
    if (isGamesMode()) return saveGame();
    if (isTvMode())    return saveTvShow();
    return saveMovie();
  }

  async function saveMovie() {
    const movie = {
      tmdbId: parseInt(document.getElementById('f-tmdbId').value) || 0,
      title: document.getElementById('f-title').value.trim(),
      releaseDate: document.getElementById('f-releaseDate').value.trim(),
      overview: document.getElementById('f-overview').value.trim(),
      posterPath: document.getElementById('f-posterPath').value.trim(),
      genres: document.getElementById('f-genres').value.trim()
        ? document.getElementById('f-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      director: document.getElementById('f-director').value.trim(),
      cast: document.getElementById('f-cast').value.trim()
        ? document.getElementById('f-cast').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: currentRating,
      tags: [...currentTags],
      customTags: {},
      formats: { physical: [], digital: [] },
      digitalQuality: [],
      watched: document.getElementById('f-watched').checked,
    };
    if (!movie.title) { alert('Title is required'); return; }
    document.querySelectorAll('#item-form .fmt-cb:checked').forEach(cb => {
      const cat = cb.dataset.cat;
      if (cat && movie.formats[cat]) movie.formats[cat].push(cb.value);
    });
    document.querySelectorAll('#item-form .dq-cb:checked').forEach(cb => { movie.digitalQuality.push(cb.value); });
    if (movie.formats.physical.length > 0) {
      movie.backedUp = document.getElementById('f-backedUp')?.checked || false;
    }
    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { if (cb.checked) movie.customTags[cb.value] = true; });

    if (editIndex >= 0) { movies[editIndex] = movie; }
    else {
      if (movie.tmdbId && movies.some(m => m.tmdbId === movie.tmdbId)) {
        if (!confirm(`A movie with TMDB ID ${movie.tmdbId} already exists. Add anyway?`)) return;
      }
      movies.push(movie);
    }
    await window.api.saveMovies(movies);
    if (movie.tmdbId && movie.posterPath) window.api.downloadPoster(movie.tmdbId, movie.posterPath).catch(() => {});
    updateCount(); populateFilters(); resetForm(); navigate('library');
  }

  async function saveTvShow() {
    const show = {
      tmdbId: parseInt(document.getElementById('f-tmdbId').value) || 0,
      title: document.getElementById('f-title').value.trim(),
      firstAirDate: document.getElementById('f-releaseDate').value.trim(),
      overview: document.getElementById('f-overview').value.trim(),
      posterPath: document.getElementById('f-posterPath').value.trim(),
      genres: document.getElementById('f-genres').value.trim()
        ? document.getElementById('f-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      creator: document.getElementById('f-creator').value.trim(),
      cast: document.getElementById('f-cast').value.trim()
        ? document.getElementById('f-cast').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: currentRating,
      tags: [...currentTags],
      customTags: {},
      totalSeasons: parseInt(document.getElementById('f-totalSeasons').value) || 1,
      seasons: collectSeasonsFromUI(),
      boxSet: collectBoxSetFromUI(),
      watched: document.getElementById('f-watched').checked,
    };
    if (!show.title) { alert('Title is required'); return; }
    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { if (cb.checked) show.customTags[cb.value] = true; });

    if (editIndex >= 0) { tvShows[editIndex] = show; }
    else {
      if (show.tmdbId && tvShows.some(s => s.tmdbId === show.tmdbId)) {
        if (!confirm(`A show with TMDB ID ${show.tmdbId} already exists. Add anyway?`)) return;
      }
      tvShows.push(show);
    }
    await window.api.saveTvShows(tvShows);
    if (show.tmdbId && show.posterPath) window.api.downloadPoster(show.tmdbId, show.posterPath).catch(() => {});
    updateCount(); populateFilters(); resetForm(); navigate('library');
  }

  async function saveGame() {
    const apiIdVal = parseInt(document.getElementById(isIgdbMode() ? 'f-igdbId' : 'f-rawgId').value) || 0;
    const game = {
      title: document.getElementById('f-title').value.trim(),
      releaseDate: document.getElementById('f-releaseDate').value.trim(),
      overview: document.getElementById('f-overview').value.trim(),
      coverPath: document.getElementById('f-coverPath').value.trim(),
      genres: document.getElementById('f-genres').value.trim()
        ? document.getElementById('f-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      developer: document.getElementById('f-developer').value.trim(),
      publisher: document.getElementById('f-publisher').value.trim(),
      rating: currentRating,
      tags: [...currentTags],
      customTags: {},
      copies: collectCopiesFromUI(),
      played: document.getElementById('f-played').checked,
      completed: document.getElementById('f-completed').checked,
    };
    if (!game.title) { alert('Title is required'); return; }

    // Set the correct ID field based on active API (preserve both if editing)
    if (editIndex >= 0) {
      const existing = games[editIndex];
      if (existing.igdbId) game.igdbId = existing.igdbId;
      if (existing.rawgId) game.rawgId = existing.rawgId;
    }
    if (isIgdbMode()) {
      game.igdbId = apiIdVal;
    } else {
      game.rawgId = apiIdVal;
    }

    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { if (cb.checked) game.customTags[cb.value] = true; });

    if (editIndex >= 0) { games[editIndex] = game; }
    else {
      const dupeId = isIgdbMode() ? game.igdbId : game.rawgId;
      const dupeKey = isIgdbMode() ? 'igdbId' : 'rawgId';
      const apiLabel = isIgdbMode() ? 'IGDB' : 'RAWG';
      if (dupeId && games.some(g => g[dupeKey] === dupeId)) {
        if (!confirm(`A game with ${apiLabel} ID ${dupeId} already exists. Add anyway?`)) return;
      }
      games.push(game);
    }
    await window.api.saveGames(games);
    const coverId = game.igdbId || game.rawgId;
    if (coverId && game.coverPath) window.api.downloadCover(coverId, game.coverPath).catch(() => {});
    updateCount(); populateFilters(); resetForm(); navigate('library');
  }

  // ══════════════════════════════════════════════════════════════
  //  START EDIT / RESET FORM
  // ══════════════════════════════════════════════════════════════

  function startEdit(idx) {
    editIndex = idx;
    if (isGamesMode()) { startEditGame(idx); return; }
    startEditMovieTv(idx);
  }

  function startEditMovieTv(idx) {
    const tv = isTvMode();
    const data = tv ? tvShows : movies;
    const m = data[idx];
    document.getElementById('tmdb-search-input').value = m.title || '';
    document.getElementById('f-tmdbId').value = m.tmdbId || '';
    document.getElementById('f-title').value = m.title || '';
    document.getElementById('f-releaseDate').value = (tv ? m.firstAirDate : m.releaseDate) || '';
    document.getElementById('f-overview').value = m.overview || '';
    document.getElementById('f-posterPath').value = m.posterPath || '';
    document.getElementById('f-genres').value = (m.genres || []).join(', ');
    document.getElementById('f-director').value = m.director || '';
    document.getElementById('f-creator').value = m.creator || '';
    document.getElementById('f-cast').value = (m.cast || []).join(', ');

    currentRating = m.rating || 0;
    renderStars(document.getElementById('star-picker'));
    currentTags = [...(m.tags || [])];
    renderTagList();
    document.getElementById('f-watched').checked = !!m.watched;

    if (tv) {
      populateSeasonsUI(m);
    } else {
      const allFmts = [...(m.formats?.physical || []), ...(m.formats?.digital || [])];
      document.querySelectorAll('#item-form .fmt-cb').forEach(cb => { cb.checked = allFmts.includes(cb.value); });
      document.querySelectorAll('#item-form .dq-cb').forEach(cb => { cb.checked = (m.digitalQuality || []).includes(cb.value); });
      // Backed up
      const hasPhys = (m.formats?.physical || []).length > 0;
      const backedUpSection = document.getElementById('movie-backed-up-section');
      if (backedUpSection) backedUpSection.style.display = hasPhys ? '' : 'none';
      const backedUpCb = document.getElementById('f-backedUp');
      if (backedUpCb) backedUpCb.checked = !!m.backedUp;
    }
    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { cb.checked = !!(m.customTags && m.customTags[cb.value]); });
    updatePosterPreview(m.posterPath);

    const typeLabel = tv ? 'TV Show' : 'Movie';
    document.getElementById('add-heading').textContent = `Edit ${typeLabel}`;
    document.getElementById('btn-save').textContent = `Update ${typeLabel}`;
    document.getElementById('btn-cancel-edit').style.display = '';
    document.getElementById('btn-delete').style.display = '';
  }

  function startEditGame(idx) {
    const g = games[idx];
    document.getElementById('rawg-search-input').value = g.title || '';
    document.getElementById('f-rawgId').value = g.rawgId || '';
    const igdbEl = document.getElementById('f-igdbId');
    if (igdbEl) igdbEl.value = g.igdbId || '';
    document.getElementById('f-title').value = g.title || '';
    document.getElementById('f-releaseDate').value = g.releaseDate || '';
    document.getElementById('f-overview').value = g.overview || '';
    document.getElementById('f-coverPath').value = g.coverPath || '';
    document.getElementById('f-genres').value = (g.genres || []).join(', ');
    document.getElementById('f-developer').value = g.developer || '';
    document.getElementById('f-publisher').value = g.publisher || '';
    document.getElementById('f-availablePlatforms').value = '';
    availablePlatforms = Object.keys(PLATFORM_META);

    currentRating = g.rating || 0;
    renderStars(document.getElementById('star-picker'));
    currentTags = [...(g.tags || [])];
    renderTagList();
    document.getElementById('f-played').checked = !!g.played;
    document.getElementById('f-completed').checked = !!g.completed;
    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { cb.checked = !!(g.customTags && g.customTags[cb.value]); });

    const builder = document.getElementById('copies-builder');
    builder.innerHTML = '';
    (g.copies || []).forEach(c => addCopyRow(c));
    updateCoverPreview(g.coverPath);

    document.getElementById('add-heading').textContent = 'Edit Game';
    document.getElementById('btn-save').textContent = 'Update Game';
    document.getElementById('btn-cancel-edit').style.display = '';
    document.getElementById('btn-delete').style.display = '';
  }

  function resetForm() {
    editIndex = -1;
    document.getElementById('item-form').reset();

    // Clear all search inputs
    const tmdbInput = document.getElementById('tmdb-search-input');
    const rawgInput = document.getElementById('rawg-search-input');
    if (tmdbInput) tmdbInput.value = '';
    if (rawgInput) rawgInput.value = '';

    // Clear hidden fields
    ['f-tmdbId', 'f-rawgId', 'f-igdbId', 'f-posterPath', 'f-coverPath', 'f-genres', 'f-director', 'f-creator', 'f-cast', 'f-developer', 'f-publisher', 'f-availablePlatforms'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    currentRating = 0;
    renderStars(document.getElementById('star-picker'));
    currentTags = [];
    renderTagList();
    availablePlatforms = [];

    // Reset checkboxes
    const watchedCb = document.getElementById('f-watched');
    const playedCb  = document.getElementById('f-played');
    const completedCb = document.getElementById('f-completed');
    if (watchedCb) watchedCb.checked = false;
    if (playedCb)  playedCb.checked = false;
    if (completedCb) completedCb.checked = false;

    document.getElementById('poster-preview').innerHTML = '<span class="poster-placeholder">No Poster</span>';
    document.querySelectorAll('#item-form .cf-cb').forEach(cb => { cb.checked = false; });

    // Reset TV-specific
    const seasonsBuilder = document.getElementById('seasons-builder');
    if (seasonsBuilder) seasonsBuilder.innerHTML = '';
    const physCb = document.getElementById('boxset-physical-cb');
    const physFmt = document.getElementById('boxset-physical-format');
    if (physCb) physCb.checked = false;
    if (physFmt) { physFmt.value = ''; physFmt.style.display = 'none'; }
    const digCb = document.getElementById('boxset-digital-cb');
    const digFmts = document.getElementById('boxset-digital-formats');
    if (digCb) digCb.checked = false;
    if (digFmts) { digFmts.innerHTML = ''; digFmts.style.display = 'none'; }
    const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
    if (boxsetBackedupSection) boxsetBackedupSection.style.display = 'none';
    const boxsetBackedupCb = document.getElementById('boxset-backedup-cb');
    if (boxsetBackedupCb) boxsetBackedupCb.checked = false;
    const totalSeasonsEl = document.getElementById('f-totalSeasons');
    if (totalSeasonsEl) totalSeasonsEl.value = '1';

    // Reset movie backed-up
    const movieBackedUpSection = document.getElementById('movie-backed-up-section');
    if (movieBackedUpSection) movieBackedUpSection.style.display = 'none';
    const backedUpCb = document.getElementById('f-backedUp');
    if (backedUpCb) backedUpCb.checked = false;

    // Reset game copies
    const copiesBuilder = document.getElementById('copies-builder');
    if (copiesBuilder) copiesBuilder.innerHTML = '';

    // Update labels
    const typeLabel = isGamesMode() ? 'Game' : isTvMode() ? 'TV Show' : 'Movie';
    document.getElementById('add-heading').textContent = `Add ${typeLabel}`;
    document.getElementById('btn-save').textContent = `Add ${typeLabel}`;
    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('btn-delete').style.display = 'none';
  }

  // ══════════════════════════════════════════════════════════════
  //  SEASONS BUILDER (TV)
  // ══════════════════════════════════════════════════════════════

  function bindSeasonsBuilder() {
    document.getElementById('btn-build-seasons')?.addEventListener('click', () => {
      const total = parseInt(document.getElementById('f-totalSeasons').value) || 1;
      buildSeasonsUI(total);
    });
    const physCb = document.getElementById('boxset-physical-cb');
    const physFmt = document.getElementById('boxset-physical-format');
    if (physCb && physFmt) {
      physCb.addEventListener('change', () => {
        physFmt.style.display = physCb.checked ? 'inline-block' : 'none';
        const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
        if (boxsetBackedupSection) boxsetBackedupSection.style.display = physCb.checked ? 'inline-flex' : 'none';
        if (!physCb.checked) { const cb = document.getElementById('boxset-backedup-cb'); if (cb) cb.checked = false; }
      });
    }
    const digCb = document.getElementById('boxset-digital-cb');
    const digFmts = document.getElementById('boxset-digital-formats');
    if (digCb && digFmts) {
      digCb.addEventListener('change', () => {
        if (digCb.checked) { digFmts.style.display = ''; renderBoxSetDigitalOptions(); }
        else { digFmts.style.display = 'none'; }
      });
    }
  }

  function renderBoxSetDigitalOptions() {
    const container = document.getElementById('boxset-digital-formats');
    if (!container) return;
    container.innerHTML = '';
    DIGITAL_SERVICES.forEach(svc => {
      const logo = FORMAT_LOGOS[svc];
      const logoImg = logo ? `<img src="${logo}" alt="" class="chip-logo">` : '';
      container.innerHTML += `<label class="format-chip"><input type="checkbox" class="boxset-dig-cb" value="${svc}">${logoImg}<span>${esc(svc)}</span></label>`;
    });
  }

  function buildSeasonsUI(total) {
    const container = document.getElementById('seasons-builder');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= total; i++) {
      const row = document.createElement('div');
      row.className = 'season-row-builder';
      row.dataset.season = i;
      let html = `<div class="season-row-header"><strong>Season ${i}</strong></div><div class="season-row-body">`;
      html += '<div class="season-field"><span class="format-heading">Physical</span><select class="select-field season-physical" style="width:130px"><option value="">None</option>';
      PHYSICAL_FORMATS.forEach(f => { html += `<option value="${f}">${f}</option>`; });
      html += '</select><div class="season-backedup-wrap" style="display:none;margin-top:4px"><label class="check-label"><input type="checkbox" class="season-backedup"> Backed up?</label></div></div>';
      html += '<div class="season-field"><span class="format-heading">Digital</span><div class="format-chips season-digital-chips">';
      DIGITAL_SERVICES.forEach(f => {
        const logo = FORMAT_LOGOS[f];
        const logoImg = logo ? `<img src="${logo}" alt="" class="chip-logo">` : '';
        html += `<label class="format-chip format-chip-sm"><input type="checkbox" class="season-digital" value="${f}">${logoImg}<span>${esc(f)}</span></label>`;
      });
      html += '</div></div></div>';
      row.innerHTML = html;
      container.appendChild(row);

      // Show/hide backed-up checkbox when physical format changes
      const physSel = row.querySelector('.season-physical');
      const backupWrap = row.querySelector('.season-backedup-wrap');
      if (physSel && backupWrap) {
        physSel.addEventListener('change', () => {
          backupWrap.style.display = physSel.value ? '' : 'none';
          if (!physSel.value) { const cb = row.querySelector('.season-backedup'); if (cb) cb.checked = false; }
        });
      }
    }
  }

  function collectSeasonsFromUI() {
    const rows = document.querySelectorAll('#seasons-builder .season-row-builder');
    const seasons = [];
    rows.forEach(row => {
      const num = parseInt(row.dataset.season);
      const physical = row.querySelector('.season-physical')?.value || null;
      const digital = Array.from(row.querySelectorAll('.season-digital:checked')).map(cb => cb.value);
      const season = { seasonNumber: num, physical: physical || null, digital };
      if (physical) season.backedUp = row.querySelector('.season-backedup')?.checked || false;
      seasons.push(season);
    });
    return seasons;
  }

  function collectBoxSetFromUI() {
    const physCb = document.getElementById('boxset-physical-cb');
    const physFmt = document.getElementById('boxset-physical-format');
    const digCb = document.getElementById('boxset-digital-cb');
    const physical = physCb?.checked && physFmt?.value ? physFmt.value : null;
    let digital = null;
    if (digCb?.checked) {
      const checked = document.querySelectorAll('#boxset-digital-formats .boxset-dig-cb:checked');
      digital = Array.from(checked).map(cb => cb.value);
      if (digital.length === 0) digital = null;
    }
    const result = { physical, digital };
    if (physical) {
      result.backedUp = document.getElementById('boxset-backedup-cb')?.checked || false;
    }
    return result;
  }

  function populateSeasonsUI(show) {
    const total = show.totalSeasons || 0;
    if (total > 0) {
      document.getElementById('f-totalSeasons').value = total;
      buildSeasonsUI(total);
      (show.seasons || []).forEach(s => {
        const row = document.querySelector(`#seasons-builder .season-row-builder[data-season="${s.seasonNumber}"]`);
        if (!row) return;
        if (s.physical) {
          const sel = row.querySelector('.season-physical'); if (sel) sel.value = s.physical;
          const backupWrap = row.querySelector('.season-backedup-wrap');
          if (backupWrap) backupWrap.style.display = '';
          if (s.backedUp) { const cb = row.querySelector('.season-backedup'); if (cb) cb.checked = true; }
        }
        (s.digital || []).forEach(f => { const cb = row.querySelector(`.season-digital[value="${f}"]`); if (cb) cb.checked = true; });
      });
    }
    const bs = show.boxSet || {};
    if (bs.physical) {
      const cb = document.getElementById('boxset-physical-cb');
      const fmt = document.getElementById('boxset-physical-format');
      if (cb) cb.checked = true;
      if (fmt) { fmt.style.display = 'inline-block'; fmt.value = bs.physical; }
      const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
      if (boxsetBackedupSection) boxsetBackedupSection.style.display = 'inline-flex';
      if (bs.backedUp) { const bsCb = document.getElementById('boxset-backedup-cb'); if (bsCb) bsCb.checked = true; }
    }
    if (bs.digital && (Array.isArray(bs.digital) ? bs.digital.length > 0 : true)) {
      const cb = document.getElementById('boxset-digital-cb');
      const fmts = document.getElementById('boxset-digital-formats');
      if (cb) cb.checked = true;
      if (fmts) {
        fmts.style.display = '';
        renderBoxSetDigitalOptions();
        const arr = Array.isArray(bs.digital) ? bs.digital : [bs.digital];
        arr.forEach(f => { const c = fmts.querySelector(`.boxset-dig-cb[value="${f}"]`); if (c) c.checked = true; });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COPIES BUILDER (Games)
  // ══════════════════════════════════════════════════════════════

  function addCopyRow(data) {
    const builder = document.getElementById('copies-builder');
    const row = document.createElement('div');
    row.className = 'copy-row-builder';

    let platformOptions = '<option value="">Select platform\u2026</option>';
    const families = {};
    const platList = availablePlatforms.length > 0 ? availablePlatforms : Object.keys(PLATFORM_META);
    platList.forEach(p => {
      const meta = PLATFORM_META[p];
      if (!meta) return;
      if (!families[meta.family]) families[meta.family] = [];
      families[meta.family].push(p);
    });
    for (const [family, platforms] of Object.entries(families)) {
      platformOptions += `<optgroup label="${family}">`;
      platforms.forEach(p => {
        const sel = data?.platform === p ? ' selected' : '';
        platformOptions += `<option value="${p}"${sel}>${PLATFORM_META[p].label}</option>`;
      });
      platformOptions += '</optgroup>';
    }

    const isDigital = data?.type === 'digital';
    let condOpts = '<option value="">None</option>';
    CONDITIONS.forEach(c => { condOpts += `<option value="${c}"${data?.condition === c ? ' selected' : ''}>${c}</option>`; });
    let storeOpts = '<option value="">None</option>';
    Object.keys(STORE_META).forEach(s => { storeOpts += `<option value="${s}"${data?.store === s ? ' selected' : ''}>${STORE_META[s].label}</option>`; });

    row.innerHTML = `<div class="copy-row-fields">
      <select class="select-field copy-platform">${platformOptions}</select>
      <select class="select-field copy-type">
        <option value="physical"${!isDigital ? ' selected' : ''}>Physical</option>
        <option value="digital"${isDigital ? ' selected' : ''}>Digital</option>
      </select>
      <select class="select-field copy-condition" style="${isDigital ? 'display:none' : ''}">${condOpts}</select>
      <select class="select-field copy-store" style="${!isDigital ? 'display:none' : ''}">${storeOpts}</select>
      <label class="check-label copy-backedup-col" style="${isDigital ? 'display:none' : ''}"><input type="checkbox" class="copy-backedup"${data?.backedUp ? ' checked' : ''}> Backed up?</label>
      <button type="button" class="btn btn-sm btn-danger copy-remove">&times;</button>
    </div>`;

    const typeSelect = row.querySelector('.copy-type');
    const condSelect = row.querySelector('.copy-condition');
    const storeSelect = row.querySelector('.copy-store');
    const backedupCol = row.querySelector('.copy-backedup-col');
    typeSelect.addEventListener('change', () => {
      const isDig = typeSelect.value === 'digital';
      condSelect.style.display = isDig ? 'none' : '';
      storeSelect.style.display = isDig ? '' : 'none';
      if (backedupCol) backedupCol.style.display = isDig ? 'none' : '';
      if (isDig) { const cb = row.querySelector('.copy-backedup'); if (cb) cb.checked = false; }
    });
    row.querySelector('.copy-remove').addEventListener('click', () => row.remove());
    builder.appendChild(row);
  }

  function collectCopiesFromUI() {
    const rows = document.querySelectorAll('#copies-builder .copy-row-builder');
    const copies = [];
    rows.forEach(row => {
      const platform = row.querySelector('.copy-platform')?.value || '';
      const type = row.querySelector('.copy-type')?.value || 'physical';
      if (!platform) return;
      const copy = { platform, type };
      if (type === 'physical') {
        const cond = row.querySelector('.copy-condition')?.value; if (cond) copy.condition = cond;
        copy.backedUp = row.querySelector('.copy-backedup')?.checked || false;
      }
      else { const store = row.querySelector('.copy-store')?.value; if (store) copy.store = store; }
      copies.push(copy);
    });
    return copies;
  }

  // ══════════════════════════════════════════════════════════════
  //  STAR PICKER & TAGS
  // ══════════════════════════════════════════════════════════════

  function initStarPicker(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    renderStars(container);
    container.addEventListener('click', (e) => {
      const star = e.target.closest('.star-pick');
      if (!star) return;
      const rect = star.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const val = parseFloat(star.dataset.value);
      currentRating = (x < rect.width / 2) ? val - 0.5 : val;
      if (currentRating <= 0) currentRating = 0.5;
      renderStars(container);
    });
    container.addEventListener('dblclick', () => { currentRating = 0; renderStars(container); });
  }

  function renderStars(container) {
    if (!container) return;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      let cls = 'star-pick';
      if (currentRating >= i) cls += ' filled';
      else if (currentRating >= i - 0.5) cls += ' half';
      html += `<span class="${cls}" data-value="${i}">\u2605</span>`;
    }
    html += `<span class="star-value">${currentRating > 0 ? currentRating + '/5' : 'Click to rate'}</span>`;
    container.innerHTML = html;
  }

  function renderTagList() {
    const container = document.getElementById('f-tag-list');
    if (!container) return;
    container.innerHTML = currentTags.map((t, i) =>
      `<span class="tag-pill">${esc(t)} <span class="tag-remove" data-idx="${i}">&times;</span></span>`
    ).join('');
    container.querySelectorAll('.tag-remove').forEach(el => {
      el.addEventListener('click', () => { currentTags.splice(parseInt(el.dataset.idx), 1); renderTagList(); });
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  BATCH ADD
  // ══════════════════════════════════════════════════════════════

  function populateBatchPlatforms() {
    const sel = document.getElementById('batch-platform');
    if (!sel) return;
    let html = '<option value="">None</option>';
    const families = {};
    Object.entries(PLATFORM_META).forEach(([key, meta]) => {
      if (!families[meta.family]) families[meta.family] = [];
      families[meta.family].push(key);
    });
    for (const [family, platforms] of Object.entries(families)) {
      html += `<optgroup label="${family}">`;
      platforms.forEach(p => { html += `<option value="${p}">${PLATFORM_META[p].label}</option>`; });
      html += '</optgroup>';
    }
    sel.innerHTML = html;
  }

  function bindBatch() {
    const input = document.getElementById('batch-search-input');
    const list  = document.getElementById('batch-results-list');

    input?.addEventListener('input', debounce(async () => {
      const q = input.value.trim();
      if (q.length < 2) { list.classList.remove('open'); return; }
      if (isGamesMode()) {
        if (isIgdbMode()) {
          const results = await window.api.igdbSearch(q);
          renderIgdbResults(list, results || [], r => addToBatchQueue(r));
        } else {
          const data = await window.api.rawgSearch(q);
          renderRawgResults(list, data.results || [], r => addToBatchQueue(r));
        }
      } else if (isTvMode()) {
        const data = await window.api.tmdbSearchTv(q);
        renderTmdbTvResults(list, data.results || [], r => addToBatchQueue(r));
      } else {
        const data = await window.api.tmdbSearch(q);
        renderTmdbResults(list, data.results || [], r => addToBatchQueue(r));
      }
    }, 350));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#batch-search-wrapper')) list?.classList.remove('open');
    });

    document.getElementById('batch-clear')?.addEventListener('click', () => { batchQueue = []; renderBatchQueue(); });
    document.getElementById('batch-add-all')?.addEventListener('click', async () => { if (batchQueue.length) await addBatchToLibrary(); });

    // Movie format preset changes
    document.querySelectorAll('.batch-fmt').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = { physical: [], digital: [] };
        document.querySelectorAll('.batch-fmt:checked').forEach(c => {
          const cat = c.dataset.cat;
          if (cat && checked[cat]) checked[cat].push(c.value);
        });
        for (const m of batchQueue) m.formats = { physical: [...checked.physical], digital: [...checked.digital] };
        renderBatchQueue();
      });
    });

    // TV box-set digital preset changes
    document.querySelectorAll('.batch-tv-fmt').forEach(cb => {
      cb.addEventListener('change', () => {
        const svc = [];
        document.querySelectorAll('.batch-tv-fmt:checked').forEach(c => svc.push(c.value));
        for (const m of batchQueue) m.boxSet = { physical: m.boxSet?.physical || '', digital: [...svc] };
        renderBatchQueue();
      });
    });

    // Game batch type toggle (condition/store)
    const batchType = document.getElementById('batch-type');
    batchType?.addEventListener('change', () => {
      const isDig = batchType.value === 'digital';
      document.getElementById('batch-condition-group').style.display = isDig ? 'none' : '';
      document.getElementById('batch-store-group').style.display = isDig ? '' : 'none';
    });
  }

  async function addToBatchQueue(r) {
    document.getElementById('batch-search-input').value = '';
    document.getElementById('batch-results-list').classList.remove('open');

    if (isGamesMode()) { await addGameToBatchQueue(r); }
    else if (isTvMode()) { await addTvToBatchQueue(r); }
    else { await addMovieToBatchQueue(r); }

    renderBatchQueue();
    document.getElementById('batch-search-input')?.focus();
  }

  async function addMovieToBatchQueue(r) {
    if (batchQueue.some(q => q.tmdbId === r.id)) return;
    let details = null;
    try { details = await window.api.tmdbDetails(r.id); } catch {}
    const movie = {
      tmdbId: r.id, title: r.title, releaseDate: r.release_date || '',
      overview: r.overview || '', posterPath: r.poster_path || '',
      genres: details?.genres ? details.genres.map(g => g.name) : (r.genre_ids || []).map(id => genreMap[id]).filter(Boolean),
      director: '', cast: [], rating: 0, tags: [], customTags: {},
      formats: { physical: [], digital: [] }, digitalQuality: [], watched: false,
    };
    if (details?.credits) {
      const dir = details.credits.crew?.find(c => c.job === 'Director');
      if (dir) movie.director = dir.name;
      movie.cast = (details.credits.cast || []).slice(0, 3).map(c => c.name);
    }
    document.querySelectorAll('.batch-fmt:checked').forEach(cb => {
      const cat = cb.dataset.cat;
      if (cat && movie.formats[cat]) movie.formats[cat].push(cb.value);
    });
    batchQueue.push(movie);
  }

  async function addTvToBatchQueue(r) {
    if (batchQueue.some(q => q.tmdbId === r.id)) return;
    let details = null;
    try { details = await window.api.tmdbTvDetails(r.id); } catch {}
    const totalSeasons = details?.number_of_seasons || 1;
    const show = {
      tmdbId: r.id, title: r.name || r.original_name, firstAirDate: r.first_air_date || '',
      overview: r.overview || '', posterPath: r.poster_path || '',
      genres: details?.genres ? details.genres.map(g => g.name) : (r.genre_ids || []).map(id => tvGenreMap[id]).filter(Boolean),
      creator: '', cast: [], rating: 0, tags: [], customTags: {},
      totalSeasons, seasons: Array.from({ length: totalSeasons }, (_, i) => ({ seasonNumber: i + 1, physical: '', digital: [] })),
      boxSet: { physical: '', digital: [] }, watched: false,
    };
    if (details) {
      show.creator = (details.created_by || []).map(c => c.name).join(', ');
      show.cast = (details.credits?.cast || []).slice(0, 3).map(c => c.name);
    }
    document.querySelectorAll('.batch-tv-fmt:checked').forEach(cb => { show.boxSet.digital.push(cb.value); });
    batchQueue.push(show);
  }

  async function addGameToBatchQueue(r) {
    if (isIgdbMode()) {
      // IGDB result
      if (batchQueue.some(q => q.igdbId === r.id)) return;
      const game = {
        igdbId: r.id, title: r.name || '', releaseDate: '',
        overview: r.summary || '',
        coverPath: r.cover?.image_id ? `${IGDB_IMG_BIG}${r.cover.image_id}.jpg` : '',
        genres: (r.genres || []).map(g => g.name),
        developer: '', publisher: '',
        rating: 0, tags: [], customTags: {}, copies: [], played: false, completed: false,
      };
      if (r.first_release_date) {
        const d = new Date(r.first_release_date * 1000);
        game.releaseDate = d.toISOString().split('T')[0];
      }
      // Fetch developer/publisher
      if (r.id) {
        try {
          const data = await window.api.igdbDetails(r.id);
          if (data && data[0]) {
            const companies = data[0].involved_companies || [];
            game.developer = companies.filter(c => c.developer).map(c => c.company?.name).filter(Boolean).join(', ');
            game.publisher = companies.filter(c => c.publisher).map(c => c.company?.name).filter(Boolean).join(', ');
          }
        } catch {}
      }
      // Map platforms
      const igdbPlatforms = r.platforms || [];
      const mappedPlatforms = igdbPlatforms.map(p => IGDB_PLATFORM_MAP[p.id] || null).filter(p => p && PLATFORM_META[p]);
      const platform = document.getElementById('batch-platform')?.value;
      const type = document.getElementById('batch-type')?.value || 'physical';
      if (platform) {
        const copy = { platform, type };
        if (type === 'physical') { const cond = document.getElementById('batch-condition')?.value; if (cond) copy.condition = cond; }
        else { const store = document.getElementById('batch-store')?.value; if (store) copy.store = store; }
        game.copies.push(copy);
      }
      batchQueue.push(game);
    } else {
      // RAWG result
      if (batchQueue.some(q => q.rawgId === r.id)) return;
      let details = null;
      try { details = await window.api.rawgDetails(r.id); } catch {}
      const game = {
        rawgId: r.id, title: r.name, releaseDate: r.released || '',
        overview: details?.description_raw ? details.description_raw.substring(0, 1000) : '',
        coverPath: r.background_image || '',
        genres: details?.genres ? details.genres.map(g => g.name) : (r.genres || []).map(g => g.name),
        developer: details?.developers ? details.developers.map(d => d.name).join(', ') : '',
        publisher: details?.publishers ? details.publishers.map(p => p.name).join(', ') : '',
        rating: 0, tags: [], customTags: {}, copies: [], played: false, completed: false,
      };
      const platform = document.getElementById('batch-platform')?.value;
      const type = document.getElementById('batch-type')?.value || 'physical';
      if (platform) {
        const copy = { platform, type };
        if (type === 'physical') { const cond = document.getElementById('batch-condition')?.value; if (cond) copy.condition = cond; }
        else { const store = document.getElementById('batch-store')?.value; if (store) copy.store = store; }
        game.copies.push(copy);
      }
      batchQueue.push(game);
    }
  }

  function renderBatchQueue() {
    document.getElementById('batch-queue-count').textContent = `(${batchQueue.length})`;
    const container = document.getElementById('batch-queue');
    if (!container) return;

    if (batchQueue.length === 0) {
      const label = isGamesMode() ? 'games' : isTvMode() ? 'TV shows' : 'movies';
      container.innerHTML = `<div class="empty-state"><p>Queue is empty. Search for ${label} above.</p></div>`;
      return;
    }

    if (isGamesMode()) {
      container.innerHTML = batchQueue.map((g, i) => {
        const existing = games.find(x => (g.igdbId && x.igdbId === g.igdbId) || (g.rawgId && x.rawgId === g.rawgId));
        const thumb = g.coverPath || '';
        const year = g.releaseDate ? g.releaseDate.substring(0, 4) : '';
        const subtitle = `${year}${g.developer ? ' \u00B7 ' + esc(g.developer) : ''}`;
        return `<div class="batch-item${existing ? ' exists' : ''}">
          ${thumb ? `<img src="${esc(thumb)}" alt="">` : ''}
          <div class="batch-info"><div class="batch-title">${esc(g.title)}</div><div class="batch-year">${subtitle}</div></div>
          <button class="batch-remove" data-idx="${i}">&times;</button>
        </div>`;
      }).join('');
    } else {
      const tv = isTvMode();
      const collection = tv ? tvShows : movies;
      container.innerHTML = batchQueue.map((m, i) => {
        const existing = collection.find(x => x.tmdbId === m.tmdbId);
        let existsClass = '';
        if (existing) {
          if (tv) {
            let hasNew = false;
            for (const svc of (m.boxSet?.digital || [])) { if (!(existing.boxSet?.digital || []).includes(svc)) hasNew = true; }
            existsClass = hasNew ? ' exists-update' : ' exists';
          } else {
            let hasNew = false;
            for (const cat of ['physical', 'digital']) { for (const fmt of (m.formats?.[cat] || [])) { if (!(existing.formats?.[cat] || []).includes(fmt)) hasNew = true; } }
            for (const dq of (m.digitalQuality || [])) { if (!(existing.digitalQuality || []).includes(dq)) hasNew = true; }
            existsClass = hasNew ? ' exists-update' : ' exists';
          }
        }
        const thumb = m.posterPath ? `${TMDB_IMG}${m.posterPath}` : '';
        const dateStr = tv ? m.firstAirDate : m.releaseDate;
        const year = dateStr ? dateStr.substring(0, 4) : '';
        const subtitle = tv
          ? `${year}${m.totalSeasons ? ' \u00B7 ' + m.totalSeasons + ' season' + (m.totalSeasons > 1 ? 's' : '') : ''}${m.creator ? ' \u00B7 ' + esc(m.creator) : ''}`
          : `${year}${m.director ? ' \u00B7 ' + esc(m.director) : ''}`;
        return `<div class="batch-item${existsClass}">
          ${thumb ? `<img src="${esc(thumb)}" alt="">` : ''}
          <div class="batch-info"><div class="batch-title">${esc(m.title)}</div><div class="batch-year">${subtitle}</div></div>
          <button class="batch-remove" data-idx="${i}">&times;</button>
        </div>`;
      }).join('');
    }

    container.querySelectorAll('.batch-remove').forEach(btn => {
      btn.addEventListener('click', () => { batchQueue.splice(parseInt(btn.dataset.idx), 1); renderBatchQueue(); });
    });
  }

  async function addBatchToLibrary() {
    if (isGamesMode()) return addBatchGamesToLibrary();
    if (isTvMode())    return addBatchTvToLibrary();
    return addBatchMoviesToLibrary();
  }

  async function addBatchMoviesToLibrary() {
    let added = 0, updated = 0, skipped = 0;
    const newlyAdded = [];
    for (const m of batchQueue) {
      const existing = movies.find(x => x.tmdbId === m.tmdbId);
      if (existing) {
        let changed = false;
        for (const cat of ['physical', 'digital']) {
          for (const fmt of (m.formats?.[cat] || [])) {
            if (!(existing.formats?.[cat] || []).includes(fmt)) {
              if (!existing.formats) existing.formats = { physical: [], digital: [] };
              if (!existing.formats[cat]) existing.formats[cat] = [];
              existing.formats[cat].push(fmt); changed = true;
            }
          }
        }
        for (const dq of (m.digitalQuality || [])) {
          if (!(existing.digitalQuality || []).includes(dq)) { if (!existing.digitalQuality) existing.digitalQuality = []; existing.digitalQuality.push(dq); changed = true; }
        }
        if (changed) updated++; else skipped++;
        continue;
      }
      movies.push(m); newlyAdded.push(m); added++;
    }
    await window.api.saveMovies(movies);
    for (const m of newlyAdded) { if (m.tmdbId && m.posterPath) window.api.downloadPoster(m.tmdbId, m.posterPath).catch(() => {}); }
    updateCount(); populateFilters(); batchQueue = []; renderBatchQueue();
    const parts = [];
    if (added) parts.push(`${added} added`);
    if (updated) parts.push(`${updated} updated with new formats`);
    if (skipped) parts.push(`${skipped} unchanged (skipped)`);
    alert(parts.join(', ') + '.');
  }

  async function addBatchTvToLibrary() {
    let added = 0, updated = 0, skipped = 0;
    const newlyAdded = [];
    for (const m of batchQueue) {
      const existing = tvShows.find(x => x.tmdbId === m.tmdbId);
      if (existing) {
        let changed = false;
        for (const svc of (m.boxSet?.digital || [])) {
          if (!existing.boxSet) existing.boxSet = { physical: '', digital: [] };
          if (!existing.boxSet.digital) existing.boxSet.digital = [];
          if (!existing.boxSet.digital.includes(svc)) { existing.boxSet.digital.push(svc); changed = true; }
        }
        if (changed) updated++; else skipped++;
        continue;
      }
      tvShows.push(m); newlyAdded.push(m); added++;
    }
    await window.api.saveTvShows(tvShows);
    for (const m of newlyAdded) { if (m.tmdbId && m.posterPath) window.api.downloadPoster(m.tmdbId, m.posterPath).catch(() => {}); }
    updateCount(); populateFilters(); batchQueue = []; renderBatchQueue();
    const parts = [];
    if (added) parts.push(`${added} added`);
    if (updated) parts.push(`${updated} updated with new services`);
    if (skipped) parts.push(`${skipped} unchanged (skipped)`);
    alert(parts.join(', ') + '.');
  }

  async function addBatchGamesToLibrary() {
    let added = 0, skipped = 0;
    const newlyAdded = [];
    for (const g of batchQueue) {
      const existing = games.find(x => (g.igdbId && x.igdbId === g.igdbId) || (g.rawgId && x.rawgId === g.rawgId));
      if (existing) {
        let changed = false;
        for (const c of g.copies) {
          const dup = existing.copies?.some(ec => ec.platform === c.platform && ec.type === c.type && ((c.type === 'physical' && ec.condition === c.condition) || (c.type === 'digital' && ec.store === c.store)));
          if (!dup) { if (!existing.copies) existing.copies = []; existing.copies.push(c); changed = true; }
        }
        if (!changed) skipped++; else added++;
        continue;
      }
      games.push(g); newlyAdded.push(g); added++;
    }
    await window.api.saveGames(games);
    for (const g of newlyAdded) {
      const coverId = g.igdbId || g.rawgId;
      if (coverId && g.coverPath) window.api.downloadCover(coverId, g.coverPath).catch(() => {});
    }
    updateCount(); populateFilters(); batchQueue = []; renderBatchQueue();
    alert(`${added} added, ${skipped} skipped.`);
  }

  // ══════════════════════════════════════════════════════════════
  //  IMPORT
  // ══════════════════════════════════════════════════════════════

  let currentImportSource = '';
  let currentImportTitles = [];

  function bindImport() {
    // Accordion
    document.querySelectorAll('.import-card-header').forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.import-card');
        if (card.classList.contains('disabled')) return;
        const wasOpen = card.classList.contains('open');
        document.querySelectorAll('.import-card').forEach(c => c.classList.remove('open'));
        if (!wasOpen) card.classList.add('open');
      });
    });

    // Drop zones
    document.querySelectorAll('.import-drop').forEach(zone => {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const source = zone.dataset.import;
        await handleImportFile(file, source);
      });
    });

    // File pickers
    document.querySelectorAll('.import-pick-file').forEach(btn => {
      btn.addEventListener('click', async () => {
        const source = btn.dataset.import;
        if (source === 'csv') {
          const fp = await window.api.pickImportFile();
          if (fp) await handleImportPath(fp, source);
        } else if (source === 'letterboxd') {
          const fp = await window.api.pickLetterboxdFile();
          if (fp) await handleImportPath(fp, source);
        } else {
          const fp = await window.api.pickImportHtmlFile();
          if (fp) await handleImportPath(fp, source);
        }
      });
    });

    document.getElementById('import-execute-btn')?.addEventListener('click', async () => { await executeImport(); });
  }

  async function handleImportFile(file, source) {
    const buffer = await file.arrayBuffer();
    const tmpPath = await window.api.saveTempFile(buffer, file.name);
    await handleImportPath(tmpPath, source);
  }

  async function handleImportPath(fp, source) {
    try {
      currentImportSource = source;
      if (source === 'csv') {
        const entries = await window.api.parseCsvImport(fp);
        currentImportTitles = entries;
        renderImportPreview();
      } else if (source === 'letterboxd') {
        const entries = await window.api.parseLetterboxd(fp);
        currentImportTitles = entries.map(e => ({ name: e.name, year: e.year, rating: e.rating, review: e.review, watched: !!e.watched }));
        renderImportPreview();
      } else {
        const titles = await window.api.parseImportHtml(fp, source);
        currentImportTitles = titles.map(t => ({ name: t, year: 0, rating: 0 }));
        renderImportPreview();
      }
    } catch (e) { alert(`Failed to parse file: ${e.message}`); }
  }

  function sourceLabel(source) {
    return { 'youtube': 'YouTube', 'movies-anywhere': 'Movies Anywhere', 'fandango': 'Fandango At Home', 'letterboxd': 'Letterboxd', 'csv': 'CSV' }[source] || source;
  }

  function sourceDigitalFormat(source) {
    return { 'youtube': 'YouTube', 'movies-anywhere': 'Movies Anywhere', 'fandango': 'Fandango At Home' }[source] || '';
  }

  function renderImportPreview() {
    const isLetterboxd = currentImportSource === 'letterboxd';
    const isGameImport = currentImportSource === 'csv';
    document.getElementById('import-preview').style.display = 'block';
    document.getElementById('import-result').style.display = 'none';
    document.getElementById('import-progress').style.display = 'none';
    document.getElementById('import-count').textContent = `\u2014 ${currentImportTitles.length} titles${!isGameImport ? ' from ' + sourceLabel(currentImportSource) : ''}`;

    const addNewCb = document.getElementById('import-add-new');
    const updateCb = document.getElementById('import-update-existing');
    if (isGameImport) {
      if (addNewCb) addNewCb.checked = true;
      if (updateCb) updateCb.checked = false;
    } else {
      if (addNewCb) addNewCb.checked = !isLetterboxd;
      if (updateCb) updateCb.checked = true;
    }

    const container = document.getElementById('import-entries');
    container.innerHTML = currentImportTitles.map(e => `
      <div class="lb-entry">
        <span class="lb-name">${esc(e.name)}${e.year ? ` <span class="lb-year">(${e.year})</span>` : (e.platform ? ` <span class="lb-year">(${esc(e.platform)})</span>` : '')}</span>
        <span class="lb-rating">${isLetterboxd && e.rating ? ratingStars(e.rating) : ''}</span>
        ${isLetterboxd && e.review ? '<span style="font-size:11px;color:var(--text-muted)">\uD83D\uDCDD</span>' : ''}
      </div>
    `).join('');
  }

  async function executeImport() {
    if (currentImportSource === 'csv') return executeGameImport();
    return executeMovieImport();
  }

  // ── Title normalization for movie import matching ──
  function normTitle(t) {
    return t.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/[–—−‐]/g, '-')
      .replace(/[·]/g, '-')
      .replace(/[*]/g, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s*\((?:unrated|theatrical|extended|director'?s?\s*cut|extended edition|extended version|\d{4})\)/gi, '')
      .replace(/^marvel studios['']?\s*/i, '')
      .replace(/^disney['']?s?\s*/i, '')
      .replace(/^dr\.\s*seuss['']?\s*/i, '')
      .replace(/^[\w.]+\s+[\w.]+['']s\s+(?=the\s)/i, '')
      .replace(/:/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function wordSimilarity(a, b) {
    const wa = new Set(a.split(/\s+/));
    const wb = new Set(b.split(/\s+/));
    if (!wa.size || !wb.size) return 0;
    let inter = 0;
    for (const w of wa) if (wb.has(w)) inter++;
    return inter / new Set([...wa, ...wb]).size;
  }

  function findFuzzyCandidates(entryNorm, entryYear, byNorm) {
    const candidates = [];
    for (const [libKey, libMovies] of byNorm) {
      const m = libMovies[0];
      const libYear = parseInt((m.releaseDate || '').split('-')[0]) || 0;
      if (entryYear && libYear && Math.abs(libYear - entryYear) > 1) continue;
      const isContained = libKey.startsWith(entryNorm + ' ') || entryNorm.startsWith(libKey + ' ');
      const sim = wordSimilarity(entryNorm, libKey);
      if (isContained || sim >= 0.5) {
        const score = isContained ? Math.max(sim, 0.85) : sim;
        candidates.push({ movie: m, score, libTitle: m.title, libYear });
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, 3);
  }

  function showFuzzyReview(fuzzyItems) {
    return new Promise(resolve => {
      const reviewDiv = document.getElementById('import-fuzzy-review');
      if (!fuzzyItems.length) { resolve([]); return; }
      let html = `<div class="fuzzy-review-header"><h3>Review Possible Matches</h3>
        <p class="muted">These titles didn't match exactly but look similar to movies in your library. Check the ones that are the same movie, then click Confirm.</p>
      </div><div class="fuzzy-review-list">`;
      for (let i = 0; i < fuzzyItems.length; i++) {
        const { entry, candidates } = fuzzyItems[i];
        html += `<div class="fuzzy-group"><div class="fuzzy-source"><strong>${esc(entry.name)}</strong>${entry.year ? ` <span class="lb-year">(${entry.year})</span>` : ''}${entry.rating ? ` <span class="fuzzy-rating">${ratingStars(entry.rating)}</span>` : ''}</div><div class="fuzzy-candidates">`;
        for (let j = 0; j < candidates.length; j++) {
          const c = candidates[j];
          html += `<label class="fuzzy-candidate"><input type="radio" name="fuzzy-${i}" value="${j}"><span class="fuzzy-match-info"><span class="fuzzy-match-title">${esc(c.libTitle)}</span><span class="fuzzy-match-year">(${c.libYear})</span><span class="fuzzy-match-pct">${Math.round(c.score * 100)}%</span></span></label>`;
        }
        html += `<label class="fuzzy-candidate fuzzy-candidate-none"><input type="radio" name="fuzzy-${i}" value="none" checked><span class="fuzzy-match-info"><span class="fuzzy-match-title muted">Not a match</span></span></label></div></div>`;
      }
      html += `</div><div class="fuzzy-review-actions"><button class="btn" id="fuzzy-select-all">Select All Top Matches</button><button class="btn btn-primary" id="fuzzy-confirm">Confirm</button></div>`;
      reviewDiv.innerHTML = html;
      reviewDiv.style.display = 'block';
      document.getElementById('fuzzy-select-all').addEventListener('click', () => {
        for (let i = 0; i < fuzzyItems.length; i++) { const r = reviewDiv.querySelector(`input[name="fuzzy-${i}"][value="0"]`); if (r) r.checked = true; }
      });
      document.getElementById('fuzzy-confirm').addEventListener('click', () => {
        const accepted = [];
        for (let i = 0; i < fuzzyItems.length; i++) {
          const sel = reviewDiv.querySelector(`input[name="fuzzy-${i}"]:checked`);
          if (sel && sel.value !== 'none') accepted.push({ entry: fuzzyItems[i].entry, match: fuzzyItems[i].candidates[parseInt(sel.value)].movie });
        }
        reviewDiv.style.display = 'none'; reviewDiv.innerHTML = '';
        resolve(accepted);
      });
    });
  }

  async function executeMovieImport() {
    const source = currentImportSource;
    const entries = currentImportTitles;
    const digitalFormat = sourceDigitalFormat(source);
    const isLetterboxd = source === 'letterboxd';
    const addNew = document.getElementById('import-add-new')?.checked;
    const updateExisting = document.getElementById('import-update-existing')?.checked;

    document.getElementById('import-progress').style.display = 'block';
    document.getElementById('import-execute-btn').disabled = true;
    const bar = document.getElementById('import-progress-bar');
    const text = document.getElementById('import-progress-text');

    let matched = 0, added = 0, updated = 0, skipped = 0;
    const unmatched = [];
    const total = entries.length;

    const byNorm = new Map();
    for (const m of movies) {
      const key = normTitle(m.title);
      if (!byNorm.has(key)) byNorm.set(key, []);
      byNorm.get(key).push(m);
    }
    const byTmdbId = new Map(movies.map(m => [m.tmdbId, m]));

    // Phase 1: exact & containment
    const noMatch = [];
    for (let i = 0; i < total; i++) {
      const entry = entries[i];
      bar.style.width = `${((i + 1) / total * 100).toFixed(1)}%`;
      text.textContent = `Matching ${i + 1}/${total}: ${entry.name}`;
      const key = normTitle(entry.name);
      let candidates = byNorm.get(key);
      if (!candidates) {
        for (const [libKey, libMovies] of byNorm) {
          if (libKey.startsWith(key + ' ') || key.startsWith(libKey + ' ')) {
            const libYear = parseInt((libMovies[0].releaseDate || '').split('-')[0]) || 0;
            if (!entry.year || Math.abs(libYear - entry.year) <= 1) { candidates = libMovies; break; }
          }
        }
      }
      if (candidates?.length) {
        matched++;
        const match = candidates.length === 1 ? candidates[0] : candidates.find(m => entry.year && parseInt((m.releaseDate || '').split('-')[0]) === entry.year) || candidates[0];
        let didUpdate = false;
        if (updateExisting) {
          if (digitalFormat) {
            if (!match.formats) match.formats = { physical: [], digital: [] };
            if (!match.formats.digital) match.formats.digital = [];
            if (!match.formats.digital.includes(digitalFormat)) { match.formats.digital.push(digitalFormat); didUpdate = true; }
          }
          if (isLetterboxd && entry.rating && (!match.rating || match.rating === 0)) { match.rating = entry.rating; didUpdate = true; }
          if (isLetterboxd && entry.watched && !match.watched) { match.watched = true; didUpdate = true; }
        }
        if (didUpdate) updated++; else skipped++;
      } else { noMatch.push(entry); }
    }

    // Phase 2: fuzzy
    const fuzzyItems = [];
    for (const entry of noMatch) {
      const fuzzyCandidates = findFuzzyCandidates(normTitle(entry.name), entry.year, byNorm);
      if (fuzzyCandidates.length > 0) fuzzyItems.push({ entry, candidates: fuzzyCandidates });
    }

    // Phase 3: fuzzy review
    let fuzzyAccepted = [];
    if (fuzzyItems.length > 0) {
      document.getElementById('import-progress').style.display = 'none';
      fuzzyAccepted = await showFuzzyReview(fuzzyItems);
      document.getElementById('import-progress').style.display = 'block';
    }
    const fuzzyAcceptedEntries = new Set(fuzzyAccepted.map(a => a.entry));
    for (const { entry, match } of fuzzyAccepted) {
      matched++;
      let didUpdate = false;
      if (updateExisting) {
        if (digitalFormat) {
          if (!match.formats) match.formats = { physical: [], digital: [] };
          if (!match.formats.digital) match.formats.digital = [];
          if (!match.formats.digital.includes(digitalFormat)) { match.formats.digital.push(digitalFormat); didUpdate = true; }
        }
        if (isLetterboxd && entry.rating && (!match.rating || match.rating === 0)) { match.rating = entry.rating; didUpdate = true; }
        if (isLetterboxd && entry.watched && !match.watched) { match.watched = true; didUpdate = true; }
      }
      if (didUpdate) updated++; else skipped++;
    }

    // Phase 4: TMDB lookup remaining
    const remaining = noMatch.filter(e => !fuzzyAcceptedEntries.has(e));
    for (let i = 0; i < remaining.length; i++) {
      const entry = remaining[i];
      bar.style.width = `${((i + 1) / remaining.length * 100).toFixed(1)}%`;
      text.textContent = `TMDB lookup ${i + 1}/${remaining.length}: ${entry.name}`;
      if (addNew) {
        try {
          const searchName = entry.name
            .replace(/\s*\((?:Unrated|Theatrical|Extended|Director'?s?\s*Cut|Extended Edition|Extended Version|\d{4})\)/gi, '')
            .replace(/^Marvel Studios['']?\s*/i, '').replace(/^Disney['']?s?\s*/i, '').replace(/^Dr\.\s*Seuss['']?\s*/i, '').trim();
          const data = await window.api.tmdbSearch(searchName);
          const results = data.results || [];
          let best = results.find(r => { const y = r.release_date ? parseInt(r.release_date.substring(0, 4)) : 0; return entry.year && y === entry.year; }) || results[0];
          if (best) {
            if (byTmdbId.has(best.id)) {
              const existing = byTmdbId.get(best.id);
              matched++;
              let didUpdate = false;
              if (updateExisting && digitalFormat) {
                if (!existing.formats) existing.formats = { physical: [], digital: [] };
                if (!existing.formats.digital) existing.formats.digital = [];
                if (!existing.formats.digital.includes(digitalFormat)) { existing.formats.digital.push(digitalFormat); didUpdate = true; }
              }
              if (updateExisting && isLetterboxd && entry.rating && (!existing.rating || existing.rating === 0)) { existing.rating = entry.rating; didUpdate = true; }
              if (updateExisting && isLetterboxd && entry.watched && !existing.watched) { existing.watched = true; didUpdate = true; }
              if (didUpdate) updated++; else skipped++;
            } else {
              let details = null;
              try { details = await window.api.tmdbDetails(best.id); } catch {}
              const movie = {
                tmdbId: best.id, title: best.title, releaseDate: best.release_date || '',
                overview: best.overview || '', posterPath: best.poster_path || '',
                genres: details?.genres ? details.genres.map(g => g.name) : [],
                director: '', cast: [], rating: entry.rating || 0, tags: [], customTags: {},
                formats: { physical: [], digital: digitalFormat ? [digitalFormat] : [] },
                digitalQuality: [], watched: !!entry.watched,
              };
              if (details?.credits) {
                const dir = details.credits.crew?.find(c => c.job === 'Director');
                if (dir) movie.director = dir.name;
                movie.cast = (details.credits.cast || []).slice(0, 3).map(c => c.name);
              }
              if (!movies.some(m => m.tmdbId === movie.tmdbId)) {
                movies.push(movie);
                const nk = normTitle(movie.title);
                if (!byNorm.has(nk)) byNorm.set(nk, []);
                byNorm.get(nk).push(movie);
                byTmdbId.set(movie.tmdbId, movie);
                added++;
                if (movie.tmdbId && movie.posterPath) window.api.downloadPoster(movie.tmdbId, movie.posterPath).catch(() => {});
              } else { skipped++; }
            }
          } else { skipped++; unmatched.push(entry.name); }
          await new Promise(r => setTimeout(r, 250));
        } catch { skipped++; unmatched.push(entry.name); }
      } else { skipped++; unmatched.push(entry.name); }
    }

    await window.api.saveMovies(movies);
    updateCount(); populateFilters();
    document.getElementById('import-execute-btn').disabled = false;
    document.getElementById('import-progress').style.display = 'none';

    const resultDiv = document.getElementById('import-result');
    resultDiv.style.display = 'block';
    let resultHtml = `<div class="callout" style="background:rgba(48,209,88,0.1);border:1px solid rgba(48,209,88,0.3);color:var(--success)">
      <strong>Import Complete \u2014 ${sourceLabel(source)}</strong><br>
      Matched: ${matched} \u00B7 Added: ${added} \u00B7 Updated: ${updated} \u00B7 Skipped: ${skipped}
    </div>`;
    if (unmatched.length > 0) {
      resultHtml += `<div class="callout" style="background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.3);color:var(--warning);margin-top:10px">
        <strong>${unmatched.length} unmatched title${unmatched.length !== 1 ? 's' : ''}</strong>
        <span class="muted" style="margin-left:4px">(not found in your library)</span>
        <div style="margin-top:8px;max-height:200px;overflow-y:auto;font-size:11px;color:var(--text-secondary);line-height:1.7">${unmatched.map(t => esc(t)).join('<br>')}</div>
      </div>`;
    }
    resultDiv.innerHTML = resultHtml;
  }

  async function executeGameImport() {
    const entries = currentImportTitles;
    const addNew = document.getElementById('import-add-new')?.checked;
    document.getElementById('import-progress').style.display = 'block';
    document.getElementById('import-execute-btn').disabled = true;
    const bar = document.getElementById('import-progress-bar');
    const text = document.getElementById('import-progress-text');

    let added = 0, skipped = 0;
    const unmatched = [];
    const total = entries.length;

    for (let i = 0; i < total; i++) {
      const entry = entries[i];
      bar.style.width = `${((i + 1) / total * 100).toFixed(1)}%`;
      text.textContent = `Looking up ${i + 1}/${total}: ${entry.name}`;
      const normName = entry.name.toLowerCase().trim();
      if (games.some(g => g.title?.toLowerCase().trim() === normName)) { skipped++; continue; }
      if (!addNew) { skipped++; continue; }
      try {
        if (isIgdbMode()) {
          // IGDB search
          const results = await window.api.igdbSearch(entry.name);
          const best = (results || [])[0];
          if (best) {
            if (games.some(g => g.igdbId === best.id)) { skipped++; continue; }
            const game = {
              igdbId: best.id, title: best.name || '', releaseDate: '',
              overview: best.summary || '',
              coverPath: best.cover?.image_id ? `${IGDB_IMG_BIG}${best.cover.image_id}.jpg` : '',
              genres: (best.genres || []).map(g => g.name),
              developer: '', publisher: '',
              rating: 0, tags: [], customTags: {}, copies: [], played: false, completed: false,
            };
            if (best.first_release_date) {
              const d = new Date(best.first_release_date * 1000);
              game.releaseDate = d.toISOString().split('T')[0];
            }
            try {
              const data = await window.api.igdbDetails(best.id);
              if (data && data[0]) {
                const companies = data[0].involved_companies || [];
                game.developer = companies.filter(c => c.developer).map(c => c.company?.name).filter(Boolean).join(', ');
                game.publisher = companies.filter(c => c.publisher).map(c => c.company?.name).filter(Boolean).join(', ');
              }
            } catch {}
            if (entry.platform) {
              // Try to map via IGDB platform map or direct
              const mapped = Object.entries(IGDB_PLATFORM_MAP).find(([, v]) => v === entry.platform)?.[1] || entry.platform;
              if (PLATFORM_META[mapped]) game.copies.push({ platform: mapped, type: 'physical' });
            }
            games.push(game); added++;
            if (game.igdbId && game.coverPath) window.api.downloadCover(game.igdbId, game.coverPath).catch(() => {});
          } else { unmatched.push(entry.name); skipped++; }
        } else {
          // RAWG search
          const data = await window.api.rawgSearch(entry.name);
          const best = (data.results || [])[0];
          if (best) {
            if (games.some(g => g.rawgId === best.id)) { skipped++; continue; }
            let details = null;
            try { details = await window.api.rawgDetails(best.id); } catch {}
            const game = {
              rawgId: best.id, title: best.name, releaseDate: best.released || '',
              overview: details?.description_raw ? details.description_raw.substring(0, 1000) : '',
              coverPath: best.background_image || '',
              genres: details?.genres ? details.genres.map(g => g.name) : [],
              developer: details?.developers ? details.developers.map(d => d.name).join(', ') : '',
              publisher: details?.publishers ? details.publishers.map(p => p.name).join(', ') : '',
              rating: 0, tags: [], customTags: {}, copies: [], played: false, completed: false,
            };
            if (entry.platform) {
              const mapped = RAWG_PLATFORM_MAP[entry.platform] || entry.platform;
              if (PLATFORM_META[mapped]) game.copies.push({ platform: mapped, type: 'physical' });
            }
            games.push(game); added++;
            if (game.rawgId && game.coverPath) window.api.downloadCover(game.rawgId, game.coverPath).catch(() => {});
          } else { unmatched.push(entry.name); skipped++; }
        }
        await new Promise(r => setTimeout(r, 250));
      } catch { skipped++; unmatched.push(entry.name); }
    }

    await window.api.saveGames(games);
    updateCount(); populateFilters();
    document.getElementById('import-execute-btn').disabled = false;
    document.getElementById('import-progress').style.display = 'none';

    const resultDiv = document.getElementById('import-result');
    resultDiv.style.display = 'block';
    let resultHtml = `<div class="callout" style="background:rgba(48,209,88,0.1);border:1px solid rgba(48,209,88,0.3);color:var(--success)">
      <strong>Import Complete</strong><br>Added: ${added} \u00B7 Skipped: ${skipped}
    </div>`;
    if (unmatched.length > 0) {
      resultHtml += `<div class="callout" style="background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.3);color:var(--warning);margin-top:10px">
        <strong>${unmatched.length} unmatched title${unmatched.length !== 1 ? 's' : ''}</strong>
        <div style="margin-top:8px;max-height:200px;overflow-y:auto;font-size:11px;color:var(--text-secondary);line-height:1.7">${unmatched.map(t => esc(t)).join('<br>')}</div>
      </div>`;
    }
    resultDiv.innerHTML = resultHtml;
  }

  // ══════════════════════════════════════════════════════════════
  //  SETTINGS
  // ══════════════════════════════════════════════════════════════

  function bindSettings() {
    document.getElementById('s-choose-dir')?.addEventListener('click', async () => {
      const dir = await window.api.chooseLibraryDir();
      if (dir) document.getElementById('s-library-path').value = dir;
    });

    // Poster mode radio
    document.querySelectorAll('input[name="poster-mode"]').forEach(r => {
      r.addEventListener('change', () => {
        const warn = document.getElementById('stream-warning');
        if (warn) warn.style.display = r.value === 'stream' && r.checked ? 'block' : 'none';
      });
    });

    // Links
    document.getElementById('tmdb-link')?.addEventListener('click', (e) => { e.preventDefault(); window.open('https://www.themoviedb.org/settings/api'); });
    document.getElementById('rawg-link')?.addEventListener('click', (e) => { e.preventDefault(); window.open('https://rawg.io/apidocs'); });
    document.getElementById('igdb-link')?.addEventListener('click', (e) => { e.preventDefault(); window.open('https://dev.twitch.tv/console'); });

    // Custom fields
    document.getElementById('s-custom-field-add')?.addEventListener('click', () => {
      const input = document.getElementById('s-custom-field-input');
      const val = input.value.trim();
      if (!val) return;
      if (!config.customFields) config.customFields = [];
      if (!config.customFields.includes(val)) { config.customFields.push(val); renderSettingsCustomFields(); renderCustomFieldCheckboxes(); }
      input.value = '';
    });
    document.getElementById('s-custom-field-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('s-custom-field-add')?.click(); }
    });

    // Save
    document.getElementById('s-save')?.addEventListener('click', async () => {
      const libPath = document.getElementById('s-library-path').value.trim();
      const tmdbKey = document.getElementById('s-tmdb-key').value.trim();
      const rawgKey = document.getElementById('s-rawg-key').value.trim();
      const igdbClientId = document.getElementById('s-igdb-client-id')?.value.trim() || '';
      const igdbClientSecret = document.getElementById('s-igdb-client-secret')?.value.trim() || '';
      const gameApi = document.querySelector('input[name="game-api"]:checked')?.value || 'igdb';
      const posterMode = document.querySelector('input[name="poster-mode"]:checked')?.value || 'local';
      const coverMode  = document.querySelector('input[name="cover-mode"]:checked')?.value || 'remote';

      const tmdbInConfig = document.getElementById('s-tmdb-key-in-config')?.checked || false;
      const rawgInConfig = document.getElementById('s-rawg-key-in-config')?.checked || false;
      const igdbInConfig = document.getElementById('s-igdb-in-config')?.checked || false;

      await window.api.saveSettings({
        libraryPath: libPath,
        tmdbApiKey: tmdbKey,
        rawgApiKey: rawgKey,
        igdbClientId: igdbClientId,
        igdbClientSecret: igdbClientSecret,
        tmdbKeyInConfig: tmdbInConfig,
        rawgKeyInConfig: rawgInConfig,
        igdbInConfig: igdbInConfig,
      });
      settings.libraryPath = libPath;
      settings.tmdbApiKey = tmdbKey;
      settings.rawgApiKey = rawgKey;
      settings.igdbClientId = igdbClientId;
      settings.igdbClientSecret = igdbClientSecret;
      settings.tmdbKeyInConfig = tmdbInConfig;
      settings.rawgKeyInConfig = rawgInConfig;
      settings.igdbInConfig = igdbInConfig;

      if (tmdbInConfig) config.tmdbApiKey = tmdbKey; else delete config.tmdbApiKey;
      if (rawgInConfig) config.rawgApiKey = rawgKey; else delete config.rawgApiKey;
      if (igdbInConfig) { config.igdbClientId = igdbClientId; config.igdbClientSecret = igdbClientSecret; }
      else { delete config.igdbClientId; delete config.igdbClientSecret; }
      config.gameApi = gameApi;
      config.posterMode = posterMode;
      config.coverMode  = coverMode;
      config.featured = document.getElementById('s-featured')?.checked || false;
      config.tvShows  = document.getElementById('s-tvshows')?.checked ?? true;
      config.games    = document.getElementById('s-games')?.checked ?? true;
      await window.api.saveConfig(config);

      await loadLibrary();

      const status = document.getElementById('s-save-status');
      status.textContent = '\u2713 Saved';
      status.classList.add('visible');
      setTimeout(() => status.classList.remove('visible'), 2000);
    });

    // Download posters
    document.getElementById('s-download-posters')?.addEventListener('click', async () => {
      const btn = document.getElementById('s-download-posters');
      btn.disabled = true; btn.textContent = 'Downloading\u2026';
      document.getElementById('poster-download-progress').style.display = 'block';
      window.api.onPosterProgress((data) => {
        const pct = ((data.current / data.total) * 100).toFixed(1);
        document.getElementById('poster-progress-bar').style.width = `${pct}%`;
        document.getElementById('poster-progress-text').textContent = `${data.current}/${data.total}: ${data.title}`;
      });
      try {
        const result = await window.api.downloadPosters();
        document.getElementById('poster-progress-text').textContent = `Done! Downloaded: ${result.downloaded} \u00B7 Skipped: ${result.skipped} \u00B7 Failed: ${result.failed}`;
      } catch (e) { document.getElementById('poster-progress-text').textContent = `Error: ${e.message}`; }
      btn.disabled = false; btn.textContent = 'Download Missing Posters';
    });
    document.getElementById('s-reveal-posters')?.addEventListener('click', () => { window.api.revealPosters(); });

    // Download covers
    document.getElementById('s-download-covers')?.addEventListener('click', async () => {
      const btn = document.getElementById('s-download-covers');
      btn.disabled = true; btn.textContent = 'Downloading\u2026';
      document.getElementById('cover-download-progress').style.display = 'block';
      window.api.onCoverProgress((data) => {
        const pct = ((data.current / data.total) * 100).toFixed(1);
        document.getElementById('cover-progress-bar').style.width = `${pct}%`;
        document.getElementById('cover-progress-text').textContent = `${data.current}/${data.total}: ${data.title}`;
      });
      try {
        const result = await window.api.downloadCovers();
        document.getElementById('cover-progress-text').textContent = `Done! Downloaded: ${result.downloaded} \u00B7 Skipped: ${result.skipped} \u00B7 Failed: ${result.failed}`;
      } catch (e) { document.getElementById('cover-progress-text').textContent = `Error: ${e.message}`; }
      btn.disabled = false; btn.textContent = 'Download Missing Covers';
    });
    document.getElementById('s-reveal-covers')?.addEventListener('click', () => { window.api.revealCovers(); });
  }

  function populateSettings() {
    document.getElementById('s-library-path').value = settings.libraryPath || '';

    const tmdbKey = settings.tmdbApiKey || config.tmdbApiKey || '';
    document.getElementById('s-tmdb-key').value = tmdbKey;
    const tmdbInConfig = settings.tmdbKeyInConfig ?? !!config.tmdbApiKey;
    const tmdbCb = document.getElementById('s-tmdb-key-in-config');
    if (tmdbCb) tmdbCb.checked = tmdbInConfig;

    const rawgKey = settings.rawgApiKey || config.rawgApiKey || '';
    document.getElementById('s-rawg-key').value = rawgKey;
    const rawgInConfig = settings.rawgKeyInConfig ?? !!config.rawgApiKey;
    const rawgCb = document.getElementById('s-rawg-key-in-config');
    if (rawgCb) rawgCb.checked = rawgInConfig;

    // IGDB credentials
    const igdbId = settings.igdbClientId || config.igdbClientId || '';
    const igdbClientIdEl = document.getElementById('s-igdb-client-id');
    if (igdbClientIdEl) igdbClientIdEl.value = igdbId;
    const igdbSecret = settings.igdbClientSecret || config.igdbClientSecret || '';
    const igdbClientSecretEl = document.getElementById('s-igdb-client-secret');
    if (igdbClientSecretEl) igdbClientSecretEl.value = igdbSecret;
    const igdbInConfig = settings.igdbInConfig ?? !!(config.igdbClientId);
    const igdbCb = document.getElementById('s-igdb-in-config');
    if (igdbCb) igdbCb.checked = igdbInConfig;

    // Game API preference
    const gameApi = config.gameApi || 'igdb';
    document.querySelectorAll('input[name="game-api"]').forEach(r => { r.checked = r.value === gameApi; });

    const posterMode = config.posterMode || 'local';
    document.querySelectorAll('input[name="poster-mode"]').forEach(r => { r.checked = r.value === posterMode; });
    const warn = document.getElementById('stream-warning');
    if (warn) warn.style.display = posterMode === 'stream' ? 'block' : 'none';

    const coverMode = config.coverMode || 'remote';
    document.querySelectorAll('input[name="cover-mode"]').forEach(r => { r.checked = r.value === coverMode; });

    const featuredCb = document.getElementById('s-featured');
    if (featuredCb) featuredCb.checked = !!config.featured;

    const tvShowsCb = document.getElementById('s-tvshows');
    if (tvShowsCb) tvShowsCb.checked = config.tvShows !== false;

    const gamesCb = document.getElementById('s-games');
    if (gamesCb) gamesCb.checked = config.games !== false;

    renderSettingsCustomFields();
  }

  function renderSettingsCustomFields() {
    const container = document.getElementById('s-custom-fields-list');
    if (!container) return;
    const fields = config.customFields || [];
    if (fields.length === 0) {
      container.innerHTML = '<span style="font-size:12px;color:var(--text-muted)">No custom fields defined.</span>';
      return;
    }
    container.innerHTML = fields.map((f, i) =>
      `<span class="custom-field-tag">${esc(f)}<span class="cf-remove" data-idx="${i}">&times;</span></span>`
    ).join('');
    container.querySelectorAll('.cf-remove').forEach(el => {
      el.addEventListener('click', () => { config.customFields.splice(parseInt(el.dataset.idx), 1); renderSettingsCustomFields(); renderCustomFieldCheckboxes(); });
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  CUSTOM FIELD CHECKBOXES
  // ══════════════════════════════════════════════════════════════

  function renderCustomFieldCheckboxes() {
    const container = document.getElementById('custom-field-chips');
    const group = document.getElementById('custom-fields-group');
    if (!container || !group) return;
    const fields = config.customFields || [];
    if (fields.length === 0) { group.style.display = 'none'; container.innerHTML = ''; return; }
    group.style.display = '';
    container.innerHTML = fields.map(f => {
      const id = `cf-${f.replace(/\s+/g, '-').toLowerCase()}`;
      return `<label class="format-chip"><input type="checkbox" class="cf-cb" value="${esc(f)}" id="${id}"><span>${esc(f)}</span></label>`;
    }).join('');
  }

})();
