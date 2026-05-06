/* ============================================================
   My Media DB — app.js
   Merged: Movies + TV Shows + Games
   Core logic: load data, render grid, sort, filter, detail view
   ============================================================ */

const App = (() => {
  'use strict';

  // ---------- Format definitions (Movies / TV) ----------
  const FORMAT_META = {
    // Physical
    'VCD':             { category: 'physical', logo: 'assets/logos/movie-tv/vcd.svg',             label: 'VCD' },
    'DVD':             { category: 'physical', logo: 'assets/logos/movie-tv/dvd.svg',             label: 'DVD' },
    'Blu-Ray':         { category: 'physical', logo: 'assets/logos/movie-tv/blu-ray.svg',         label: 'Blu-Ray' },
    'UHD Blu-Ray':     { category: 'physical', logo: 'assets/logos/movie-tv/uhd-blu-ray.svg',     label: 'UHD Blu-Ray' },
    '3D DVD':          { category: 'physical', logo: 'assets/logos/movie-tv/dvd-3d.svg',           label: '3D DVD' },
    '3D Blu-Ray':      { category: 'physical', logo: 'assets/logos/movie-tv/blu-ray-3d.svg',      label: '3D Blu-Ray' },
    // Digital
    'Apple TV':        { category: 'digital', logo: 'assets/logos/movie-tv/apple-tv.svg',         label: 'Apple TV',          url: 'https://tv.apple.com/search?term={q}' },
    'YouTube':         { category: 'digital', logo: 'assets/logos/movie-tv/youtube.svg',           label: 'YouTube',           url: 'https://www.youtube.com/results?search_query={q}' },
    'Google Play':     { category: 'digital', logo: 'assets/logos/movie-tv/google-play.svg',       label: 'Google Play',       url: 'https://play.google.com/store/search?q={q}&c=movies' },
    'Fandango At Home':{ category: 'digital', logo: 'assets/logos/movie-tv/fandango-at-home.svg',  label: 'Fandango At Home',  url: 'https://athome.fandango.com/content/browse/search?searchString={q}' },
    'Xfinity':         { category: 'digital', logo: 'assets/logos/movie-tv/xfinity.svg',           label: 'Xfinity' },
    'Verizon':         { category: 'digital', logo: 'assets/logos/movie-tv/verizon.svg',            label: 'Verizon' },
    'DirecTV':         { category: 'digital', logo: 'assets/logos/movie-tv/directv.svg',            label: 'DirecTV' },
    'Prime Video':     { category: 'digital', logo: 'assets/logos/movie-tv/prime-video.svg',        label: 'Prime Video',       url: 'https://www.primevideo.com/search/ref=atv_nb_sug?ie=UTF8&phrase={q}' },
    'Movies Anywhere': { category: 'digital', logo: 'assets/logos/movie-tv/moviesanywhere.png',    label: 'Movies Anywhere',  url: 'https://moviesanywhere.com/movie/{slug}' },
    'Plex':            { category: 'digital', logo: 'assets/logos/movie-tv/plex.svg',               label: 'Plex',              url: 'https://app.plex.tv/desktop/#!/search?pivot=top&query={q}' },
  };

  // ---------- Platform definitions (Games) ----------
  const PLATFORM_META = {
    // Nintendo
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
    // PlayStation
    'PlayStation':     { family: 'PlayStation',   label: 'PS1' },
    'PlayStation 2':   { family: 'PlayStation',   label: 'PS2' },
    'PlayStation 3':   { family: 'PlayStation',   label: 'PS3' },
    'PlayStation 4':   { family: 'PlayStation',   label: 'PS4' },
    'PlayStation 5':   { family: 'PlayStation',   label: 'PS5' },
    'PSP':             { family: 'PlayStation',   label: 'PSP' },
    'PS Vita':         { family: 'PlayStation',   label: 'PS Vita' },
    // Xbox
    'Xbox':            { family: 'Xbox',          label: 'Xbox' },
    'Xbox 360':        { family: 'Xbox',          label: 'Xbox 360' },
    'Xbox One':        { family: 'Xbox',          label: 'Xbox One' },
    'Xbox Series S/X': { family: 'Xbox',          label: 'Xbox Series' },
    // PC
    'PC':              { family: 'PC',            label: 'PC' },
    'macOS':           { family: 'PC',            label: 'macOS' },
    'Linux':           { family: 'PC',            label: 'Linux' },
    // Sega
    'Genesis':         { family: 'Sega',          label: 'Genesis' },
    'Sega Saturn':     { family: 'Sega',          label: 'Saturn' },
    'Dreamcast':       { family: 'Sega',          label: 'Dreamcast' },
    'Game Gear':       { family: 'Sega',          label: 'Game Gear' },
    'Sega Master System': { family: 'Sega',       label: 'Master System' },
    // Atari
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

  // ---------- Platform logo filenames (in assets/logos/gaming/) ----------
  // ---------- Digital store definitions (Games) ----------
  const STORE_META = {
    'Steam':              { label: 'Steam',              url: 'https://store.steampowered.com/search/?term={q}' },
    'PlayStation Store':  { label: 'PlayStation Store',   url: 'https://store.playstation.com/search/{q}' },
    'Xbox Store':         { label: 'Xbox / MS Store',    url: 'https://www.xbox.com/en-US/Search/Results?q={q}' },
    'Nintendo eShop':     { label: 'Nintendo eShop',     url: 'https://www.nintendo.com/us/search/#{q}' },
    'Epic Games Store':   { label: 'Epic Games',         url: 'https://store.epicgames.com/browse?q={q}' },
    'GOG':                { label: 'GOG',                url: 'https://www.gog.com/games?query={q}' },
    'Humble Bundle':      { label: 'Humble Bundle',      url: 'https://www.humblebundle.com/store/search?search={q}' },
    'EA App':             { label: 'EA App',             url: 'https://www.ea.com/games/library' },
    'Ubisoft Connect':    { label: 'Ubisoft Connect',    url: 'https://store.ubisoft.com/search?q={q}' },
    'Battle.net':         { label: 'Battle.net',         url: 'https://shop.battle.net/' },
    'itch.io':            { label: 'itch.io',            url: 'https://itch.io/search?q={q}' },
    'Amazon Luna':        { label: 'Amazon Luna' },
    'Google Play':        { label: 'Google Play',        url: 'https://play.google.com/store/search?q={q}&c=apps' },
    'Apple App Store':    { label: 'Apple App Store' },
  };

  // ---------- Game condition options ----------
  const CONDITIONS = [
    'Sealed / New',
    'Complete in Box with Manual',
    'Complete in Box',
    'Loose Disc',
    'Loose Cart',
    'Box Only',
    'Manual Only',
  ];

  let movies = [];
  let tvShows = [];
  let games = [];
  let config = {};
  let currentMode = 'movies'; // set from config.defaultMode in init
  let currentSort = 'date-desc';
  let activeFilter = 'all';
  let searchQuery = '';
  let detailOpen = false;
  let closingViaBack = false;

  // ---------- Rendering media-type override (for featured mixed-media) ----------
  let _renderingMediaType = null;
  /** Returns the effective media type for rendering — uses override when in featured mode */
  function getMediaType() {
    return _renderingMediaType || currentMode;
  }

  // ---------- URL hash ↔ mode mapping ----------
  const MODE_TO_SLUG = { featured: 'featured', movies: 'movies', tv: 'shows', games: 'games' };
  const SLUG_TO_MODE = { featured: 'featured', movies: 'movies', shows: 'tv', games: 'games', tv: 'tv' };

  function getModeFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    return SLUG_TO_MODE[raw] || null;
  }

  function setHashForMode(mode) {
    const slug = MODE_TO_SLUG[mode] || mode;
    const newHash = '#/' + slug;
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  /** Return the active dataset based on current mode */
  function activeData() {
    if (currentMode === 'tv') return tvShows;
    if (currentMode === 'games') return games;
    return movies;
  }

  // ---------- Bootstrap ----------
  async function init() {
    showLoading(true);
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
      movies = [];
      tvShows = [];
      games = [];
      config = { posterMode: 'remote', tmdbImageBase: 'https://image.tmdb.org/t/p/w500', customFields: [] };
    }

    // Tag items with media type for featured mixed-media rendering
    movies.forEach(m => { m._mediaType = 'movies'; });
    tvShows.forEach(s => { s._mediaType = 'tv'; });
    games.forEach(g => { g._mediaType = 'games'; });

    // Apply mode order & default from config
    const modes = Array.isArray(config.modes) ? [...config.modes] : ['movies', 'tv', 'games'];
    if (config.featured) modes.unshift('featured');
    currentMode = config.featured ? 'featured' : (modes.includes(config.defaultMode) ? config.defaultMode : modes[0]);

    // URL hash overrides default mode (e.g. #/featured, #/movies, #/shows, #/games)
    const hashMode = getModeFromHash();
    if (hashMode && modes.includes(hashMode)) {
      currentMode = hashMode;
    }
    setHashForMode(currentMode);

    renderSortButtons();
    // Hide filter bar if starting in featured mode
    if (currentMode === 'featured') {
      const filterBar = document.getElementById('meFilterBar');
      if (filterBar) filterBar.style.display = 'none';
      const labelEl = document.getElementById('activeFilterLabel');
      if (labelEl) labelEl.textContent = 'Featured';
      const mainContent = document.getElementById('mainContent');
      if (mainContent) mainContent.classList.add('featured-padding');
    } else {
      renderFilters();
    }
    bindSearch();
    initMobileUI();
    bindHistoryNav();
    bindPosterHero();
    bindLogoReset();
    bindModeToggle(modes);
    updateSortVisibility();
    renderGrid();

    if (config.posterMode === 'remote' && movies.length) {
      await waitForImages();
    }
    showLoading(false);
  }

  // ---------- Loading screen ----------
  function showLoading(show) {
    const el = document.getElementById('loading-screen');
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }

  function waitForImages() {
    const imgs = document.querySelectorAll('.poster-card img');
    const promises = Array.from(imgs).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    });
    return Promise.all(promises);
  }

  // ---------- Logo tap: reset everything ----------
  function bindLogoReset() {
    const logo = document.querySelector('.me-logo');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        const homeMode = config.featured ? 'featured' : (Array.isArray(config.modes) && config.modes.includes(config.defaultMode) ? config.defaultMode : (Array.isArray(config.modes) ? config.modes[0] : 'movies'));
        if (currentMode !== homeMode) {
          switchMode(homeMode);
        }
        resetAll();
      });
    }
  }

  // ---------- Mode Toggle (Movies / TV / Games) ----------
  function bindModeToggle(modes) {
    const toggle = document.getElementById('modeToggle');
    if (!toggle) return;

    // Only show toggle when >1 mode is configured
    if (modes.length <= 1) {
      toggle.style.display = 'none';
      return;
    }
    toggle.style.display = '';

    // Reorder buttons to match config.modes and hide unconfigured ones
    const allBtns = Array.from(toggle.querySelectorAll('.me-mode-btn'));
    allBtns.forEach(b => { b.style.display = 'none'; b.classList.remove('active'); });
    modes.forEach(m => {
      const btn = toggle.querySelector(`[data-mode="${m}"]`);
      if (btn) {
        btn.style.display = '';
        toggle.appendChild(btn); // re-append in order
      }
    });
    // Mark default mode active
    toggle.querySelector(`[data-mode="${currentMode}"]`)?.classList.add('active');

    // Create slider indicator for mode toggle
    const modeIndicator = document.createElement('span');
    modeIndicator.className = 'slider-indicator';
    toggle.appendChild(modeIndicator);

    toggle.querySelectorAll('.me-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;
        if (btn.style.display === 'none') return;

        // Expand if collapsed (both mobile and desktop)
        if (!toggle.classList.contains('mode-expanded')) {
          toggle.classList.add('mode-expanded');
          if (window.innerWidth < 768) {
            const sw = document.getElementById('meSearch');
            if (sw && !sw.classList.contains('collapsed')) {
              sw.classList.add('collapsed');
              const mb = document.getElementById('mobile-search-box');
              if (mb) mb.blur();
            }
          }
          e.stopPropagation();
          return;
        }

        // Already expanded — select mode
        if (mode !== currentMode) {
          switchMode(mode);
        }
        // Stay open on both mobile and desktop — collapses on scroll
      });
    });

    // ---- Touch-slide support: drag finger across buttons to select ----
    let touchSliding = false;
    toggle.addEventListener('touchstart', (e) => {
      if (window.innerWidth >= 768) return;
      if (!toggle.classList.contains('mode-expanded')) return;
      touchSliding = true;
    }, { passive: true });

    toggle.addEventListener('touchmove', (e) => {
      if (!touchSliding) return;
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const btn = el?.closest?.('.me-mode-btn');
      if (btn && btn.style.display !== 'none' && toggle.contains(btn)) {
        const mode = btn.dataset.mode;
        if (mode !== currentMode) {
          switchMode(mode);
        }
      }
    }, { passive: true });

    toggle.addEventListener('touchend', () => {
      touchSliding = false;
    }, { passive: true });

    // Auto-position slider indicator after expand/collapse transitions
    let modeSliderDebounce;
    toggle.addEventListener('transitionend', () => {
      clearTimeout(modeSliderDebounce);
      modeSliderDebounce = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile || toggle.classList.contains('mode-expanded')) {
          positionSliderIndicator(toggle, '.me-mode-btn', false);
        }
      }, 20);
    });

    // Initial slider position (desktop: immediate; mobile expanded: after init)
    requestAnimationFrame(() => positionSliderIndicator(toggle, '.me-mode-btn', false));

    document.addEventListener('click', (e) => {
      if (toggle.classList.contains('mode-expanded') && !toggle.contains(e.target)) {
        // Don't collapse mode toggle when clicking sort bubble
        const sortBubble = document.getElementById('sortBubble');
        if (sortBubble && sortBubble.contains(e.target)) return;
        toggle.classList.remove('mode-expanded');
      }
    });
  }

  function switchMode(mode) {
    currentMode = mode;
    setHashForMode(mode);

    document.querySelectorAll('.me-mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.me-mode-btn[data-mode="${mode}"]`)?.classList.add('active');

    // Update mode slider indicator
    requestAnimationFrame(() => {
      const toggle = document.getElementById('modeToggle');
      if (toggle) positionSliderIndicator(toggle, '.me-mode-btn', true);
    });

    searchQuery = '';
    const mobileInput = document.getElementById('mobile-search-box');
    if (mobileInput) mobileInput.value = '';
    const submitBtn = document.querySelector('.me-search-submit');
    const submitIcon = submitBtn?.querySelector('i');
    if (submitIcon) submitIcon.className = 'bi bi-search';
    if (submitBtn) submitBtn.classList.remove('clear-mode');

    activeFilter = 'all';
    // Preserve current sort across mode switches

    // Show/hide filter bar and sort for featured mode
    const filterBar = document.getElementById('meFilterBar');
    const labelEl = document.getElementById('activeFilterLabel');
    if (mode === 'featured') {
      if (filterBar) filterBar.style.display = 'none';
      if (labelEl) labelEl.textContent = 'Featured';
    } else {
      if (filterBar) { filterBar.style.display = ''; filterBar.classList.remove('hidden'); }
      if (labelEl) labelEl.textContent = allLabel();
      renderFilters();
    }
    updateSortVisibility();

    // Reposition sort slider indicator after sort reset
    requestAnimationFrame(() => {
      const sortBubble = document.getElementById('sortBubble');
      if (sortBubble && sortBubble.classList.contains('expanded')) {
        positionSliderIndicator(sortBubble, '.me-sort-btn', false);
      }
    });

    // Update featured padding class
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      if (mode === 'featured') mainContent.classList.add('featured-padding');
      else mainContent.classList.remove('featured-padding');
    }

    // Fade out, swap content, fade in
    const grid = document.getElementById('poster-grid');
    if (grid) {
      grid.classList.add('grid-fade-out');
      setTimeout(() => {
        renderGrid();
        window.scrollTo({ top: 0 });
        requestAnimationFrame(() => grid.classList.remove('grid-fade-out'));
      }, 180);
    } else {
      renderGrid();
      window.scrollTo({ top: 0 });
    }
  }

  /** Returns true when every season of a TV show is owned */
  function isCompleteSet(show) {
    if (!show.totalSeasons || show.totalSeasons < 1) return false;
    const hasBoxSet = show.boxSet && (show.boxSet.physical || (show.boxSet.digital && show.boxSet.digital.length > 0));
    if (hasBoxSet) return true;
    const seasonMap = {};
    (show.seasons || []).forEach(s => { seasonMap[s.seasonNumber] = s; });
    for (let i = 1; i <= show.totalSeasons; i++) {
      const s = seasonMap[i];
      const hasPhysical = s && s.physical;
      const hasDigital = s && s.digital && s.digital.length > 0;
      if (!hasPhysical && !hasDigital) return false;
    }
    return true;
  }

  /** Label helpers that adapt to current mode */
  function allLabel() {
    if (currentMode === 'tv') return 'All Shows';
    if (currentMode === 'games') return 'All Games';
    return 'All Movies';
  }
  function noItemsLabel() {
    if (currentMode === 'tv') return 'No shows found.';
    if (currentMode === 'games') return 'No games found.';
    return 'No movies found.';
  }
  function noFeaturedLabel() {
    if (currentMode === 'tv') return 'No shows to feature.';
    if (currentMode === 'games') return 'No games to feature.';
    return 'No movies to feature.';
  }

  // ---------- Reset all searches and filters ----------
  function resetAll() {
    searchQuery = '';
    const mobileInput = document.getElementById('mobile-search-box');
    if (mobileInput) mobileInput.value = '';

    const submitBtn = document.querySelector('.me-search-submit');
    const submitIcon = submitBtn?.querySelector('i');
    if (submitIcon) submitIcon.className = 'bi bi-search';
    if (submitBtn) submitBtn.classList.remove('clear-mode');

    // If featured mode, just re-render; otherwise reset filter to 'all'
    if (currentMode === 'featured') {
      const labelEl = document.getElementById('activeFilterLabel');
      if (labelEl) labelEl.textContent = 'Featured';
    } else {
      activeFilter = 'all';
      document.querySelectorAll('.filter-chip, .me-filter-chip').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`[data-filter="all"]`).forEach(b => b.classList.add('active'));
      const labelEl = document.getElementById('activeFilterLabel');
      if (labelEl) labelEl.textContent = allLabel();
    }
    updateSortVisibility();

    currentSort = 'date-desc';
    document.querySelectorAll('.me-sort-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.me-sort-btn[data-sort="date-desc"]')?.classList.add('active');

    renderGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Poster / Cover URL helper ----------
  function posterUrl(item) {
    const mode = getMediaType();
    if (mode === 'games') {
      if (config.coverMode === 'local' || config.posterMode === 'local') return `covers/${item.igdbId || item.rawgId}.jpg`;
      if (item.coverPath) return item.coverPath;
      return '';
    }
    if (config.posterMode === 'local') return `posters/${item.tmdbId}.jpg`;
    if (item.posterPath) return `${config.tmdbImageBase || 'https://image.tmdb.org/t/p/w500'}${item.posterPath}`;
    return '';
  }

  // ---------- Search ----------
  function bindSearch() {
    const mobileInput = document.getElementById('mobile-search-box');

    function handleSearch(value) {
      searchQuery = value.trim().toLowerCase();

      // If searching from featured mode, switch to default content mode
      if (searchQuery && currentMode === 'featured') {
        const modes = Array.isArray(config.modes) ? config.modes : ['movies', 'tv', 'games'];
        const defaultMode = modes.includes(config.defaultMode) ? config.defaultMode : modes[0];
        switchMode(defaultMode);
        // Re-set search since switchMode clears it
        searchQuery = value.trim().toLowerCase();
        if (mobileInput) mobileInput.value = value;
        const submitBtn = document.querySelector('.me-search-submit');
        const submitIcon = submitBtn?.querySelector('i');
        if (submitIcon) submitIcon.className = 'bi bi-x-lg';
        if (submitBtn) submitBtn.classList.add('clear-mode');
      }

      renderGrid();
    }

    if (mobileInput) {
      mobileInput.addEventListener('input', () => handleSearch(mobileInput.value));
    }
  }

  function searchItems(list) {
    if (!searchQuery) return list;
    return list.filter(m => {
      let parts;
      if (currentMode === 'games') {
        parts = [
          m.title, m.developer, m.publisher,
          ...(m.genres || []), ...(m.tags || []),
          ...(m.copies || []).map(c => c.platform),
          ...(m.copies || []).map(c => c.store || ''),
        ];
      } else {
        parts = [
          m.title, m.director, m.creator,
          ...(m.cast || []), ...(m.genres || []), ...(m.tags || []),
        ];
      }
      const haystack = parts.filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchQuery);
    });
  }

  // ---------- Sorting ----------
  function sortItems(list) {
    const sorted = [...list];
    let dateKey;
    if (currentMode === 'tv') dateKey = 'firstAirDate';
    else dateKey = 'releaseDate';

    if (currentSort === 'date-desc') {
      sorted.sort((a, b) => (b[dateKey] || '').localeCompare(a[dateKey] || ''));
    } else if (currentSort === 'alpha-asc') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (currentSort === 'rating-desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }

  function renderSortButtons() {
    // Sort is now handled by the glass sortBubble in initMobileUI
  }

  // ---------- Filtering ----------
  function getUsedFormats() {
    const data = activeData();
    const used = new Set();
    if (currentMode === 'tv') {
      data.forEach(show => {
        (show.seasons || []).forEach(s => {
          if (s.physical) used.add(s.physical);
          (s.digital || []).forEach(f => used.add(f));
        });
        if (show.boxSet) {
          if (show.boxSet.physical) used.add(show.boxSet.physical);
          (show.boxSet.digital || []).forEach(f => used.add(f));
        }
      });
    } else if (currentMode === 'movies') {
      data.forEach(m => {
        if (!m.formats) return;
        (m.formats.physical || []).forEach(f => used.add(f));
        (m.formats.digital || []).forEach(f => used.add(f));
      });
    }
    return used;
  }

  function getUsedPlatforms() {
    const used = new Set();
    games.forEach(g => {
      (g.copies || []).forEach(c => { if (c.platform) used.add(c.platform); });
    });
    return used;
  }

  function getUsedStores() {
    const used = new Set();
    games.forEach(g => {
      (g.copies || []).forEach(c => { if (c.type === 'digital' && c.store) used.add(c.store); });
    });
    return used;
  }

  function getUsedCustomFields() {
    const fields = config.customFields || [];
    const used = new Set();
    activeData().forEach(m => {
      if (!m.customTags) return;
      fields.forEach(f => { if (m.customTags[f]) used.add(f); });
    });
    return used;
  }

  function renderFilters() {
    const mobileContainer = document.getElementById('me-filter-chips');
    if (!mobileContainer) return;
    mobileContainer.innerHTML = '';

    const data = activeData();
    const chips = [];

    chips.push({ key: 'all', label: allLabel() });

    if (currentMode === 'games') {
      // Games: physical/digital/platform/store chips
      const hasPhysical = data.some(g => (g.copies || []).some(c => c.type === 'physical'));
      const hasDigital = data.some(g => (g.copies || []).some(c => c.type === 'digital'));
      if (hasPhysical) chips.push({ key: 'physical', label: 'Physical' });
      if (hasDigital) chips.push({ key: 'digital', label: 'Digital' });

      const usedPlatforms = getUsedPlatforms();
      Object.keys(PLATFORM_META).forEach(p => {
        if (usedPlatforms.has(p)) {
          chips.push({ key: `platform:${p}`, label: PLATFORM_META[p].label });
        }
      });

      const usedStores = getUsedStores();
      Object.keys(STORE_META).forEach(s => {
        if (usedStores.has(s)) {
          chips.push({ key: `store:${s}`, label: STORE_META[s].label });
        }
      });
    } else {
      // Movies / TV: format-based chips
      const usedFormats = getUsedFormats();
      let hasPhysical, hasDigital;
      if (currentMode === 'tv') {
        hasPhysical = data.some(s => (s.seasons || []).some(sn => sn.physical) || s.boxSet?.physical);
        hasDigital = data.some(s => (s.seasons || []).some(sn => (sn.digital || []).length > 0) || (s.boxSet?.digital || []).length > 0);
      } else {
        hasPhysical = data.some(m => m.formats?.physical?.length > 0);
        hasDigital = data.some(m => m.formats?.digital?.length > 0);
      }

      if (hasDigital) chips.push({ key: 'digital', label: 'Digital' });
      if (hasPhysical) chips.push({ key: 'physical', label: 'Physical' });
      if (currentMode === 'tv' && data.some(isCompleteSet)) chips.push({ key: 'complete-set', label: 'Complete Set' });

      Object.keys(FORMAT_META).forEach(key => {
        if (usedFormats.has(key)) chips.push({ key, label: FORMAT_META[key].label });
      });
    }

    // Custom fields in use
    getUsedCustomFields().forEach(f => {
      chips.push({ key: `custom:${f}`, label: f });
    });

    // Status chips
    if (currentMode === 'games') {
      const hasUnplayed = data.some(g => !g.played);
      if (hasUnplayed) chips.push({ key: 'not-played', label: 'Not Played' });
    } else {
      const hasUnwatched = data.some(m => !m.watched);
      if (hasUnwatched) chips.push({ key: 'not-watched', label: 'Not Watched' });
    }
    const hasUnrated = data.some(m => !m.rating || m.rating <= 0);
    if (hasUnrated) chips.push({ key: 'no-rating', label: 'No Rating' });

    function syncActiveFilter(key, label) {
      activeFilter = key;
      mobileContainer.querySelectorAll('.me-filter-chip').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`[data-filter="${key}"]`).forEach(b => b.classList.add('active'));
      const labelEl = document.getElementById('activeFilterLabel');
      if (labelEl) labelEl.textContent = label;
      updateSortVisibility();
      renderGrid();
    }

    const topLevelKeys = new Set(['all', 'digital', 'physical', 'complete-set']);
    const trailingKeys = new Set(['not-watched', 'not-played', 'no-rating']);
    let dividerInserted = false;

    chips.forEach((c) => {
      if (!dividerInserted && !topLevelKeys.has(c.key) && !trailingKeys.has(c.key)) {
        dividerInserted = true;
        const sep = document.createElement('span');
        sep.className = 'me-filter-divider';
        mobileContainer.appendChild(sep);
      }
      if (c.key === 'not-watched' || c.key === 'not-played') {
        const sep = document.createElement('span');
        sep.className = 'me-filter-divider';
        mobileContainer.appendChild(sep);
      }
      const btn = document.createElement('button');
      btn.className = 'me-filter-chip' + (c.key === activeFilter ? ' active' : '');
      btn.dataset.filter = c.key;
      btn.textContent = c.label;
      btn.addEventListener('click', () => syncActiveFilter(c.key, c.label));
      mobileContainer.appendChild(btn);
    });

    const labelEl = document.getElementById('activeFilterLabel');
    const activeChip = chips.find(c => c.key === activeFilter);
    if (labelEl && activeChip) labelEl.textContent = activeChip.label;
  }

  function filterItems(list) {
    if (activeFilter === 'all') return list;
    if (activeFilter === 'not-watched') return list.filter(m => !m.watched);
    if (activeFilter === 'not-played') return list.filter(g => !g.played);
    if (activeFilter === 'no-rating') return list.filter(m => !m.rating || m.rating <= 0);
    if (activeFilter === 'complete-set') return list.filter(isCompleteSet);
    if (activeFilter.startsWith('custom:')) {
      const field = activeFilter.slice(7);
      return list.filter(m => m.customTags && m.customTags[field]);
    }

    if (currentMode === 'games') {
      if (activeFilter === 'physical') return list.filter(g => (g.copies || []).some(c => c.type === 'physical'));
      if (activeFilter === 'digital') return list.filter(g => (g.copies || []).some(c => c.type === 'digital'));
      if (activeFilter.startsWith('platform:')) {
        const platform = activeFilter.slice(9);
        return list.filter(g => (g.copies || []).some(c => c.platform === platform));
      }
      if (activeFilter.startsWith('store:')) {
        const store = activeFilter.slice(6);
        return list.filter(g => (g.copies || []).some(c => c.store === store));
      }
      return list;
    }

    if (currentMode === 'tv') {
      if (activeFilter === 'physical') {
        return list.filter(s => (s.seasons || []).some(sn => sn.physical) || s.boxSet?.physical);
      }
      if (activeFilter === 'digital') {
        return list.filter(s => (s.seasons || []).some(sn => (sn.digital || []).length > 0) || (s.boxSet?.digital || []).length > 0);
      }
      const meta = FORMAT_META[activeFilter];
      if (!meta) return list;
      return list.filter(s => {
        if (meta.category === 'physical') {
          return (s.seasons || []).some(sn => sn.physical === activeFilter) || s.boxSet?.physical === activeFilter;
        }
        return (s.seasons || []).some(sn => (sn.digital || []).includes(activeFilter)) || (s.boxSet?.digital || []).includes(activeFilter);
      });
    }

    // Movie filtering
    if (activeFilter === 'physical') return list.filter(m => m.formats?.physical?.length > 0);
    if (activeFilter === 'digital') return list.filter(m => m.formats?.digital?.length > 0);
    const meta = FORMAT_META[activeFilter];
    if (!meta) return list;
    return list.filter(m => m.formats && m.formats[meta.category]?.includes(activeFilter));
  }

  // ---------- Sort visibility (hide on Featured mode) ----------
  function updateSortVisibility() {
    const sortBubble = document.getElementById('sortBubble');
    if (!sortBubble) return;
    if (currentMode === 'featured') {
      sortBubble.style.display = 'none';
    } else {
      sortBubble.style.display = '';
      // Keep sort expanded when switching to a non-featured mode
      if (!sortBubble.classList.contains('expanded')) {
        sortBubble.classList.add('expanded');
      }
    }
  }

  // ---------- Slider indicator positioning ----------
  function positionSliderIndicator(container, btnSelector, animate) {
    const indicator = container?.querySelector('.slider-indicator');
    if (!indicator) return;
    const activeBtn = container.querySelector(btnSelector + '.active');
    if (!activeBtn || activeBtn.offsetWidth === 0) {
      indicator.style.opacity = '0';
      return;
    }
    if (!animate) {
      indicator.style.transition = 'none';
    }
    indicator.style.left = activeBtn.offsetLeft + 'px';
    indicator.style.top = activeBtn.offsetTop + 'px';
    indicator.style.width = activeBtn.offsetWidth + 'px';
    indicator.style.height = activeBtn.offsetHeight + 'px';
    indicator.style.opacity = '';
    if (!animate) {
      indicator.offsetHeight; // force reflow
      indicator.style.transition = '';
    }
  }

  // ---------- Grid rendering ----------
  function renderGrid() {
    const grid = document.getElementById('poster-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (currentMode === 'featured') {
      grid.classList.add('featured-active');
      renderFeatured(grid);
      return;
    }

    grid.classList.remove('featured-active');
    grid.classList.remove('featured-mobile');
    const visible = sortItems(filterItems(searchItems(activeData())));

    if (visible.length === 0) {
      grid.innerHTML = `<div class="text-center text-secondary py-5 w-100" style="grid-column:1/-1;">${noItemsLabel()}</div>`;
      return;
    }

    visible.forEach(item => {
      grid.appendChild(buildPosterCard(item));
    });
  }

  function buildPosterCard(item) {
    const mode = item._mediaType || getMediaType();
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', item.title);

    // Set _renderingMediaType so posterUrl works correctly for mixed-media
    const prevMediaType = _renderingMediaType;
    _renderingMediaType = mode;

    const src = posterUrl(item);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.title;
      img.loading = 'lazy';
      img.onerror = function () {
        this.style.display = 'none';
        const ph = document.createElement('div');
        ph.className = 'poster-placeholder';
        ph.textContent = item.title;
        card.appendChild(ph);
      };
      card.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'poster-placeholder';
      ph.textContent = item.title;
      card.appendChild(ph);
    }

    _renderingMediaType = prevMediaType;

    card.addEventListener('click', () => openDetail(item));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openDetail(item); });
    return card;
  }

  // ---------- Featured rendering (dynamic categories, cross-media) ----------

  /** Seeded PRNG for deterministic daily shuffles */
  function seededRandom(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
    return function () {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) / 4294967296);
    };
  }

  function getDailySeed() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('featured_seed_date');
    if (stored === today) return localStorage.getItem('featured_seed') || today;
    const seed = today + '_' + Math.random().toString(36).slice(2, 6);
    localStorage.setItem('featured_seed_date', today);
    localStorage.setItem('featured_seed', seed);
    return seed;
  }

  function shuffleWithSeed(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function itemId(item) {
    if (item._mediaType === 'games') return 'g_' + (item.igdbId || item.rawgId || item.title);
    if (item._mediaType === 'tv') return 't_' + (item.tmdbId || item.title);
    return 'm_' + (item.tmdbId || item.title);
  }

  function dateKeyFor(item) {
    if (item._mediaType === 'tv') return item.firstAirDate || '';
    return item.releaseDate || '';
  }

  function getDecade(dateStr) {
    if (!dateStr) return null;
    const year = parseInt(dateStr.slice(0, 4));
    if (isNaN(year)) return null;
    return Math.floor(year / 10) * 10;
  }

  function decadeLabel(decade) {
    if (decade < 2000) return `${decade - (decade % 100 === 0 ? 0 : 0)}`.slice(2) + '0s';
    return `${decade}s`;
  }

  /** Build all possible category generators. Each returns { title, items } or null. */
  function buildCategoryGenerators() {
    const SECTION_SIZE = 8;
    const MIN_COUNT = 4;
    const generators = [];

    // ---- MAINSTAY: Newest Additions (cross-media, by release date) ----
    generators.push({ mainstay: true, priority: 0, id: 'newest', fn: (usedIds) => {
      const all = [...movies, ...tvShows, ...games];
      const picks = all.sort((a, b) => dateKeyFor(b).localeCompare(dateKeyFor(a)))
        .filter(m => !usedIds.has(itemId(m)))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Newest Additions', items: picks };
    }});

    // ---- MAINSTAY: Recently Released (newest movie releases) ----
    generators.push({ mainstay: true, priority: 1, id: 'newest-movies', fn: (usedIds) => {
      if (!movies.length) return null;
      const picks = [...movies].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
        .filter(m => !usedIds.has(itemId(m)))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Newest Movie Releases', items: picks };
    }});

    // ---- MAINSTAY: Your 5-Star Picks (cross-media) ----
    generators.push({ mainstay: true, priority: 2, id: '5star-all', fn: (usedIds) => {
      const all = [...movies, ...tvShows, ...games].filter(m => m.rating === 5 && !usedIds.has(itemId(m)));
      if (all.length < MIN_COUNT) return null;
      return { title: 'Your 5-Star Picks', items: all.slice(0, SECTION_SIZE) };
    }});

    // ---- MOVIES: from [DIRECTOR] ----
    const directorCounts = {};
    movies.forEach(m => { if (m.director) { if (!directorCounts[m.director]) directorCounts[m.director] = []; directorCounts[m.director].push(m); }});
    Object.entries(directorCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([director, items]) => {
        generators.push({ mainstay: false, id: `dir_${director}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Movies from ${director}`, items: picks };
        }});
      });

    // ---- MOVIES: Starring [ACTOR] ----
    const actorCounts = {};
    movies.forEach(m => { (m.cast || []).forEach(a => { if (!actorCounts[a]) actorCounts[a] = []; actorCounts[a].push(m); }); });
    Object.entries(actorCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([actor, items]) => {
        generators.push({ mainstay: false, id: `actor_${actor}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Starring ${actor}`, items: picks };
        }});
      });

    // ---- MOVIES: [GENRE] Movies ----
    const movieGenreCounts = {};
    movies.forEach(m => { (m.genres || []).forEach(g => { if (!movieGenreCounts[g]) movieGenreCounts[g] = []; movieGenreCounts[g].push(m); }); });
    Object.entries(movieGenreCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([genre, items]) => {
        generators.push({ mainstay: false, id: `mgenre_${genre}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m)))
            .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
            .slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${genre} Movies`, items: picks };
        }});
      });

    // ---- MOVIES: [DECADE] Classics ----
    const movieDecades = {};
    movies.forEach(m => { const d = getDecade(m.releaseDate); if (d) { if (!movieDecades[d]) movieDecades[d] = []; movieDecades[d].push(m); }});
    Object.entries(movieDecades).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([decade, items]) => {
        generators.push({ mainstay: false, id: `mdecade_${decade}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${decadeLabel(Number(decade))} Classics`, items: picks };
        }});
      });

    // ---- MOVIES: [FORMAT] Collection ----
    const formatCounts = {};
    movies.forEach(m => { (m.formats?.physical || []).forEach(f => { if (!formatCounts[f]) formatCounts[f] = []; formatCounts[f].push(m); }); });
    Object.entries(formatCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([fmt, items]) => {
        const meta = FORMAT_META[fmt];
        const label = meta ? meta.label : fmt;
        generators.push({ mainstay: false, id: `mfmt_${fmt}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${label} Collection`, items: picks };
        }});
      });

    // ---- MOVIES: on [DIGITAL PLATFORM] ----
    const digitalPlatCounts = {};
    movies.forEach(m => { (m.formats?.digital || []).forEach(f => { if (!digitalPlatCounts[f]) digitalPlatCounts[f] = []; digitalPlatCounts[f].push(m); }); });
    Object.entries(digitalPlatCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([fmt, items]) => {
        const meta = FORMAT_META[fmt];
        const label = meta ? meta.label : fmt;
        generators.push({ mainstay: false, id: `mdigplat_${fmt}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Movies on ${label}`, items: picks };
        }});
      });

    // ---- MOVIES: Unwatched Movies ----
    generators.push({ mainstay: false, id: 'unwatched-movies', fn: (usedIds) => {
      const picks = movies.filter(m => !m.watched && !usedIds.has(itemId(m)))
        .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Unwatched Movies', items: picks };
    }});

    // ---- MOVIES: 5-Star Movies ----
    generators.push({ mainstay: false, id: '5star-movies', fn: (usedIds) => {
      const picks = movies.filter(m => m.rating === 5 && !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: '5-Star Movies', items: picks };
    }});

    // ---- MOVIES: Hidden Gems (rated 4+ in rare genres) ----
    generators.push({ mainstay: false, id: 'hidden-gems', fn: (usedIds) => {
      const genreFreq = {};
      movies.forEach(m => (m.genres || []).forEach(g => { genreFreq[g] = (genreFreq[g] || 0) + 1; }));
      const rareGenres = new Set(Object.entries(genreFreq).filter(([, c]) => c < 8).map(([g]) => g));
      const picks = movies.filter(m => m.rating >= 4 && (m.genres || []).some(g => rareGenres.has(g)) && !usedIds.has(itemId(m)))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Hidden Gems', items: picks };
    }});

    // ---- TV: Shows from [CREATOR] ----
    const creatorCounts = {};
    tvShows.forEach(s => { if (s.creator) { if (!creatorCounts[s.creator]) creatorCounts[s.creator] = []; creatorCounts[s.creator].push(s); }});
    Object.entries(creatorCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([creator, items]) => {
        generators.push({ mainstay: false, id: `tcreator_${creator}`, fn: (usedIds) => {
          const picks = items.filter(s => !usedIds.has(itemId(s))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Shows from ${creator}`, items: picks };
        }});
      });

    // ---- TV: Starring [ACTOR] ----
    const tvActorCounts = {};
    tvShows.forEach(s => { (s.cast || []).forEach(a => { if (!tvActorCounts[a]) tvActorCounts[a] = []; tvActorCounts[a].push(s); }); });
    Object.entries(tvActorCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([actor, items]) => {
        generators.push({ mainstay: false, id: `tactor_${actor}`, fn: (usedIds) => {
          const picks = items.filter(s => !usedIds.has(itemId(s))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Shows Starring ${actor}`, items: picks };
        }});
      });

    // ---- TV: [GENRE] Shows ----
    const tvGenreCounts = {};
    tvShows.forEach(s => { (s.genres || []).forEach(g => { if (!tvGenreCounts[g]) tvGenreCounts[g] = []; tvGenreCounts[g].push(s); }); });
    Object.entries(tvGenreCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([genre, items]) => {
        generators.push({ mainstay: false, id: `tgenre_${genre}`, fn: (usedIds) => {
          const picks = items.filter(s => !usedIds.has(itemId(s)))
            .sort((a, b) => (b.firstAirDate || '').localeCompare(a.firstAirDate || ''))
            .slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${genre} Shows`, items: picks };
        }});
      });

    // ---- TV: Complete Collections ----
    generators.push({ mainstay: false, id: 'tv-complete', fn: (usedIds) => {
      const picks = tvShows.filter(s => isCompleteSet(s) && !usedIds.has(itemId(s)))
        .sort((a, b) => (b.firstAirDate || '').localeCompare(a.firstAirDate || ''))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Complete Collections', items: picks };
    }});

    // ---- TV: Shows on [DIGITAL PLATFORM] ----
    const tvDigitalCounts = {};
    tvShows.forEach(s => {
      const platforms = new Set();
      (s.seasons || []).forEach(sn => (sn.digital || []).forEach(f => platforms.add(f)));
      if (s.boxSet?.digital) s.boxSet.digital.forEach(f => platforms.add(f));
      platforms.forEach(f => { if (!tvDigitalCounts[f]) tvDigitalCounts[f] = []; tvDigitalCounts[f].push(s); });
    });
    Object.entries(tvDigitalCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([fmt, items]) => {
        const meta = FORMAT_META[fmt];
        const label = meta ? meta.label : fmt;
        generators.push({ mainstay: false, id: `tdigplat_${fmt}`, fn: (usedIds) => {
          const picks = items.filter(s => !usedIds.has(itemId(s))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Shows on ${label}`, items: picks };
        }});
      });

    // ---- TV: [DECADE] TV ----
    const tvDecades = {};
    tvShows.forEach(s => { const d = getDecade(s.firstAirDate); if (d) { if (!tvDecades[d]) tvDecades[d] = []; tvDecades[d].push(s); }});
    Object.entries(tvDecades).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([decade, items]) => {
        generators.push({ mainstay: false, id: `tdecade_${decade}`, fn: (usedIds) => {
          const picks = items.filter(s => !usedIds.has(itemId(s))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${decadeLabel(Number(decade))} TV`, items: picks };
        }});
      });

    // ---- TV: Long-Running Series (5+ seasons) ----
    generators.push({ mainstay: false, id: 'tv-longrunning', fn: (usedIds) => {
      const picks = tvShows.filter(s => (s.totalSeasons || 0) >= 5 && !usedIds.has(itemId(s)))
        .sort((a, b) => (b.totalSeasons || 0) - (a.totalSeasons || 0))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Long-Running Series', items: picks };
    }});

    // ---- TV: Unwatched Shows ----
    generators.push({ mainstay: false, id: 'unwatched-tv', fn: (usedIds) => {
      const picks = tvShows.filter(s => !s.watched && !usedIds.has(itemId(s)))
        .sort((a, b) => (b.firstAirDate || '').localeCompare(a.firstAirDate || ''))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Unwatched Shows', items: picks };
    }});

    // ---- TV: 5-Star Shows ----
    generators.push({ mainstay: false, id: '5star-tv', fn: (usedIds) => {
      const picks = tvShows.filter(s => s.rating === 5 && !usedIds.has(itemId(s))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: '5-Star Shows', items: picks };
    }});

    // ---- GAMES: Favorites from the [SYSTEM] Era ----
    const platformGames = {};
    games.forEach(g => {
      (g.copies || []).forEach(c => {
        if (!platformGames[c.platform]) platformGames[c.platform] = [];
        if (!platformGames[c.platform].includes(g)) platformGames[c.platform].push(g);
      });
    });
    Object.entries(platformGames).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([platform, items]) => {
        const meta = PLATFORM_META[platform];
        const label = meta ? meta.label : platform;
        generators.push({ mainstay: false, id: `gplat_${platform}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Favorites from the ${label} Era`, items: picks };
        }});
      });

    // ---- GAMES: [GENRE] Games ----
    const gameGenreCounts = {};
    games.forEach(g => { (g.genres || []).forEach(genre => { if (!gameGenreCounts[genre]) gameGenreCounts[genre] = []; gameGenreCounts[genre].push(g); }); });
    Object.entries(gameGenreCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([genre, items]) => {
        generators.push({ mainstay: false, id: `ggenre_${genre}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g)))
            .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
            .slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${genre} Games`, items: picks };
        }});
      });

    // ---- GAMES: [PLATFORM FAMILY] Collection ----
    const familyGames = {};
    games.forEach(g => {
      (g.copies || []).forEach(c => {
        const meta = PLATFORM_META[c.platform];
        const family = meta ? meta.family : 'Other';
        if (!familyGames[family]) familyGames[family] = [];
        if (!familyGames[family].includes(g)) familyGames[family].push(g);
      });
    });
    Object.entries(familyGames).filter(([fam, arr]) => arr.length >= MIN_COUNT && fam !== 'Other')
      .forEach(([family, items]) => {
        generators.push({ mainstay: false, id: `gfam_${family}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${family} Collection`, items: picks };
        }});
      });

    // ---- GAMES: by [DEVELOPER] ----
    const devCounts = {};
    games.forEach(g => { if (g.developer) { if (!devCounts[g.developer]) devCounts[g.developer] = []; devCounts[g.developer].push(g); }});
    Object.entries(devCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([dev, items]) => {
        generators.push({ mainstay: false, id: `gdev_${dev}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Games by ${dev}`, items: picks };
        }});
      });

    // ---- GAMES: by [PUBLISHER] ----
    const pubCounts = {};
    games.forEach(g => { if (g.publisher) { if (!pubCounts[g.publisher]) pubCounts[g.publisher] = []; pubCounts[g.publisher].push(g); }});
    Object.entries(pubCounts).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([pub, items]) => {
        generators.push({ mainstay: false, id: `gpub_${pub}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `Games by ${pub}`, items: picks };
        }});
      });

    // ---- GAMES: [DECADE] Gaming ----
    const gameDecades = {};
    games.forEach(g => { const d = getDecade(g.releaseDate); if (d) { if (!gameDecades[d]) gameDecades[d] = []; gameDecades[d].push(g); }});
    Object.entries(gameDecades).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([decade, items]) => {
        generators.push({ mainstay: false, id: `gdecade_${decade}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${decadeLabel(Number(decade))} Gaming`, items: picks };
        }});
      });

    // ---- GAMES: Digital Library ----
    generators.push({ mainstay: false, id: 'g-digital', fn: (usedIds) => {
      const picks = games.filter(g => (g.copies || []).some(c => c.type === 'digital') && !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Digital Game Library', items: picks };
    }});

    // ---- GAMES: Unplayed Backlog ----
    generators.push({ mainstay: false, id: 'g-unplayed', fn: (usedIds) => {
      const picks = games.filter(g => !g.played && !usedIds.has(itemId(g)))
        .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Unplayed Backlog', items: picks };
    }});

    // ---- GAMES: Completed Adventures ----
    generators.push({ mainstay: false, id: 'g-completed', fn: (usedIds) => {
      const picks = games.filter(g => g.completed && !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Completed Adventures', items: picks };
    }});

    // ---- GAMES: 5-Star Games ----
    generators.push({ mainstay: false, id: '5star-games', fn: (usedIds) => {
      const picks = games.filter(g => g.rating === 5 && !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: '5-Star Games', items: picks };
    }});

    // ---- GAMES: [STORE] Library ----
    const storeGames = {};
    games.forEach(g => { (g.copies || []).forEach(c => { if (c.type === 'digital' && c.store) { if (!storeGames[c.store]) storeGames[c.store] = []; if (!storeGames[c.store].includes(g)) storeGames[c.store].push(g); }}); });
    Object.entries(storeGames).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([store, items]) => {
        const meta = STORE_META[store];
        const label = meta ? meta.label : store;
        generators.push({ mainstay: false, id: `gstore_${store}`, fn: (usedIds) => {
          const picks = items.filter(g => !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `${label} Library`, items: picks };
        }});
      });

    // ---- GAMES: Retro Gaming (pre-2000 platforms) ----
    const retroPlatforms = new Set(['NES', 'SNES', 'Nintendo 64', 'Game Boy', 'Game Boy Color', 'Game Boy Advance',
      'Genesis', 'Sega Master System', 'Sega Saturn', 'Dreamcast', 'Game Gear',
      'PlayStation', 'Atari 2600', 'Atari 5200', 'Atari 7800', 'Atari Jaguar', 'Atari Lynx',
      'Neo Geo', 'TurboGrafx-16', '3DO']);
    generators.push({ mainstay: false, id: 'g-retro', fn: (usedIds) => {
      const picks = games.filter(g => (g.copies || []).some(c => retroPlatforms.has(c.platform)) && !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Retro Gaming', items: picks };
    }});

    // ---- GAMES: Modern Classics (current-gen, high rated) ----
    const modernPlatforms = new Set(['PlayStation 5', 'Xbox Series S/X', 'Nintendo Switch', 'PlayStation 4', 'Xbox One']);
    generators.push({ mainstay: false, id: 'g-modern', fn: (usedIds) => {
      const picks = games.filter(g => g.rating >= 4 && (g.copies || []).some(c => modernPlatforms.has(c.platform)) && !usedIds.has(itemId(g)))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Modern Classics', items: picks };
    }});

    // ---- GAMES: Handheld Collection ----
    const handheldPlatforms = new Set(['Game Boy', 'Game Boy Color', 'Game Boy Advance', 'Nintendo DS', 'Nintendo 3DS',
      'PSP', 'PS Vita', 'Nintendo Switch', 'Game Gear', 'Atari Lynx']);
    generators.push({ mainstay: false, id: 'g-handheld', fn: (usedIds) => {
      const picks = games.filter(g => (g.copies || []).some(c => handheldPlatforms.has(c.platform)) && !usedIds.has(itemId(g))).slice(0, SECTION_SIZE);
      if (picks.length < MIN_COUNT) return null;
      return { title: 'Handheld Collection', items: picks };
    }});

    // ---- CROSS-MEDIA: The [DECADE] Vault ----
    const allDecades = {};
    [...movies, ...tvShows, ...games].forEach(item => {
      const d = getDecade(dateKeyFor(item));
      if (d) { if (!allDecades[d]) allDecades[d] = []; allDecades[d].push(item); }
    });
    Object.entries(allDecades).filter(([, arr]) => arr.length >= MIN_COUNT)
      .forEach(([decade, items]) => {
        generators.push({ mainstay: false, id: `xdecade_${decade}`, fn: (usedIds) => {
          const picks = items.filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
          if (picks.length < MIN_COUNT) return null;
          return { title: `The ${decadeLabel(Number(decade))} Vault`, items: picks };
        }});
      });

    // ---- CROSS-MEDIA: [GENRE] Across Media ----
    const crossGenre = {};
    [...movies, ...tvShows, ...games].forEach(item => {
      (item.genres || []).forEach(g => { if (!crossGenre[g]) crossGenre[g] = new Set(); crossGenre[g].add(item); });
    });
    Object.entries(crossGenre).filter(([, set]) => {
      const arr = [...set];
      const types = new Set(arr.map(i => i._mediaType));
      return arr.length >= MIN_COUNT && types.size >= 2;
    }).forEach(([genre, set]) => {
      generators.push({ mainstay: false, id: `xgenre_${genre}`, fn: (usedIds) => {
        const picks = [...set].filter(m => !usedIds.has(itemId(m))).slice(0, SECTION_SIZE);
        if (picks.length < MIN_COUNT) return null;
        return { title: `${genre} Across Media`, items: picks };
      }});
    });

    return generators;
  }

  let _cachedFeaturedSections = null;
  let _cachedFeaturedSeed = null;

  function renderFeatured(grid) {
    const seed = getDailySeed();

    // Use cached sections if same day
    if (_cachedFeaturedSections && _cachedFeaturedSeed === seed) {
      renderFeaturedSections(grid, _cachedFeaturedSections);
      return;
    }

    const generators = buildCategoryGenerators();
    const rng = seededRandom(seed);
    const mainstays = generators.filter(g => g.mainstay).sort((a, b) => a.priority - b.priority);
    const dynamic = shuffleWithSeed(generators.filter(g => !g.mainstay), rng);

    const MAX_SECTIONS = 12;
    const sections = [];
    const usedIds = new Set();

    // First: mainstays
    for (const gen of mainstays) {
      if (sections.length >= MAX_SECTIONS) break;
      const result = gen.fn(usedIds);
      if (result) {
        sections.push(result);
        result.items.forEach(item => usedIds.add(itemId(item)));
      }
    }

    // Then: shuffled dynamic
    for (const gen of dynamic) {
      if (sections.length >= MAX_SECTIONS) break;
      const result = gen.fn(usedIds);
      if (result) {
        sections.push(result);
        result.items.forEach(item => usedIds.add(itemId(item)));
      }
    }

    _cachedFeaturedSections = sections;
    _cachedFeaturedSeed = seed;

    renderFeaturedSections(grid, sections);
  }

  function renderFeaturedSections(grid, sections) {
    if (sections.length === 0) {
      grid.innerHTML = `<div class="text-center text-secondary py-5 w-100" style="grid-column:1/-1;">Nothing to feature yet. Add some media to get started!</div>`;
      return;
    }

    grid.classList.remove('featured-mobile');
    sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'featured-section';

      const heading = document.createElement('h3');
      heading.className = 'featured-section-title';
      heading.textContent = section.title;
      sectionEl.appendChild(heading);

      const row = document.createElement('div');
      row.className = 'featured-row';
      section.items.forEach(item => {
        row.appendChild(buildPosterCard(item));
      });
      sectionEl.appendChild(row);
      grid.appendChild(sectionEl);
    });
  }

  // ---------- Detail view ----------
  function openDetail(item) {
    // Set rendering media type for mixed-media featured mode
    _renderingMediaType = item._mediaType || currentMode;
    if (window.innerWidth < 768) openFullScreen(item);
    else openModal(item);
    _renderingMediaType = null;
  }

  function buildStars(rating) {
    if (!rating || rating <= 0) return '<span class="text-secondary" style="font-size:.85rem">Not rated</span>';
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) html += '<span class="star filled">★</span>';
      else if (rating >= i - 0.5) html += '<span class="star half">★</span>';
      else html += '<span class="star empty">★</span>';
    }
    return html;
  }

  function buildGenreTags(item) {
    if (!item.genres || item.genres.length === 0) return '';
    return item.genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
  }

  function buildCredits(item) {
    const mode = item._mediaType || getMediaType();
    let html = '';
    if (mode === 'games') {
      if (item.developer) html += `<p class="detail-credits-line"><span class="credits-label">Developer</span> ${item.developer}</p>`;
      if (item.publisher) html += `<p class="detail-credits-line"><span class="credits-label">Publisher</span> ${item.publisher}</p>`;
    } else {
      if (item.director) html += `<p class="detail-credits-line"><span class="credits-label">Director</span> ${item.director}</p>`;
      if (item.creator) html += `<p class="detail-credits-line"><span class="credits-label">Creator</span> ${item.creator}</p>`;
      if (item.cast?.length > 0) html += `<p class="detail-credits-line"><span class="credits-label">Cast</span> ${item.cast.join(', ')}</p>`;
      if (item.totalSeasons) html += `<p class="detail-credits-line"><span class="credits-label">Seasons</span> ${item.totalSeasons}</p>`;
    }
    return html;
  }

  function buildFormatBadges(item) {
    const mode = item._mediaType || getMediaType();
    if (mode === 'games') return ''; // Games use copies instead
    if (!item.formats) return '';
    const dq = item.digitalQuality || [];
    const qbHtml = dq.map(q => `<span class="quality-badge quality-${q.toLowerCase()}">${q}</span>`).join(' ');

    let physicalHtml = '';
    (item.formats.physical || []).forEach(f => {
      const meta = FORMAT_META[f];
      if (!meta) return;
      physicalHtml += `<span class="format-badge" data-bs-toggle="tooltip" data-bs-title="${meta.label}"><img src="${meta.logo}" alt="${meta.label}"></span>`;
    });

    let digitalHtml = '';
    const title = encodeURIComponent(item.title || '');
    const slug = (item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    (item.formats.digital || []).forEach(f => {
      const meta = FORMAT_META[f];
      if (!meta) return;
      if (meta.url) {
        const href = meta.url.replace('{q}', title).replace('{slug}', slug);
        digitalHtml += `<a class="format-badge format-badge-link" href="${href}" target="_blank" rel="noopener" data-bs-toggle="tooltip" data-bs-title="${meta.label}"><img src="${meta.logo}" alt="${meta.label}"></a>`;
      } else {
        digitalHtml += `<span class="format-badge" data-bs-toggle="tooltip" data-bs-title="${meta.label}"><img src="${meta.logo}" alt="${meta.label}"></span>`;
      }
    });
    if (qbHtml) digitalHtml += `<span class="format-badge">${qbHtml}</span>`;

    let html = '';
    if (physicalHtml) {
      let backedUpHtml = '';
      if (item.backedUp) {
        backedUpHtml = '<span class="backed-up-badge" title="Backed Up"><i class="bi bi-hdd-fill"></i> Backed Up</span>';
      }
      html += `<div class="format-section"><span class="format-section-label">Physical</span><div class="format-badges">${physicalHtml}</div>${backedUpHtml}</div>`;
    }
    if (digitalHtml) {
      html += `<div class="format-section"><span class="format-section-label">Digital</span><div class="format-badges">${digitalHtml}</div></div>`;
    }
    return html;
  }

  function buildCopies(item) {
    const mode = item._mediaType || getMediaType();
    if (mode !== 'games') return '';
    const copies = item.copies || [];
    if (copies.length === 0) return '';

    const physical = copies.filter(c => c.type === 'physical');
    const digital = copies.filter(c => c.type === 'digital');

    let html = '<div class="copies-section">';
    html += '<div class="copies-section-title">Collection</div>';

    if (physical.length > 0) {
      html += '<div class="copy-group">';
      html += '<span class="copy-group-label">Physical</span>';
      physical.forEach(c => {
        const platMeta = PLATFORM_META[c.platform];
        const platLabel = platMeta ? platMeta.label : c.platform;
        html += '<div class="copy-row">';
        html += `<span class="copy-platform-badge">${platLabel}</span>`;
        if (c.condition) {
          html += `<span class="copy-condition-badge">${c.condition}</span>`;
        }
        if (c.backedUp) {
          html += '<span class="backed-up-badge" title="Backed Up"><i class="bi bi-hdd-fill"></i> Backed Up</span>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    if (digital.length > 0) {
      html += '<div class="copy-group">';
      html += '<span class="copy-group-label">Digital</span>';
      digital.forEach(c => {
        const platMeta = PLATFORM_META[c.platform];
        const platLabel = platMeta ? platMeta.label : c.platform;
        const storeMeta = STORE_META[c.store];
        const storeLabel = storeMeta ? storeMeta.label : (c.store || '');
        const title = encodeURIComponent(item.title || '');

        html += '<div class="copy-row">';
        html += `<span class="copy-platform-badge">${platLabel}</span>`;
        if (storeLabel) {
          if (storeMeta && storeMeta.url) {
            const href = storeMeta.url.replace('{q}', title);
            html += `<a class="copy-store-badge copy-store-link" href="${href}" target="_blank" rel="noopener">${storeLabel}</a>`;
          } else {
            html += `<span class="copy-store-badge">${storeLabel}</span>`;
          }
        }
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function buildTags(item) {
    const mode = item._mediaType || getMediaType();
    const items = [];
    if (mode === 'games') {
      if (item.played) items.push('Played');
      if (item.completed) items.push('Completed');
    }
    items.push(...(item.tags || []));
    (config.customFields || []).forEach(f => {
      if (item.customTags && item.customTags[f]) items.push(f);
    });
    if (items.length === 0) return '';
    return '<div class="movie-tags">' + items.map(t => `<span class="movie-tag">${t}</span>`).join('') + '</div>';
  }

  // ---------- TV Show Seasons / Box Set rendering ----------
  function formatBadgeHtml(key, title) {
    const meta = FORMAT_META[key];
    if (!meta) return `<span class="format-badge">${key}</span>`;
    const encodedTitle = encodeURIComponent(title || '');
    const slug = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (meta.url) {
      const href = meta.url.replace('{q}', encodedTitle).replace('{slug}', slug);
      return `<a class="format-badge format-badge-link" href="${href}" target="_blank" rel="noopener" data-bs-toggle="tooltip" data-bs-title="${meta.label}"><img src="${meta.logo}" alt="${meta.label}"></a>`;
    }
    return `<span class="format-badge" data-bs-toggle="tooltip" data-bs-title="${meta.label}"><img src="${meta.logo}" alt="${meta.label}"></span>`;
  }

  function buildSeasons(show) {
    const mode = show._mediaType || getMediaType();
    if (mode !== 'tv') return '';

    const hasBoxSet = show.boxSet && (show.boxSet.physical || (show.boxSet.digital && show.boxSet.digital.length > 0));

    let html = '<div class="seasons-section">';
    html += '<div class="seasons-section-title">Availability</div>';

    if (hasBoxSet) {
      html += '<div class="box-set-badge">';
      html += '<span>Box Set</span>';
      if (show.boxSet.physical) {
        html += `<span class="season-divider"></span>`;
        html += formatBadgeHtml(show.boxSet.physical, show.title);
        if (show.boxSet.backedUp) {
          html += '<span class="backed-up-badge backed-up-badge-sm" title="Backed Up"><i class="bi bi-hdd-fill"></i></span>';
        }
      }
      if (show.boxSet.digital && show.boxSet.digital.length > 0) {
        html += `<span class="season-divider"></span>`;
        show.boxSet.digital.forEach(f => {
          html += formatBadgeHtml(f, show.title);
        });
      }
      html += '</div>';
    }

    const seasons = show.seasons || [];
    if (seasons.length > 0) {
      html += '<div class="seasons-list">';
      const seasonMap = {};
      seasons.forEach(s => { seasonMap[s.seasonNumber] = s; });

      for (let i = 1; i <= (show.totalSeasons || seasons.length); i++) {
        const s = seasonMap[i];
        const hasPhysical = s && s.physical;
        const hasDigital = s && s.digital && s.digital.length > 0;
        if (!hasPhysical && !hasDigital) continue;

        html += '<div class="season-row">';
        html += `<span class="season-label">S${i}</span>`;
        html += '<span class="season-formats">';

        if (hasPhysical) {
          html += '<span class="season-format-group">';
          html += formatBadgeHtml(s.physical, show.title);
          if (s.backedUp) {
            html += '<span class="backed-up-badge backed-up-badge-sm" title="Backed Up"><i class="bi bi-hdd-fill"></i></span>';
          }
          html += '</span>';
        }
        if (hasPhysical && hasDigital) {
          html += '<span class="season-divider"></span>';
        }
        if (hasDigital) {
          html += '<span class="season-format-group">';
          s.digital.forEach(f => {
            html += formatBadgeHtml(f, show.title);
          });
          html += '</span>';
        }

        html += '</span></div>';
      }
      html += '</div>';
    } else if (!hasBoxSet) {
      html += '<div class="season-not-owned-msg">No seasons owned</div>';
    }

    html += '</div>';
    return html;
  }

  function populateDetail(prefix, item) {
    const mode = item._mediaType || getMediaType();
    document.getElementById(`${prefix}-title`).textContent = item.title || '';

    // Date
    let dateVal, dateLabel;
    if (mode === 'tv') {
      dateVal = item.firstAirDate;
      dateLabel = 'First Aired';
    } else if (mode === 'games') {
      dateVal = item.releaseDate;
      dateLabel = 'Released';
    } else {
      dateVal = item.releaseDate;
      dateLabel = 'Release';
    }
    document.getElementById(`${prefix}-date`).textContent = dateVal ? `${dateLabel}: ${dateVal}` : '';

    document.getElementById(`${prefix}-rating`).innerHTML = buildStars(item.rating);
    document.getElementById(`${prefix}-genres`).innerHTML = buildGenreTags(item);
    document.getElementById(`${prefix}-credits`).innerHTML = buildCredits(item);
    document.getElementById(`${prefix}-overview`).textContent = item.overview || '';

    // Formats (movies/TV only)
    const formatsEl = document.getElementById(`${prefix}-formats`);
    if (formatsEl) {
      formatsEl.innerHTML = buildFormatBadges(item);
      formatsEl.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    }

    // Seasons (TV only)
    const seasonsEl = document.getElementById(`${prefix}-seasons`);
    if (seasonsEl) {
      seasonsEl.innerHTML = buildSeasons(item);
      seasonsEl.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    }

    // Copies (Games only)
    const copiesEl = document.getElementById(`${prefix}-copies`);
    if (copiesEl) {
      copiesEl.innerHTML = buildCopies(item);
    }

    document.getElementById(`${prefix}-tags`).innerHTML = buildTags(item);

    const posterImg = document.getElementById(`${prefix}-poster`);
    const src = posterUrl(item);
    posterImg.src = src || '';
    posterImg.alt = item.title;
    posterImg.style.display = src ? 'block' : 'none';

    if (prefix === 'fs') {
      const bg = document.getElementById('fs-bg');
      if (bg) bg.style.backgroundImage = src ? `url('${src}')` : 'none';
      const fullImg = document.getElementById('fs-poster-full');
      if (fullImg) { fullImg.src = src || ''; fullImg.alt = item.title; }
    }
  }

  function openModal(item) {
    const el = document.getElementById('detailModal');
    if (!el) return;
    populateDetail('detail', item);
    const modal = new bootstrap.Modal(el);
    modal.show();
    pushDetailState();

    el.addEventListener('hidden.bs.modal', function onHidden() {
      el.removeEventListener('hidden.bs.modal', onHidden);
      popDetailState();
    });
  }

  function openFullScreen(item) {
    const fs = document.getElementById('detail-fullscreen');
    if (!fs) return;
    populateDetail('fs', item);
    fs.classList.add('open');
    document.body.style.overflow = 'hidden';
    pushDetailState();
  }

  function closeFullScreen() {
    const fs = document.getElementById('detail-fullscreen');
    if (fs) fs.classList.remove('open');
    const overlay = document.getElementById('fs-poster-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    popDetailState();
  }

  // ---------- Poster hero: tap to expand / collapse ----------
  function bindPosterHero() {
    const hero = document.getElementById('fs-poster-hero');
    const overlay = document.getElementById('fs-poster-overlay');
    if (!hero || !overlay) return;

    hero.addEventListener('click', () => {
      overlay.classList.add('open');
    });

    overlay.addEventListener('click', () => {
      overlay.classList.remove('open');
    });
  }

  // ---------- History / back-button support ----------
  function pushDetailState() {
    if (!detailOpen) {
      detailOpen = true;
      history.pushState({ detailOpen: true }, '');
    }
  }

  function popDetailState() {
    if (detailOpen) {
      detailOpen = false;
      if (!closingViaBack) {
        history.back();
      }
    }
  }

  function bindHistoryNav() {
    // Hash-based routing for mode switching (e.g. #/featured, #/movies, #/shows, #/games)
    window.addEventListener('hashchange', () => {
      const hashMode = getModeFromHash();
      const modes = Array.isArray(config.modes) ? [...config.modes] : ['movies', 'tv', 'games'];
      if (config.featured) modes.unshift('featured');
      if (hashMode && modes.includes(hashMode) && hashMode !== currentMode) {
        switchMode(hashMode);
      }
    });

    window.addEventListener('popstate', () => {
      if (!detailOpen) return;

      closingViaBack = true;

      const modalEl = document.getElementById('detailModal');
      const modalInstance = modalEl && bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      const fs = document.getElementById('detail-fullscreen');
      if (fs && fs.classList.contains('open')) {
        fs.classList.remove('open');
        document.body.style.overflow = '';
      }
      const posterOverlay = document.getElementById('fs-poster-overlay');
      if (posterOverlay) posterOverlay.classList.remove('open');

      detailOpen = false;
      closingViaBack = false;
    });
  }

  // ---------- Liquid Glass UI (all screen sizes) ----------
  function initMobileUI() {
    const filterBar = document.getElementById('meFilterBar');
    const activeFilterPill = document.getElementById('activeFilterPill');
    const sortBubble = document.getElementById('sortBubble');
    const searchWrap = document.getElementById('meSearch');
    const searchCollapsedBtn = document.getElementById('meSearchCollapsed');
    const mobileSearchBox = document.getElementById('mobile-search-box');

    // ---- Sort Bubble: tap to expand, slider select, collapse ----
    if (sortBubble) {
      // Create slider indicator for sort bubble
      const sortIndicator = document.createElement('span');
      sortIndicator.className = 'slider-indicator';
      sortBubble.appendChild(sortIndicator);

      sortBubble.addEventListener('click', (e) => {
        const btn = e.target.closest('.me-sort-btn');
        if (!btn) return;

        if (!sortBubble.classList.contains('expanded')) {
          sortBubble.classList.add('expanded');
          e.stopPropagation();
          return;
        }

        const sortKey = btn.dataset.sort;
        if (sortKey !== currentSort) {
          currentSort = sortKey;
          sortBubble.querySelectorAll('.me-sort-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          positionSliderIndicator(sortBubble, '.me-sort-btn', true);
          renderGrid();
        }
      });

      // Auto-position slider after expand transitions
      let sortSliderDebounce;
      sortBubble.addEventListener('transitionend', () => {
        clearTimeout(sortSliderDebounce);
        sortSliderDebounce = setTimeout(() => {
          if (sortBubble.classList.contains('expanded')) {
            positionSliderIndicator(sortBubble, '.me-sort-btn', false);
          }
        }, 20);
      });

      document.addEventListener('click', (e) => {
        if (sortBubble.classList.contains('expanded') && !sortBubble.contains(e.target)) {
          // Don't collapse sort bubble when clicking mode toggle
          const modeToggle = document.getElementById('modeToggle');
          if (modeToggle && modeToggle.contains(e.target)) return;
          sortBubble.classList.remove('expanded');
        }
      });

      // Touch-slide support for sort bubble
      let sortTouchSliding = false;
      sortBubble.addEventListener('touchstart', () => {
        if (!sortBubble.classList.contains('expanded')) return;
        sortTouchSliding = true;
      }, { passive: true });

      sortBubble.addEventListener('touchmove', (e) => {
        if (!sortTouchSliding) return;
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const btn = el?.closest?.('.me-sort-btn');
        if (btn && sortBubble.contains(btn)) {
          const sortKey = btn.dataset.sort;
          if (sortKey !== currentSort) {
            currentSort = sortKey;
            sortBubble.querySelectorAll('.me-sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            positionSliderIndicator(sortBubble, '.me-sort-btn', true);
            renderGrid();
          }
        }
      }, { passive: true });

      sortBubble.addEventListener('touchend', () => {
        sortTouchSliding = false;
      }, { passive: true });
    }

    // ---- Start sort expanded, search collapsed on mobile, mode toggle expanded ----
    if (sortBubble && currentMode !== 'featured') {
      sortBubble.classList.add('expanded');
    }
    if (window.innerWidth < 768 && searchWrap) {
      searchWrap.classList.add('collapsed');
    }
    {
      const modeToggle = document.getElementById('modeToggle');
      if (modeToggle) modeToggle.classList.add('mode-expanded');
    }

    // ---- Search: expand / collapse ----
    let searchHasInput = false;

    function expandSearch() {
      if (!searchWrap) return;
      searchWrap.classList.remove('collapsed');
      if (window.innerWidth < 768) {
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) modeToggle.classList.remove('mode-expanded');
      }
    }

    function collapseSearch() {
      if (!searchWrap || searchHasInput) return;
      searchWrap.classList.add('collapsed');
      mobileSearchBox?.blur();
      if (window.innerWidth < 768 && window.scrollY <= 10) {
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) modeToggle.classList.add('mode-expanded');
      }
    }

    if (searchCollapsedBtn) {
      searchCollapsedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        expandSearch();
        setTimeout(() => mobileSearchBox?.focus(), 350);
      });
    }

    const searchSubmitBtn = document.querySelector('.me-search-submit');
    const searchSubmitIcon = searchSubmitBtn?.querySelector('i');

    function updateSearchIcon() {
      if (!searchSubmitBtn || !searchSubmitIcon) return;
      const hasText = mobileSearchBox && mobileSearchBox.value.trim().length > 0;
      if (hasText) {
        searchSubmitIcon.className = 'bi bi-x-lg';
        searchSubmitBtn.classList.add('clear-mode');
      } else {
        searchSubmitIcon.className = 'bi bi-search';
        searchSubmitBtn.classList.remove('clear-mode');
      }
    }

    if (searchSubmitBtn && mobileSearchBox) {
      searchSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileSearchBox.value.trim().length > 0) {
          mobileSearchBox.value = '';
          searchHasInput = false;
          searchQuery = '';
          const desktopInput = document.getElementById('search-box');
          if (desktopInput) desktopInput.value = '';
          updateSearchIcon();
          renderGrid();
          mobileSearchBox.focus();
        } else {
          if (window.innerWidth < 768) {
            searchWrap.classList.add('collapsed');
            mobileSearchBox?.blur();
            if (window.scrollY <= 10) {
              const modeToggle = document.getElementById('modeToggle');
              if (modeToggle) modeToggle.classList.add('mode-expanded');
            }
          } else {
            mobileSearchBox.focus();
          }
        }
      });
    }

    if (mobileSearchBox) {
      mobileSearchBox.addEventListener('input', () => {
        searchHasInput = mobileSearchBox.value.trim().length > 0;
        updateSearchIcon();
      });
      mobileSearchBox.addEventListener('blur', () => {
        if (!mobileSearchBox.value.trim()) {
          searchHasInput = false;
          const scrollY = window.scrollY;
          if (scrollY <= 10 && isScrolled) {
            isScrolled = false;
            if (filterBar) filterBar.classList.remove('hidden');
            if (activeFilterPill) activeFilterPill.classList.remove('visible');
            if (window.innerWidth >= 768) {
              expandSearch();
            }
          }
        }
      });
    }

    // ---- Scroll handler: filter bar, active pill, search ----
    let scrollTicking = false;
    let isScrolled = false;

    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTicking = false;
        const scrollY = window.scrollY;
        const searchFocused = document.activeElement === mobileSearchBox ||
                              document.activeElement === document.getElementById('search-box');

        if (scrollY > 40 && !isScrolled) {
          isScrolled = true;
          if (filterBar) filterBar.classList.add('hidden');
          if (activeFilterPill) activeFilterPill.classList.add('visible');
          if (!searchFocused) collapseSearch();
          if (sortBubble) sortBubble.classList.remove('expanded');
          const modeToggle = document.querySelector('.me-mode-toggle');
          if (modeToggle) modeToggle.classList.remove('mode-expanded');
        } else if (scrollY <= 10 && isScrolled) {
          if (searchFocused || searchHasInput) return;
          isScrolled = false;
          if (filterBar) filterBar.classList.remove('hidden');
          if (activeFilterPill) activeFilterPill.classList.remove('visible');
          if (sortBubble && currentMode !== 'featured') sortBubble.classList.add('expanded');
          if (window.innerWidth >= 768) {
            expandSearch();
          }
          const modeToggle = document.querySelector('.me-mode-toggle');
          if (modeToggle) modeToggle.classList.add('mode-expanded');
        } else if (isScrolled && !searchHasInput && !searchFocused) {
          collapseSearch();
        }
      });
    }, { passive: true });

    // ---- Resize: update slider indicator positions ----
    window.addEventListener('resize', () => {
      const modeToggle = document.getElementById('modeToggle');
      if (modeToggle) positionSliderIndicator(modeToggle, '.me-mode-btn', false);
      if (sortBubble && sortBubble.classList.contains('expanded')) {
        positionSliderIndicator(sortBubble, '.me-sort-btn', false);
      }
    });
  }

  return { init, closeFullScreen, resetAll, FORMAT_META, PLATFORM_META, STORE_META, CONDITIONS };
})();

document.addEventListener('DOMContentLoaded', App.init);
