/* ============================================================
   My Media DB — manage.js
   Admin page: TMDB / IGDB / RAWG search, add / edit / delete, save JSON
   Handles all three modes: Movies, TV Shows, Games
   ============================================================ */

const Manage = (() => {
  'use strict';

  // ---------- Format definitions (Movies / TV) ----------
  const FORMAT_META = {
    'VCD':             { category: 'physical', label: 'VCD' },
    'DVD':             { category: 'physical', label: 'DVD' },
    'Blu-Ray':         { category: 'physical', label: 'Blu-Ray' },
    'UHD Blu-Ray':     { category: 'physical', label: 'UHD Blu-Ray' },
    '3D DVD':          { category: 'physical', label: '3D DVD' },
    '3D Blu-Ray':      { category: 'physical', label: '3D Blu-Ray' },
    'Apple TV':        { category: 'digital',  label: 'Apple TV' },
    'YouTube':         { category: 'digital',  label: 'YouTube' },
    'Google Play':     { category: 'digital',  label: 'Google Play' },
    'Fandango At Home':{ category: 'digital',  label: 'Fandango At Home' },
    'Xfinity':         { category: 'digital',  label: 'Xfinity' },
    'Verizon':         { category: 'digital',  label: 'Verizon' },
    'DirecTV':         { category: 'digital',  label: 'DirecTV' },
    'Prime Video':     { category: 'digital',  label: 'Prime Video' },
    'Movies Anywhere': { category: 'digital',  label: 'Movies Anywhere' },
    'Plex':            { category: 'digital',  label: 'Plex' },
  };

  // ---------- Platform definitions (Games) ----------
  const PLATFORM_META = {
    'NES':             { family: 'Nintendo',     label: 'NES' },
    'SNES':            { family: 'Nintendo',     label: 'SNES' },
    'Nintendo 64':     { family: 'Nintendo',     label: 'N64' },
    'GameCube':        { family: 'Nintendo',     label: 'GameCube' },
    'Wii':             { family: 'Nintendo',     label: 'Wii' },
    'Wii U':           { family: 'Nintendo',     label: 'Wii U' },
    'Nintendo Switch': { family: 'Nintendo',     label: 'Switch' },
    'Game Boy':        { family: 'Nintendo',     label: 'Game Boy' },
    'Game Boy Color':  { family: 'Nintendo',     label: 'GBC' },
    'Game Boy Advance':{ family: 'Nintendo',     label: 'GBA' },
    'Nintendo DS':     { family: 'Nintendo',     label: 'DS' },
    'Nintendo 3DS':    { family: 'Nintendo',     label: '3DS' },
    'PlayStation':     { family: 'PlayStation',   label: 'PS1' },
    'PlayStation 2':   { family: 'PlayStation',   label: 'PS2' },
    'PlayStation 3':   { family: 'PlayStation',   label: 'PS3' },
    'PlayStation 4':   { family: 'PlayStation',   label: 'PS4' },
    'PlayStation 5':   { family: 'PlayStation',   label: 'PS5' },
    'PSP':             { family: 'PlayStation',   label: 'PSP' },
    'PS Vita':         { family: 'PlayStation',   label: 'PS Vita' },
    'Xbox':            { family: 'Xbox',          label: 'Xbox' },
    'Xbox 360':        { family: 'Xbox',          label: 'Xbox 360' },
    'Xbox One':        { family: 'Xbox',          label: 'Xbox One' },
    'Xbox Series S/X': { family: 'Xbox',          label: 'Xbox Series' },
    'PC':              { family: 'PC',            label: 'PC' },
    'macOS':           { family: 'PC',            label: 'macOS' },
    'Linux':           { family: 'PC',            label: 'Linux' },
    'Genesis':         { family: 'Sega',          label: 'Genesis' },
    'Sega Saturn':     { family: 'Sega',          label: 'Saturn' },
    'Dreamcast':       { family: 'Sega',          label: 'Dreamcast' },
    'Game Gear':       { family: 'Sega',          label: 'Game Gear' },
    'Sega Master System': { family: 'Sega',       label: 'Master System' },
    'Atari 2600':      { family: 'Atari',         label: 'Atari 2600' },
    'Atari 5200':      { family: 'Atari',         label: 'Atari 5200' },
    'Atari 7800':      { family: 'Atari',         label: 'Atari 7800' },
    'Atari Jaguar':    { family: 'Atari',         label: 'Jaguar' },
    'Atari Lynx':      { family: 'Atari',         label: 'Lynx' },
    // Mobile
    'Android':         { family: 'Mobile',        label: 'Android' },
    'iOS':             { family: 'Mobile',        label: 'iOS' },
    'iPadOS':          { family: 'Mobile',        label: 'iPadOS' },
    // Other
    'Neo Geo':         { family: 'Other',         label: 'Neo Geo' },
    'TurboGrafx-16':   { family: 'Other',         label: 'TurboGrafx-16' },
    '3DO':             { family: 'Other',         label: '3DO' },
  };

  const STORE_META = {
    'Steam':              { label: 'Steam' },
    'PlayStation Store':  { label: 'PlayStation Store' },
    'Xbox Store':         { label: 'Xbox / MS Store' },
    'Nintendo eShop':     { label: 'Nintendo eShop' },
    'Epic Games Store':   { label: 'Epic Games' },
    'GOG':                { label: 'GOG' },
    'Humble Bundle':      { label: 'Humble Bundle' },
    'EA App':             { label: 'EA App' },
    'Ubisoft Connect':    { label: 'Ubisoft Connect' },
    'Battle.net':         { label: 'Battle.net' },
    'itch.io':            { label: 'itch.io' },
    'Amazon Luna':        { label: 'Amazon Luna' },
    'Google Play':        { label: 'Google Play' },
    'Apple App Store':    { label: 'Apple App Store' },
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

  // RAWG platform name → our platform key mapping
  const RAWG_PLATFORM_MAP = {
    'PC': 'PC', 'PlayStation 5': 'PlayStation 5', 'PlayStation 4': 'PlayStation 4',
    'PlayStation 3': 'PlayStation 3', 'PlayStation 2': 'PlayStation 2', 'PlayStation': 'PlayStation',
    'PS Vita': 'PS Vita', 'PSP': 'PSP', 'Xbox Series S/X': 'Xbox Series S/X',
    'Xbox One': 'Xbox One', 'Xbox 360': 'Xbox 360', 'Xbox': 'Xbox',
    'Nintendo Switch': 'Nintendo Switch', 'Wii U': 'Wii U', 'Wii': 'Wii',
    'GameCube': 'GameCube', 'Nintendo 64': 'Nintendo 64', 'SNES': 'SNES', 'NES': 'NES',
    'Nintendo 3DS': 'Nintendo 3DS', 'Nintendo DS': 'Nintendo DS',
    'Game Boy Advance': 'Game Boy Advance', 'Game Boy Color': 'Game Boy Color', 'Game Boy': 'Game Boy',
    'macOS': 'macOS', 'Linux': 'Linux', 'Dreamcast': 'Dreamcast', 'Sega Saturn': 'Sega Saturn',
    'Genesis': 'Genesis', 'Game Gear': 'Game Gear', 'SEGA Master System': 'Sega Master System',
    'Atari 2600': 'Atari 2600', 'Atari 5200': 'Atari 5200', 'Atari 7800': 'Atari 7800',
    'Atari Jaguar': 'Atari Jaguar', 'Atari Lynx': 'Atari Lynx',
    'Neo Geo': 'Neo Geo', '3DO': '3DO',
    'iOS': 'iOS', 'Android': 'Android',
  };

  // IGDB platform ID → our platform key mapping
  const IGDB_PLATFORM_MAP = {
    6: 'PC', 14: 'macOS', 3: 'Linux',
    // PlayStation
    7: 'PlayStation', 8: 'PlayStation 2', 9: 'PlayStation 3',
    48: 'PlayStation 4', 167: 'PlayStation 5', 38: 'PSP', 46: 'PS Vita',
    // Xbox
    11: 'Xbox', 12: 'Xbox 360', 49: 'Xbox One', 169: 'Xbox Series S/X',
    // Nintendo
    18: 'NES', 19: 'SNES', 4: 'Nintendo 64', 21: 'GameCube',
    5: 'Wii', 41: 'Wii U', 130: 'Nintendo Switch',
    33: 'Game Boy', 22: 'Game Boy Color', 24: 'Game Boy Advance',
    20: 'Nintendo DS', 37: 'Nintendo 3DS',
    // Sega
    29: 'Genesis', 32: 'Sega Saturn', 23: 'Dreamcast',
    35: 'Game Gear', 64: 'Sega Master System',
    // Atari
    59: 'Atari 2600', 66: 'Atari 5200', 60: 'Atari 7800',
    62: 'Atari Jaguar', 61: 'Atari Lynx',
    // Mobile
    34: 'Android', 39: 'iOS',
    // Other
    80: 'Neo Geo', 86: 'TurboGrafx-16', 50: '3DO',
  };

  const PHYSICAL_FORMATS = ['VCD', 'DVD', 'Blu-Ray', 'UHD Blu-Ray', '3D DVD', '3D Blu-Ray'];
  const DIGITAL_FORMATS = Object.keys(FORMAT_META).filter(k => FORMAT_META[k].category === 'digital');

  let movies = [];
  let tvShows = [];
  let games = [];
  let config = {};
  let editIndex = -1;
  let debounceTimer = null;
  let genreMap = {};
  let tvGenreMap = {};
  let currentRating = 0;
  let currentTags = [];
  let availablePlatforms = [];
  let manageMode = 'movies'; // set from config.defaultMode in init
  let activeGameApi = 'igdb'; // 'igdb' or 'rawg', set from config.gameApi
  let igdbAccessToken = null;
  let igdbTokenExpiry = 0;

  /** Active dataset for current mode */
  function activeData() {
    if (manageMode === 'tv') return tvShows;
    if (manageMode === 'games') return games;
    return movies;
  }

  // ---------- Init ----------
  async function init() {
    try {
      const fetches = [
        fetch('data/config.json').then(r => r.json()),
        fetch('data/movies.json').then(r => r.json()),
        fetch('data/tvshows.json').then(r => { if (!r.ok) throw new Error('no tv'); return r.json(); }).catch(() => []),
        fetch('data/games.json').then(r => { if (!r.ok) throw new Error('no games'); return r.json(); }).catch(() => []),
      ];
      [config, movies, tvShows, games] = await Promise.all(fetches);
    } catch (e) {
      console.error('Failed to load data:', e);
      movies = []; tvShows = []; games = [];
      config = {};
    }
    activeGameApi = config.gameApi === 'rawg' ? 'rawg' : 'igdb';
    await loadGenreMap();
    // Apply mode order & default from config
    const modes = Array.isArray(config.modes) ? config.modes : ['movies', 'tv', 'games'];
    manageMode = modes.includes(config.defaultMode) ? config.defaultMode : modes[0];
    renderCustomFieldCheckboxes();
    bindModeTab(modes);
    renderTable();
    bindSearch();
    bindGameApiToggle();
    bindForm();
    bindStarPicker();
    bindTagInput();
    bindSeasonsBuilder();
    bindCopyBuilder();
    updateCount();
    toggleModeFields();
  }

  // ---------- Mode tabs ----------
  function bindModeTab(modes) {
    const tabContainer = document.getElementById('manageModeTab');
    if (!tabContainer) return;

    // Only show tabs when >1 mode is configured
    if (modes.length <= 1) {
      tabContainer.style.display = 'none';
      return;
    }
    tabContainer.style.display = '';

    // Reorder tabs to match config.modes and hide unconfigured ones
    const allItems = Array.from(tabContainer.querySelectorAll('.nav-item'));
    allItems.forEach(li => {
      li.style.display = 'none';
      const btn = li.querySelector('[data-manage-mode]');
      if (btn) btn.classList.remove('active');
    });
    modes.forEach(m => {
      const btn = tabContainer.querySelector(`[data-manage-mode="${m}"]`);
      if (btn) {
        const li = btn.parentElement;
        li.style.display = '';
        tabContainer.appendChild(li); // re-append in order
      }
    });
    // Mark default mode active
    tabContainer.querySelector(`[data-manage-mode="${manageMode}"]`)?.classList.add('active');

    tabContainer.querySelectorAll('[data-manage-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.manageMode;
        if (mode === manageMode) return;
        manageMode = mode;
        tabContainer.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        resetForm();
        renderTable();
        updateCount();
        toggleModeFields();
      });
    });
  }

  function toggleModeFields() {
    const formatsSection = document.getElementById('movie-formats-section');
    const copiesSection = document.getElementById('game-copies-section');
    const watchedSection = document.getElementById('watched-section');
    const playedSection = document.getElementById('played-section');
    const tvSection = document.getElementById('tv-seasons-section');
    const heading = document.getElementById('form-heading');
    const searchInput = document.getElementById('search-input');
    const searchLabel = document.getElementById('search-label');
    const submitBtn = document.getElementById('btn-submit');
    const thId = document.getElementById('th-id');
    const thExtra = document.getElementById('th-extra');
    const gameApiToggle = document.getElementById('gameApiToggle');

    if (manageMode === 'games') {
      if (formatsSection) formatsSection.style.display = 'none';
      if (copiesSection) copiesSection.style.display = '';
      if (watchedSection) watchedSection.style.display = 'none';
      if (playedSection) playedSection.style.display = '';
      if (tvSection) tvSection.style.display = 'none';
      if (heading) heading.textContent = editIndex >= 0 ? 'Edit Game' : 'Add Game';
      if (searchInput) searchInput.placeholder = 'Type a game title\u2026';
      if (searchLabel) searchLabel.textContent = activeGameApi === 'igdb' ? 'Search IGDB' : 'Search RAWG';
      if (submitBtn) submitBtn.textContent = editIndex >= 0 ? 'Update Game' : 'Add Game';
      if (thId) thId.textContent = activeGameApi === 'igdb' ? 'IGDB ID' : 'RAWG ID';
      if (thExtra) thExtra.textContent = 'Platforms';
      if (gameApiToggle) gameApiToggle.style.display = '';
    } else if (manageMode === 'tv') {
      if (formatsSection) formatsSection.style.display = 'none';
      if (copiesSection) copiesSection.style.display = 'none';
      if (watchedSection) watchedSection.style.display = '';
      if (playedSection) playedSection.style.display = 'none';
      if (tvSection) tvSection.style.display = '';
      if (heading) heading.textContent = editIndex >= 0 ? 'Edit TV Show' : 'Add TV Show';
      if (searchInput) searchInput.placeholder = 'Type a TV show title\u2026';
      if (searchLabel) searchLabel.textContent = 'Search TMDB';
      if (submitBtn) submitBtn.textContent = editIndex >= 0 ? 'Update TV Show' : 'Add TV Show';
      if (thId) thId.textContent = 'TMDB ID';
      if (thExtra) thExtra.textContent = 'Formats';
      if (gameApiToggle) gameApiToggle.style.display = 'none';
    } else {
      if (formatsSection) formatsSection.style.display = '';
      if (copiesSection) copiesSection.style.display = 'none';
      if (watchedSection) watchedSection.style.display = '';
      if (playedSection) playedSection.style.display = 'none';
      if (tvSection) tvSection.style.display = 'none';
      if (heading) heading.textContent = editIndex >= 0 ? 'Edit Movie' : 'Add Movie';
      if (searchInput) searchInput.placeholder = 'Type a movie title\u2026';
      if (searchLabel) searchLabel.textContent = 'Search TMDB';
      if (submitBtn) submitBtn.textContent = editIndex >= 0 ? 'Update Movie' : 'Add Movie';
      if (thId) thId.textContent = 'TMDB ID';
      if (thExtra) thExtra.textContent = 'Formats';
      if (gameApiToggle) gameApiToggle.style.display = 'none';
    }
  }

  // ---------- Custom field checkboxes ----------
  function renderCustomFieldCheckboxes() {
    const container = document.getElementById('custom-field-checks');
    if (!container) return;
    container.innerHTML = '';
    const fields = config.customFields || [];
    if (fields.length === 0) {
      container.innerHTML = '<span class="text-secondary" style="font-size:.8rem">None configured. Add fields in config.json</span>';
      return;
    }
    fields.forEach(f => {
      const id = `cf-${f.replace(/\s+/g, '-').toLowerCase()}`;
      const div = document.createElement('div');
      div.className = 'form-check';
      div.innerHTML = `<input class="form-check-input custom-field-cb" type="checkbox" value="${f}" id="${id}"><label class="form-check-label" for="${id}">${f}</label>`;
      container.appendChild(div);
    });
  }

  // ---------- Table ----------
  function renderTable() {
    const body = document.getElementById('items-tbody');
    if (!body) return;
    body.innerHTML = '';
    const data = activeData();

    if (data.length === 0) {
      const label = manageMode === 'games' ? 'games' : manageMode === 'tv' ? 'TV shows' : 'movies';
      body.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">No ${label} yet. Use the form above to add titles.</td></tr>`;
      return;
    }

    data.forEach((m, i) => {
      let idVal, extra;
      if (manageMode === 'games') {
        idVal = m.igdbId || m.rawgId || '';
        extra = (m.copies || []).map(c => {
          const meta = PLATFORM_META[c.platform];
          return meta ? meta.label : c.platform;
        }).join(', ');
      } else if (manageMode === 'tv') {
        idVal = m.tmdbId || '';
        const fmts = [];
        (m.seasons || []).forEach(s => {
          if (s.physical) fmts.push(s.physical);
          (s.digital || []).forEach(f => fmts.push(f));
        });
        if (m.boxSet?.physical) fmts.push(m.boxSet.physical);
        (m.boxSet?.digital || []).forEach(f => fmts.push(f));
        extra = [...new Set(fmts)].join(', ');
      } else {
        idVal = m.tmdbId || '';
        extra = [...(m.formats?.physical || []), ...(m.formats?.digital || [])].join(', ');
      }

      const stars = m.rating ? '★'.repeat(Math.floor(m.rating)) + (m.rating % 1 ? '½' : '') : '—';
      const dateVal = m.firstAirDate || m.releaseDate || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idVal}</td>
        <td>${escHtml(m.title)}</td>
        <td>${dateVal}</td>
        <td style="font-size:.82rem">${stars}</td>
        <td style="font-size:.82rem">${escHtml(extra)}</td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-light me-1" data-edit="${i}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${i}" title="Delete">🗑️</button>
        </td>`;
      body.appendChild(tr);
    });

    body.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => startEdit(parseInt(btn.dataset.edit)));
    });
    body.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(parseInt(btn.dataset.delete)));
    });
  }

  function updateCount() {
    const el = document.getElementById('item-count');
    const data = activeData();
    let label;
    if (manageMode === 'tv') label = 'show';
    else if (manageMode === 'games') label = 'game';
    else label = 'title';
    if (el) el.textContent = `${data.length} ${label}${data.length !== 1 ? 's' : ''}`;
  }

  // ---------- Genre map (TMDB) ----------
  async function loadGenreMap() {
    if (!config.tmdbApiKey || config.tmdbApiKey === 'YOUR_TMDB_API_KEY_HERE') return;
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${encodeURIComponent(config.tmdbApiKey)}&language=en-US`),
        fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${encodeURIComponent(config.tmdbApiKey)}&language=en-US`),
      ]);
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();
      (movieData.genres || []).forEach(g => { genreMap[g.id] = g.name; });
      (tvData.genres || []).forEach(g => { tvGenreMap[g.id] = g.name; });
    } catch (e) { console.warn('Could not load genre list:', e); }
  }

  // ---------- API Search (TMDB / RAWG) ----------
  function bindSearch() {
    const input = document.getElementById('search-input');
    const list = document.getElementById('api-results');
    if (!input || !list) return;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) { list.innerHTML = ''; list.style.display = 'none'; return; }
      debounceTimer = setTimeout(() => {
        if (manageMode === 'games') {
          if (activeGameApi === 'igdb') searchIgdb(q);
          else searchRawg(q);
        } else searchTmdb(q);
      }, 350);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-wrapper')) list.style.display = 'none';
    });
  }

  // -- TMDB Search (Movies / TV) --
  async function searchTmdb(query) {
    const list = document.getElementById('api-results');
    if (!config.tmdbApiKey || config.tmdbApiKey === 'YOUR_TMDB_API_KEY_HERE') {
      list.innerHTML = '<li class="text-warning px-3 py-2">Set your TMDB API key in data/config.json</li>';
      list.style.display = 'block';
      return;
    }
    try {
      const endpoint = manageMode === 'tv' ? 'search/tv' : 'search/movie';
      const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${encodeURIComponent(config.tmdbApiKey)}&query=${encodeURIComponent(query)}&include_adult=false`;
      const res = await fetch(url);
      const data = await res.json();
      renderTmdbResults(data.results || []);
    } catch (err) {
      console.error('TMDB search error:', err);
      list.innerHTML = '<li class="text-danger px-3 py-2">API error — check console</li>';
      list.style.display = 'block';
    }
  }

  function renderTmdbResults(results) {
    const list = document.getElementById('api-results');
    list.innerHTML = '';
    if (results.length === 0) {
      list.innerHTML = '<li class="text-secondary px-3 py-2">No results found</li>';
      list.style.display = 'block';
      return;
    }
    const imgBase = config.tmdbImageBase || 'https://image.tmdb.org/t/p/w500';
    results.slice(0, 10).forEach(r => {
      const title = r.title || r.name || '';
      const date = r.release_date || r.first_air_date || '';
      const year = date ? date.substring(0, 4) : '—';
      const thumb = r.poster_path ? `${imgBase}${r.poster_path}` : '';
      const li = document.createElement('li');
      li.innerHTML = `
        ${thumb ? `<img src="${thumb}" alt="">` : '<span style="width:32px;height:48px;display:inline-block;background:#333;border-radius:3px;flex-shrink:0;"></span>'}
        <span><span class="result-title">${escHtml(title)}</span> <span class="result-year">(${year})</span></span>`;
      li.addEventListener('click', () => selectTmdbResult(r));
      list.appendChild(li);
    });
    list.style.display = 'block';
  }

  async function selectTmdbResult(r) {
    const title = r.title || r.name || '';
    document.getElementById('search-input').value = title;
    document.getElementById('api-results').style.display = 'none';

    document.getElementById('field-apiId').value = r.id || '';
    document.getElementById('field-title').value = title;
    document.getElementById('field-overview').value = r.overview || '';
    document.getElementById('field-posterPath').value = r.poster_path || '';

    if (manageMode === 'tv') {
      document.getElementById('field-releaseDate').value = r.first_air_date || '';
      const genres = (r.genre_ids || []).slice(0, 3).map(id => tvGenreMap[id] || genreMap[id]).filter(Boolean);
      document.getElementById('field-genres').value = genres.join(', ');
      await fetchTvDetails(r.id);
    } else {
      document.getElementById('field-releaseDate').value = r.release_date || '';
      const genres = (r.genre_ids || []).slice(0, 3).map(id => genreMap[id]).filter(Boolean);
      document.getElementById('field-genres').value = genres.join(', ');
      await fetchCredits(r.id);
    }
  }

  async function fetchTvDetails(tmdbId) {
    document.getElementById('field-creator').value = '';
    document.getElementById('field-cast').value = '';
    document.getElementById('field-director').value = '';
    if (!config.tmdbApiKey || config.tmdbApiKey === 'YOUR_TMDB_API_KEY_HERE' || !tmdbId) return;
    try {
      const url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${encodeURIComponent(config.tmdbApiKey)}&append_to_response=credits`;
      const res = await fetch(url);
      const data = await res.json();
      const creators = (data.created_by || []).map(c => c.name);
      document.getElementById('field-creator').value = creators.join(', ');
      const topCast = (data.credits?.cast || []).slice(0, 3).map(c => c.name);
      document.getElementById('field-cast').value = topCast.join(', ');
      if (data.number_of_seasons) {
        document.getElementById('field-totalSeasons').value = data.number_of_seasons;
        buildSeasonsUI(data.number_of_seasons);
      }
    } catch (e) { console.warn('Could not fetch TV details:', e); }
  }

  async function fetchCredits(tmdbId) {
    document.getElementById('field-director').value = '';
    document.getElementById('field-cast').value = '';
    if (!config.tmdbApiKey || config.tmdbApiKey === 'YOUR_TMDB_API_KEY_HERE' || !tmdbId) return;
    try {
      const url = `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${encodeURIComponent(config.tmdbApiKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      const director = (data.crew || []).find(c => c.job === 'Director');
      document.getElementById('field-director').value = director ? director.name : '';
      const topCast = (data.cast || []).slice(0, 3).map(c => c.name);
      document.getElementById('field-cast').value = topCast.join(', ');
    } catch (e) { console.warn('Could not fetch credits:', e); }
  }

  // -- Game API Toggle (IGDB / RAWG) --
  function bindGameApiToggle() {
    const toggle = document.getElementById('gameApiToggle');
    if (!toggle) return;
    toggle.querySelectorAll('[data-game-api]').forEach(btn => {
      btn.addEventListener('click', () => {
        const api = btn.dataset.gameApi;
        if (api === activeGameApi) return;
        activeGameApi = api;
        toggle.querySelectorAll('[data-game-api]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Clear search results
        const list = document.getElementById('api-results');
        if (list) { list.innerHTML = ''; list.style.display = 'none'; }
        toggleModeFields();
      });
    });
    // Set initial active state
    toggle.querySelectorAll('[data-game-api]').forEach(b => b.classList.remove('active'));
    toggle.querySelector(`[data-game-api="${activeGameApi}"]`)?.classList.add('active');
  }

  // -- IGDB Token Management --
  async function getIgdbToken() {
    if (igdbAccessToken && Date.now() < igdbTokenExpiry) return igdbAccessToken;
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${encodeURIComponent(config.igdbClientId)}&client_secret=${encodeURIComponent(config.igdbClientSecret)}&grant_type=client_credentials`
    });
    const data = await res.json();
    igdbAccessToken = data.access_token;
    igdbTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    return igdbAccessToken;
  }

  // -- IGDB Search (Games) --
  async function searchIgdb(query) {
    const list = document.getElementById('api-results');
    if (!config.igdbClientId || config.igdbClientId === 'YOUR_IGDB_CLIENT_ID_HERE' ||
        !config.igdbClientSecret || config.igdbClientSecret === 'YOUR_IGDB_CLIENT_SECRET_HERE') {
      list.innerHTML = '<li class="text-warning px-3 py-2">Set igdbClientId &amp; igdbClientSecret in data/config.json — get credentials at <a href="https://dev.twitch.tv/console" target="_blank">dev.twitch.tv</a></li>';
      list.style.display = 'block';
      return;
    }
    try {
      const token = await getIgdbToken();
      const baseUrl = config.igdbProxyUrl || 'https://api.igdb.com/v4';
      const body = `search "${query.replace(/"/g, '\\"')}"; fields name,cover.image_id,first_release_date,genres.name,platforms.id,platforms.name,summary; limit 10;`;
      const res = await fetch(`${baseUrl}/games`, {
        method: 'POST',
        headers: {
          'Client-ID': config.igdbClientId,
          'Authorization': `Bearer ${token}`,
        },
        body
      });
      const data = await res.json();
      renderIgdbResults(data || []);
    } catch (err) {
      console.error('IGDB search error:', err);
      list.innerHTML = '<li class="text-danger px-3 py-2">IGDB API error — check console. If CORS issue, set igdbProxyUrl in config.json or switch to RAWG.</li>';
      list.style.display = 'block';
    }
  }

  function renderIgdbResults(results) {
    const list = document.getElementById('api-results');
    list.innerHTML = '';
    if (!results.length) {
      list.innerHTML = '<li class="text-secondary px-3 py-2">No results found</li>';
      list.style.display = 'block';
      return;
    }
    results.forEach(r => {
      const title = r.name || '';
      const year = r.first_release_date
        ? new Date(r.first_release_date * 1000).getFullYear()
        : '—';
      const thumb = r.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${r.cover.image_id}.jpg`
        : '';
      const platforms = (r.platforms || []).map(p => p.name).join(', ');
      const li = document.createElement('li');
      li.innerHTML = `
        ${thumb ? `<img src="${thumb}" alt="">` : '<span style="width:32px;height:48px;display:inline-block;background:#333;border-radius:3px;flex-shrink:0;"></span>'}
        <span>
          <span class="result-title">${escHtml(title)}</span>
          <span class="result-year">(${year})</span>
          <br><span class="result-platforms" style="font-size:.75rem;color:#888">${escHtml(platforms)}</span>
        </span>`;
      li.addEventListener('click', () => selectIgdbResult(r));
      list.appendChild(li);
    });
    list.style.display = 'block';
  }

  async function selectIgdbResult(r) {
    const title = r.name || '';
    document.getElementById('search-input').value = title;
    document.getElementById('api-results').style.display = 'none';

    document.getElementById('field-apiId').value = r.id || '';
    document.getElementById('field-title').value = title;

    // Convert Unix timestamp to YYYY-MM-DD
    if (r.first_release_date) {
      const d = new Date(r.first_release_date * 1000);
      document.getElementById('field-releaseDate').value = d.toISOString().split('T')[0];
    } else {
      document.getElementById('field-releaseDate').value = '';
    }

    document.getElementById('field-overview').value = r.summary || '';

    // Cover image
    if (r.cover?.image_id) {
      document.getElementById('field-posterPath').value = `https://images.igdb.com/igdb/image/upload/t_cover_big/${r.cover.image_id}.jpg`;
    } else {
      document.getElementById('field-posterPath').value = '';
    }

    // Genres
    const genres = (r.genres || []).map(g => g.name);
    document.getElementById('field-genres').value = genres.join(', ');

    // Platforms
    const igdbPlatforms = (r.platforms || []);
    availablePlatforms = igdbPlatforms
      .map(p => IGDB_PLATFORM_MAP[p.id] || null)
      .filter(p => p && PLATFORM_META[p]);
    document.getElementById('field-availablePlatforms').value = availablePlatforms.join(', ');

    // Fetch full details for developer/publisher
    await fetchIgdbDetails(r.id);
  }

  async function fetchIgdbDetails(igdbId) {
    document.getElementById('field-developer').value = '';
    document.getElementById('field-publisher').value = '';
    if (!config.igdbClientId || config.igdbClientId === 'YOUR_IGDB_CLIENT_ID_HERE' || !igdbId) return;
    try {
      const token = await getIgdbToken();
      const baseUrl = config.igdbProxyUrl || 'https://api.igdb.com/v4';
      const body = `fields involved_companies.company.name,involved_companies.developer,involved_companies.publisher; where id = ${igdbId};`;
      const res = await fetch(`${baseUrl}/games`, {
        method: 'POST',
        headers: {
          'Client-ID': config.igdbClientId,
          'Authorization': `Bearer ${token}`,
        },
        body
      });
      const data = await res.json();
      if (data && data[0]) {
        const companies = data[0].involved_companies || [];
        const developers = companies.filter(c => c.developer).map(c => c.company?.name).filter(Boolean);
        const publishers = companies.filter(c => c.publisher).map(c => c.company?.name).filter(Boolean);
        document.getElementById('field-developer').value = developers.join(', ');
        document.getElementById('field-publisher').value = publishers.join(', ');
      }
    } catch (e) { console.warn('Could not fetch IGDB details:', e); }
  }

  // -- RAWG Search (Games) --
  async function searchRawg(query) {
    const list = document.getElementById('api-results');
    if (!config.rawgApiKey || config.rawgApiKey === 'YOUR_RAWG_API_KEY_HERE') {
      list.innerHTML = '<li class="text-warning px-3 py-2">Set your RAWG API key in data/config.json — get one free at rawg.io/apidocs</li>';
      list.style.display = 'block';
      return;
    }
    try {
      const url = `https://api.rawg.io/api/games?key=${encodeURIComponent(config.rawgApiKey)}&search=${encodeURIComponent(query)}&page_size=10`;
      const res = await fetch(url);
      const data = await res.json();
      renderRawgResults(data.results || []);
    } catch (err) {
      console.error('RAWG search error:', err);
      list.innerHTML = '<li class="text-danger px-3 py-2">API error — check console</li>';
      list.style.display = 'block';
    }
  }

  function renderRawgResults(results) {
    const list = document.getElementById('api-results');
    list.innerHTML = '';
    if (results.length === 0) {
      list.innerHTML = '<li class="text-secondary px-3 py-2">No results found</li>';
      list.style.display = 'block';
      return;
    }
    results.forEach(r => {
      const title = r.name || '';
      const year = r.released ? r.released.substring(0, 4) : '—';
      const thumb = r.background_image || '';
      const platforms = (r.platforms || []).map(p => p.platform.name).join(', ');
      const li = document.createElement('li');
      li.innerHTML = `
        ${thumb ? `<img src="${thumb}" alt="">` : '<span style="width:48px;height:32px;display:inline-block;background:#333;border-radius:3px;flex-shrink:0;"></span>'}
        <span>
          <span class="result-title">${escHtml(title)}</span>
          <span class="result-year">(${year})</span>
          <br><span class="result-platforms" style="font-size:.75rem;color:#888">${escHtml(platforms)}</span>
        </span>`;
      li.addEventListener('click', () => selectRawgResult(r));
      list.appendChild(li);
    });
    list.style.display = 'block';
  }

  async function selectRawgResult(r) {
    const title = r.name || '';
    document.getElementById('search-input').value = title;
    document.getElementById('api-results').style.display = 'none';

    document.getElementById('field-apiId').value = r.id || '';
    document.getElementById('field-title').value = title;
    document.getElementById('field-releaseDate').value = r.released || '';
    document.getElementById('field-posterPath').value = r.background_image || '';

    const genres = (r.genres || []).map(g => g.name);
    document.getElementById('field-genres').value = genres.join(', ');

    const rawgPlatforms = (r.platforms || []).map(p => p.platform.name);
    availablePlatforms = rawgPlatforms.map(name => RAWG_PLATFORM_MAP[name] || name).filter(p => PLATFORM_META[p]);
    document.getElementById('field-availablePlatforms').value = availablePlatforms.join(', ');

    await fetchGameDetails(r.id);
  }

  async function fetchGameDetails(rawgId) {
    document.getElementById('field-developer').value = '';
    document.getElementById('field-publisher').value = '';
    if (!config.rawgApiKey || config.rawgApiKey === 'YOUR_RAWG_API_KEY_HERE' || !rawgId) return;
    try {
      const url = `https://api.rawg.io/api/games/${rawgId}?key=${encodeURIComponent(config.rawgApiKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.description_raw) {
        document.getElementById('field-overview').value = data.description_raw.substring(0, 500);
      }
      const developers = (data.developers || []).map(d => d.name);
      document.getElementById('field-developer').value = developers.join(', ');
      const publishers = (data.publishers || []).map(p => p.name);
      document.getElementById('field-publisher').value = publishers.join(', ');
    } catch (e) { console.warn('Could not fetch game details:', e); }
  }

  // ---------- Star rating picker ----------
  function bindStarPicker() {
    const container = document.getElementById('star-picker');
    if (!container) return;
    renderStarPicker();

    container.addEventListener('click', (e) => {
      const star = e.target.closest('[data-value]');
      if (!star) return;
      const rect = star.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = x < rect.width / 2;
      const val = parseFloat(star.dataset.value);
      currentRating = isHalf ? val - 0.5 : val;
      if (currentRating <= 0) currentRating = 0.5;
      renderStarPicker();
    });

    container.addEventListener('dblclick', () => {
      currentRating = 0;
      renderStarPicker();
    });
  }

  function renderStarPicker() {
    const container = document.getElementById('star-picker');
    if (!container) return;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      let cls = 'star-pick empty';
      if (currentRating >= i) cls = 'star-pick filled';
      else if (currentRating >= i - 0.5) cls = 'star-pick half';
      html += `<span class="${cls}" data-value="${i}">★</span>`;
    }
    html += `<span class="text-secondary ms-2" style="font-size:.8rem">${currentRating > 0 ? currentRating + '/5' : 'Click to rate, double-click to clear'}</span>`;
    container.innerHTML = html;
  }

  // ---------- Tag input ----------
  function bindTagInput() {
    const input = document.getElementById('tag-input');
    const btn = document.getElementById('tag-add-btn');
    if (!input) return;

    const addTag = () => {
      const val = input.value.trim();
      if (val && !currentTags.includes(val)) { currentTags.push(val); renderTags(); }
      input.value = '';
    };

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });
    btn?.addEventListener('click', addTag);
  }

  function renderTags() {
    const container = document.getElementById('tag-list');
    if (!container) return;
    container.innerHTML = currentTags.map((t, i) =>
      `<span class="movie-tag">${escHtml(t)} <button type="button" class="btn-close btn-close-white" style="font-size:.5rem;vertical-align:middle" data-remove-tag="${i}"></button></span>`
    ).join('');
    container.querySelectorAll('[data-remove-tag]').forEach(btn => {
      btn.addEventListener('click', () => { currentTags.splice(parseInt(btn.dataset.removeTag), 1); renderTags(); });
    });
  }

  // ---------- Form ----------
  function bindForm() {
    const form = document.getElementById('item-form');
    if (!form) return;
    form.addEventListener('submit', (e) => { e.preventDefault(); saveFromForm(); });
    document.getElementById('btn-cancel')?.addEventListener('click', resetForm);

    // Toggle backed-up checkbox visibility when physical formats change (movies)
    document.querySelectorAll('#item-form .format-cb').forEach(cb => {
      if (FORMAT_META[cb.value]?.category === 'physical') {
        cb.addEventListener('change', () => {
          const anyPhys = document.querySelectorAll('#item-form .format-cb:checked');
          const hasPhys = Array.from(anyPhys).some(c => FORMAT_META[c.value]?.category === 'physical');
          const section = document.getElementById('movie-backed-up-section');
          if (section) section.style.display = hasPhys ? '' : 'none';
          if (!hasPhys) document.getElementById('field-backedUp').checked = false;
        });
      }
    });
  }

  function saveFromForm() {
    const title = document.getElementById('field-title').value.trim();
    if (!title) { alert('Title is required'); return; }

    if (manageMode === 'games') saveGame();
    else if (manageMode === 'tv') saveTvShow();
    else saveMovie();
  }

  function saveMovie() {
    const movie = {
      tmdbId: parseInt(document.getElementById('field-apiId').value) || 0,
      title: document.getElementById('field-title').value.trim(),
      releaseDate: document.getElementById('field-releaseDate').value.trim(),
      overview: document.getElementById('field-overview').value.trim(),
      posterPath: document.getElementById('field-posterPath').value.trim(),
      genres: document.getElementById('field-genres').value.trim()
        ? document.getElementById('field-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      director: document.getElementById('field-director').value.trim(),
      cast: document.getElementById('field-cast').value.trim()
        ? document.getElementById('field-cast').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: currentRating,
      watched: document.getElementById('field-watched').checked,
      tags: [...currentTags],
      customTags: {},
      formats: { physical: [], digital: [] },
      digitalQuality: [],
    };

    document.querySelectorAll('#item-form .format-cb:checked').forEach(cb => {
      const key = cb.value;
      const meta = FORMAT_META[key];
      if (meta) movie.formats[meta.category].push(key);
    });
    document.querySelectorAll('#item-form .dq-cb:checked').forEach(cb => {
      movie.digitalQuality.push(cb.value);
    });
    if (movie.formats.physical.length > 0) {
      movie.backedUp = document.getElementById('field-backedUp').checked;
    }
    document.querySelectorAll('#custom-field-checks .custom-field-cb:checked').forEach(cb => {
      movie.customTags[cb.value] = true;
    });

    if (editIndex >= 0) {
      movies[editIndex] = movie;
    } else {
      if (movie.tmdbId && movies.some(m => m.tmdbId === movie.tmdbId)) {
        if (!confirm(`A movie with TMDB ID ${movie.tmdbId} already exists. Add anyway?`)) return;
      }
      movies.push(movie);
    }
    renderTable(); updateCount(); resetForm();
  }

  function saveTvShow() {
    const show = {
      tmdbId: parseInt(document.getElementById('field-apiId').value) || 0,
      title: document.getElementById('field-title').value.trim(),
      firstAirDate: document.getElementById('field-releaseDate').value.trim(),
      overview: document.getElementById('field-overview').value.trim(),
      posterPath: document.getElementById('field-posterPath').value.trim(),
      genres: document.getElementById('field-genres').value.trim()
        ? document.getElementById('field-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      creator: document.getElementById('field-creator').value.trim(),
      cast: document.getElementById('field-cast').value.trim()
        ? document.getElementById('field-cast').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: currentRating,
      watched: document.getElementById('field-watched').checked,
      tags: [...currentTags],
      customTags: {},
      totalSeasons: parseInt(document.getElementById('field-totalSeasons').value) || 1,
      seasons: collectSeasonsFromUI(),
      boxSet: collectBoxSetFromUI(),
    };

    document.querySelectorAll('#custom-field-checks .custom-field-cb:checked').forEach(cb => {
      show.customTags[cb.value] = true;
    });

    if (editIndex >= 0) {
      tvShows[editIndex] = show;
    } else {
      if (show.tmdbId && tvShows.some(s => s.tmdbId === show.tmdbId)) {
        if (!confirm(`A show with TMDB ID ${show.tmdbId} already exists. Add anyway?`)) return;
      }
      tvShows.push(show);
    }
    renderTable(); updateCount(); resetForm();
  }

  function saveGame() {
    const apiIdVal = parseInt(document.getElementById('field-apiId').value) || 0;
    const game = {
      title: document.getElementById('field-title').value.trim(),
      releaseDate: document.getElementById('field-releaseDate').value.trim(),
      overview: document.getElementById('field-overview').value.trim(),
      coverPath: document.getElementById('field-posterPath').value.trim(),
      genres: document.getElementById('field-genres').value.trim()
        ? document.getElementById('field-genres').value.split(',').map(s => s.trim()).filter(Boolean) : [],
      developer: document.getElementById('field-developer').value.trim(),
      publisher: document.getElementById('field-publisher').value.trim(),
      rating: currentRating,
      played: document.getElementById('field-played').checked,
      completed: document.getElementById('field-completed').checked,
      tags: [...currentTags],
      customTags: {},
      copies: collectCopiesFromUI(),
    };

    // Set the correct ID field based on active API (preserve both if editing)
    if (editIndex >= 0) {
      const existing = games[editIndex];
      if (existing.igdbId) game.igdbId = existing.igdbId;
      if (existing.rawgId) game.rawgId = existing.rawgId;
    }
    if (activeGameApi === 'igdb') {
      game.igdbId = apiIdVal;
    } else {
      game.rawgId = apiIdVal;
    }

    document.querySelectorAll('#custom-field-checks .custom-field-cb:checked').forEach(cb => {
      game.customTags[cb.value] = true;
    });

    if (editIndex >= 0) {
      games[editIndex] = game;
    } else {
      const dupeId = activeGameApi === 'igdb' ? game.igdbId : game.rawgId;
      const dupeKey = activeGameApi === 'igdb' ? 'igdbId' : 'rawgId';
      const apiLabel = activeGameApi === 'igdb' ? 'IGDB' : 'RAWG';
      if (dupeId && games.some(g => g[dupeKey] === dupeId)) {
        if (!confirm(`A game with ${apiLabel} ID ${dupeId} already exists. Add anyway?`)) return;
      }
      games.push(game);
    }
    renderTable(); updateCount(); resetForm();
  }

  // ---------- Seasons Builder (TV) ----------
  function bindSeasonsBuilder() {
    const btn = document.getElementById('btn-build-seasons');
    if (btn) {
      btn.addEventListener('click', () => {
        const total = parseInt(document.getElementById('field-totalSeasons').value) || 1;
        buildSeasonsUI(total);
      });
    }

    const physCb = document.getElementById('boxset-physical-cb');
    const physFmt = document.getElementById('boxset-physical-format');
    const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
    if (physCb && physFmt) {
      physCb.addEventListener('change', () => {
        physFmt.style.display = physCb.checked ? 'inline-block' : 'none';
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
    DIGITAL_FORMATS.forEach(key => {
      const meta = FORMAT_META[key];
      const id = `boxset-dig-${key.replace(/\s+/g, '-').toLowerCase()}`;
      const div = document.createElement('div');
      div.className = 'form-check form-check-inline';
      div.innerHTML = `<input class="form-check-input boxset-dig-cb" type="checkbox" value="${key}" id="${id}"><label class="form-check-label" for="${id}" style="font-size:.82rem">${meta.label}</label>`;
      container.appendChild(div);
    });
  }

  function buildSeasonsUI(total) {
    const container = document.getElementById('seasons-builder');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= total; i++) {
      const row = document.createElement('div');
      row.className = 'season-row-builder border rounded p-2 mb-2';
      row.dataset.season = i;

      let html = `<strong style="font-size:.85rem">Season ${i}</strong><div class="d-flex flex-wrap gap-3 mt-1">`;
      html += `<div><span class="text-secondary" style="font-size:.75rem">Physical</span><br><select class="form-select form-select-sm season-physical" style="width:130px"><option value="">None</option>`;
      PHYSICAL_FORMATS.forEach(f => { html += `<option value="${f}">${f}</option>`; });
      html += `</select>`;
      html += `<div class="form-check form-switch mt-1 season-backedup-wrap" style="display:none"><input class="form-check-input season-backedup" type="checkbox" id="s${i}-backedup"><label class="form-check-label" for="s${i}-backedup" style="font-size:.78rem">Backed up?</label></div>`;
      html += `</div>`;

      html += `<div><span class="text-secondary" style="font-size:.75rem">Digital</span><div class="d-flex flex-wrap gap-2 mt-1">`;
      DIGITAL_FORMATS.forEach(f => {
        const id = `s${i}-dig-${f.replace(/\s+/g, '-').toLowerCase()}`;
        html += `<div class="form-check form-check-inline"><input class="form-check-input season-digital" type="checkbox" value="${f}" id="${id}"><label class="form-check-label" for="${id}" style="font-size:.8rem">${FORMAT_META[f].label}</label></div>`;
      });
      html += `</div></div></div>`;
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
      const digitalCbs = row.querySelectorAll('.season-digital:checked');
      const digital = Array.from(digitalCbs).map(cb => cb.value);
      const backedUp = physical ? (row.querySelector('.season-backedup')?.checked || false) : undefined;
      const season = { seasonNumber: num, physical: physical || null, digital };
      if (backedUp !== undefined) season.backedUp = backedUp;
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
      document.getElementById('field-totalSeasons').value = total;
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
      document.getElementById('boxset-physical-cb').checked = true;
      const fmt = document.getElementById('boxset-physical-format');
      fmt.style.display = 'inline-block';
      fmt.value = bs.physical;
      const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
      if (boxsetBackedupSection) boxsetBackedupSection.style.display = 'inline-flex';
      if (bs.backedUp) { const cb = document.getElementById('boxset-backedup-cb'); if (cb) cb.checked = true; }
    }
    if (bs.digital && bs.digital.length > 0) {
      document.getElementById('boxset-digital-cb').checked = true;
      const container = document.getElementById('boxset-digital-formats');
      container.style.display = '';
      renderBoxSetDigitalOptions();
      bs.digital.forEach(f => { const cb = container.querySelector(`.boxset-dig-cb[value="${f}"]`); if (cb) cb.checked = true; });
    }
  }

  // ---------- Copy Builder (Games) ----------
  function bindCopyBuilder() {
    const btn = document.getElementById('btn-add-copy');
    if (btn) btn.addEventListener('click', () => addCopyRow());
  }

  function addCopyRow(copyData = null) {
    const container = document.getElementById('copies-builder');
    if (!container) return;

    const index = container.querySelectorAll('.copy-row-builder').length;
    const row = document.createElement('div');
    row.className = 'copy-row-builder border rounded p-2 mb-2';
    row.dataset.copyIndex = index;

    const platforms = availablePlatforms.length > 0 ? availablePlatforms : Object.keys(PLATFORM_META);

    let html = `<div class="d-flex justify-content-between align-items-center mb-2">
      <strong style="font-size:.85rem">Copy ${index + 1}</strong>
      <button type="button" class="btn btn-sm btn-outline-danger btn-remove-copy" title="Remove">&times;</button>
    </div><div class="row g-2">`;

    // Platform select (grouped by family)
    html += '<div class="col-md-3"><label class="form-label" style="font-size:.78rem">Platform</label><select class="form-select form-select-sm copy-platform"><option value="">Select…</option>';
    const families = {};
    platforms.forEach(p => {
      const meta = PLATFORM_META[p];
      if (!meta) return;
      if (!families[meta.family]) families[meta.family] = [];
      families[meta.family].push({ key: p, label: meta.label });
    });
    Object.entries(families).forEach(([family, plats]) => {
      html += `<optgroup label="${family}">`;
      plats.forEach(p => {
        const selected = copyData && copyData.platform === p.key ? ' selected' : '';
        html += `<option value="${p.key}"${selected}>${p.label}</option>`;
      });
      html += '</optgroup>';
    });
    html += '</select></div>';

    // Type
    const isPhysical = copyData ? copyData.type === 'physical' : true;
    html += `<div class="col-md-2"><label class="form-label" style="font-size:.78rem">Type</label>
      <select class="form-select form-select-sm copy-type">
        <option value="physical"${isPhysical ? ' selected' : ''}>Physical</option>
        <option value="digital"${!isPhysical ? ' selected' : ''}>Digital</option>
      </select></div>`;

    // Condition
    html += `<div class="col-md-3 copy-condition-col" style="${isPhysical ? '' : 'display:none'}">
      <label class="form-label" style="font-size:.78rem">Condition</label>
      <select class="form-select form-select-sm copy-condition"><option value="">Select…</option>`;
    CONDITIONS.forEach(c => {
      const selected = copyData && copyData.condition === c ? ' selected' : '';
      html += `<option value="${c}"${selected}>${c}</option>`;
    });
    html += '</select></div>';

    // Backed up (physical only)
    const backedUpChecked = copyData && copyData.backedUp ? ' checked' : '';
    html += `<div class="col-md-2 copy-backedup-col" style="${isPhysical ? '' : 'display:none'}">
      <label class="form-label" style="font-size:.78rem">&nbsp;</label>
      <div class="form-check form-switch"><input class="form-check-input copy-backedup" type="checkbox"${backedUpChecked}><label class="form-check-label" style="font-size:.78rem">Backed up?</label></div>
    </div>`;

    // Store
    html += `<div class="col-md-3 copy-store-col" style="${!isPhysical ? '' : 'display:none'}">
      <label class="form-label" style="font-size:.78rem">Store</label>
      <select class="form-select form-select-sm copy-store"><option value="">Select…</option>`;
    Object.entries(STORE_META).forEach(([key, meta]) => {
      const selected = copyData && copyData.store === key ? ' selected' : '';
      html += `<option value="${key}"${selected}>${meta.label}</option>`;
    });
    html += '</select></div></div>';

    row.innerHTML = html;
    container.appendChild(row);

    const typeSelect = row.querySelector('.copy-type');
    const conditionCol = row.querySelector('.copy-condition-col');
    const storeCol = row.querySelector('.copy-store-col');
    const backedupCol = row.querySelector('.copy-backedup-col');
    typeSelect.addEventListener('change', () => {
      const isPhys = typeSelect.value === 'physical';
      conditionCol.style.display = isPhys ? '' : 'none';
      storeCol.style.display = isPhys ? 'none' : '';
      if (backedupCol) backedupCol.style.display = isPhys ? '' : 'none';
      if (!isPhys) { const cb = row.querySelector('.copy-backedup'); if (cb) cb.checked = false; }
    });

    row.querySelector('.btn-remove-copy').addEventListener('click', () => {
      row.remove();
      renumberCopyRows();
    });
  }

  function renumberCopyRows() {
    const rows = document.querySelectorAll('#copies-builder .copy-row-builder');
    rows.forEach((row, i) => {
      row.dataset.copyIndex = i;
      const label = row.querySelector('strong');
      if (label) label.textContent = `Copy ${i + 1}`;
    });
  }

  function collectCopiesFromUI() {
    const rows = document.querySelectorAll('#copies-builder .copy-row-builder');
    const copies = [];
    rows.forEach(row => {
      const platform = row.querySelector('.copy-platform')?.value;
      const type = row.querySelector('.copy-type')?.value || 'physical';
      const condition = row.querySelector('.copy-condition')?.value || '';
      const store = row.querySelector('.copy-store')?.value || '';
      if (!platform) return;
      const copy = { platform, type };
      if (type === 'physical' && condition) copy.condition = condition;
      if (type === 'physical') copy.backedUp = row.querySelector('.copy-backedup')?.checked || false;
      if (type === 'digital' && store) copy.store = store;
      copies.push(copy);
    });
    return copies;
  }

  // ---------- Edit / Delete ----------
  function startEdit(index) {
    editIndex = index;
    const data = activeData();
    const m = data[index];

    document.getElementById('search-input').value = m.title;
    document.getElementById('field-title').value = m.title || '';
    document.getElementById('field-releaseDate').value = m.firstAirDate || m.releaseDate || '';
    document.getElementById('field-overview').value = m.overview || '';
    document.getElementById('field-genres').value = (m.genres || []).join(', ');

    if (manageMode === 'games') {
      document.getElementById('field-apiId').value = m.igdbId || m.rawgId || '';
      document.getElementById('field-posterPath').value = m.coverPath || '';
      document.getElementById('field-developer').value = m.developer || '';
      document.getElementById('field-publisher').value = m.publisher || '';
      document.getElementById('field-played').checked = !!m.played;
      document.getElementById('field-completed').checked = !!m.completed;

      // Copies
      const container = document.getElementById('copies-builder');
      if (container) container.innerHTML = '';
      availablePlatforms = Object.keys(PLATFORM_META);
      (m.copies || []).forEach(copy => addCopyRow(copy));
    } else {
      document.getElementById('field-apiId').value = m.tmdbId || '';
      document.getElementById('field-posterPath').value = m.posterPath || '';
      document.getElementById('field-director').value = m.director || '';
      document.getElementById('field-creator').value = m.creator || '';
      document.getElementById('field-cast').value = (m.cast || []).join(', ');
      document.getElementById('field-watched').checked = !!m.watched;

      if (manageMode === 'tv') {
        populateSeasonsUI(m);
      } else {
        // Format checkboxes
        const allFormats = [...(m.formats?.physical || []), ...(m.formats?.digital || [])];
        document.querySelectorAll('#item-form .format-cb').forEach(cb => { cb.checked = allFormats.includes(cb.value); });
        const dq = m.digitalQuality || [];
        document.querySelectorAll('#item-form .dq-cb').forEach(cb => { cb.checked = dq.includes(cb.value); });
        // Backed up
        const hasPhys = (m.formats?.physical || []).length > 0;
        const backedUpSection = document.getElementById('movie-backed-up-section');
        if (backedUpSection) backedUpSection.style.display = hasPhys ? '' : 'none';
        document.getElementById('field-backedUp').checked = !!m.backedUp;
      }
    }

    // Rating
    currentRating = m.rating || 0;
    renderStarPicker();

    // Tags
    currentTags = [...(m.tags || [])];
    renderTags();

    // Custom fields
    const ct = m.customTags || {};
    document.querySelectorAll('#custom-field-checks .custom-field-cb').forEach(cb => { cb.checked = !!ct[cb.value]; });

    toggleModeFields();
    document.getElementById('btn-cancel').style.display = 'inline-block';
    document.getElementById('search-input').scrollIntoView({ behavior: 'smooth' });
  }

  function deleteItem(index) {
    const data = activeData();
    const title = data[index]?.title || 'this title';
    if (!confirm(`Remove "${title}" from your library?`)) return;
    data.splice(index, 1);
    if (editIndex === index) resetForm();
    if (editIndex > index) editIndex--;
    renderTable();
    updateCount();
  }

  function resetForm() {
    editIndex = -1;
    document.getElementById('item-form').reset();
    document.getElementById('field-apiId').value = '';
    document.getElementById('field-posterPath').value = '';
    document.getElementById('field-genres').value = '';
    document.getElementById('field-director').value = '';
    document.getElementById('field-cast').value = '';
    document.getElementById('field-creator').value = '';
    document.getElementById('field-developer').value = '';
    document.getElementById('field-publisher').value = '';
    document.getElementById('field-availablePlatforms').value = '';
    availablePlatforms = [];
    currentRating = 0;
    renderStarPicker();
    document.getElementById('field-watched').checked = false;
    document.getElementById('field-played').checked = false;
    document.getElementById('field-completed').checked = false;
    currentTags = [];
    renderTags();

    // Reset format / quality
    document.querySelectorAll('#item-form .format-cb').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('#item-form .dq-cb').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('#custom-field-checks .custom-field-cb').forEach(cb => { cb.checked = false; });

    // Reset movie backed-up
    const movieBackedUpSection = document.getElementById('movie-backed-up-section');
    if (movieBackedUpSection) movieBackedUpSection.style.display = 'none';
    const fieldBackedUp = document.getElementById('field-backedUp');
    if (fieldBackedUp) fieldBackedUp.checked = false;

    // Reset seasons builder
    const seasonsBuilder = document.getElementById('seasons-builder');
    if (seasonsBuilder) seasonsBuilder.innerHTML = '';
    const physCb = document.getElementById('boxset-physical-cb');
    const physFmt = document.getElementById('boxset-physical-format');
    if (physCb) physCb.checked = false;
    if (physFmt) { physFmt.value = ''; physFmt.style.display = 'none'; }
    const boxsetBackedupSection = document.getElementById('boxset-backedup-section');
    if (boxsetBackedupSection) boxsetBackedupSection.style.display = 'none';
    const boxsetBackedupCb = document.getElementById('boxset-backedup-cb');
    if (boxsetBackedupCb) boxsetBackedupCb.checked = false;
    const digCb = document.getElementById('boxset-digital-cb');
    const digFmts = document.getElementById('boxset-digital-formats');
    if (digCb) digCb.checked = false;
    if (digFmts) { digFmts.innerHTML = ''; digFmts.style.display = 'none'; }

    // Reset copies builder
    const copiesBuilder = document.getElementById('copies-builder');
    if (copiesBuilder) copiesBuilder.innerHTML = '';

    toggleModeFields();
    document.getElementById('btn-cancel').style.display = 'none';
    document.getElementById('api-results').style.display = 'none';
  }

  // ---------- Save / Export JSON ----------
  function exportJson() {
    let data, filename;
    if (manageMode === 'games') {
      data = games; filename = 'games.json';
    } else if (manageMode === 'tv') {
      data = tvShows; filename = 'tvshows.json';
    } else {
      data = movies; filename = 'movies.json';
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- Import JSON ----------
  function importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) { alert('Invalid format: expected a JSON array.'); return; }
        if (manageMode === 'games') games = data;
        else if (manageMode === 'tv') tvShows = data;
        else movies = data;
        renderTable();
        updateCount();
      } catch (e) { alert('Failed to parse JSON file.'); }
    });
    input.click();
  }

  // ---------- Helpers ----------
  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  return { init, exportJson, importJson };
})();

document.addEventListener('DOMContentLoaded', Manage.init);
