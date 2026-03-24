/* ═══════════════════════════════════════════════════════
   GITMAP — Infinity Grade  |  app.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════
   APP URLS (Infinity4 suite)
══════════════════════════════════════ */
const APP_URLS = {
  gitmap:  'https://www-infinity4.github.io/Gitmap/',
  gitpub:  'https://www-infinity4.github.io/Gitpub/',
  gitpal:  'https://www-infinity4.github.io/Gitpal/',
  gp:      'https://www-infinity4.github.io/GP/',
};

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const MENU_CLOSE_MS = 280; // matches side-menu slide-out transition

const GRADES = [
  { id: 'platinum', label: 'Platinum', color: '#e8e8f0', minLikes: 100, noveltyBonus: 3 },
  { id: 'diamond',  label: 'Diamond',  color: '#a8f0ff', minLikes: 60,  noveltyBonus: 2 },
  { id: 'gold',     label: 'Gold',     color: '#ffd700', minLikes: 30,  noveltyBonus: 1 },
  { id: 'sapphire', label: 'Sapphire', color: '#4a90d9', minLikes: 15,  noveltyBonus: 0 },
  { id: 'silver',   label: 'Silver',   color: '#c0c0d0', minLikes: 8,   noveltyBonus: 0 },
  { id: 'topaz',    label: 'Topaz',    color: '#ffc56b', minLikes: 3,   noveltyBonus: 0 },
  { id: 'copper',   label: 'Copper',   color: '#cd7c3a', minLikes: 1,   noveltyBonus: 0 },
  { id: 'quartz',   label: 'Quartz',   color: '#f08080', minLikes: 0,   noveltyBonus: 0 },
];

const CATEGORY_ICONS = {
  scripts:   '📜',
  tools:     '🛠️',
  games:     '🎮',
  logic:     '🧠',
  workflows: '⚙️',
  strategy:  '♟️',
  design:    '🎨',
  ai:        '🤖',
  bots:      '🦾',
  os:        '💾',
  quantum:   '⚛️',
  algorithm: '🔢',
};

const CATEGORY_LABELS = {
  scripts:   'Scripts',
  tools:     'Tools',
  games:     'Games',
  logic:     'Logic',
  workflows: 'Workflows',
  strategy:  'Strategy',
  design:    'Design',
  ai:        'AI Uses',
  bots:      'Bots',
  os:        'OS',
  quantum:   'Quantum',
  algorithm: 'Algorithm',
};

/** Pre-seeded sample items to make the map feel populated on first load. */
const SEED_ITEMS = [
  { id: 's1', name: 'AI Code Review Bot', category: 'ai', description: 'Automated pull-request reviews using LLMs.', style: 'neon border pill', likes: 142, liked: false, x: 18, y: 22 },
  { id: 's2', name: 'Quantum Sorter', category: 'quantum', description: 'Sorting algorithm inspired by quantum superposition.', style: '', likes: 72, liked: false, x: 72, y: 38 },
  { id: 's3', name: 'Git Workflow Automator', category: 'workflows', description: 'One-click branch, PR and merge strategies.', style: 'gradient pill', likes: 38, liked: false, x: 42, y: 62 },
  { id: 's4', name: 'Pixel Design Kit', category: 'design', description: 'Retro-pixel UI component library.', style: 'pixel retro', likes: 20, liked: false, x: 85, y: 72 },
  { id: 's5', name: 'Pathfinding Visualiser', category: 'algorithm', description: 'A* and Dijkstra animated step-by-step.', style: '', likes: 9, liked: false, x: 28, y: 80 },
  { id: 's6', name: 'Strategy Sandbox', category: 'strategy', description: 'Turn-based game engine for browser.', style: '', likes: 4, liked: false, x: 60, y: 18 },
  { id: 's7', name: 'Logic Gate Simulator', category: 'logic', description: 'Build and test digital circuits.', style: '', likes: 1, liked: false, x: 52, y: 48 },
  { id: 's8', name: 'OS Utility Scripts', category: 'scripts', description: 'Bash & PowerShell productivity helpers.', style: '', likes: 0, liked: false, x: 10, y: 55 },
];

const STORAGE_KEY = 'gitmap_items_v2';
const AUTH_KEY    = 'infinity4_user';   // shared key across all infinity4 apps
const PREFS_KEY   = 'gitmap_prefs';

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let items = [];
let activeCategory = 'all';
let activeGrade    = 'all';
let sortBy = 'likes';
let searchQuery = '';

/* ══════════════════════════════════════
   ITEM FILTER HELPER
══════════════════════════════════════ */
/**
 * Returns items that match the current activeCategory, activeGrade and searchQuery filters.
 * Centralises the filter logic so renderMap and renderCards stay in sync.
 */
function getFilteredItems() {
  return items.filter(i => {
    if (activeCategory !== 'all' && i.category !== activeCategory) return false;
    if (activeGrade !== 'all' && computeGrade(i).id !== activeGrade) return false;
    if (searchQuery) {
      return i.name.toLowerCase().includes(searchQuery) ||
        (i.description || '').toLowerCase().includes(searchQuery) ||
        i.category.toLowerCase().includes(searchQuery);
    }
    return true;
  });
}


function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveItems() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

/* ══════════════════════════════════════
   PREFS
══════════════════════════════════════ */
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; }
}
function savePrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

/* ══════════════════════════════════════
   AUTH  (shared localStorage with Gitpub)
══════════════════════════════════════ */
function getUser() {
  try { return localStorage.getItem(AUTH_KEY) || null; } catch { return null; }
}
function setUser(name) {
  try { localStorage.setItem(AUTH_KEY, name); } catch {}
}
function clearUser() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
}

/* ══════════════════════════════════════
   GRADE ENGINE
══════════════════════════════════════ */
/**
 * Compute the Infinity Grade for an item.
 * Rules:
 *   - Base grade determined by like count threshold.
 *   - New/unique button style adds a grade tier bonus.
 */
function computeGrade(item) {
  const hasStyle = Boolean(item.style && item.style.trim());
  // A unique button/feature style grants +10 virtual likes, which is enough to
  // push a brand-new item (0 likes) past the Topaz threshold (≥3) and Silver
  // threshold (≥8) — effectively a ~2-tier boost for stylistic novelty.
  const bonus = hasStyle ? 1 : 0;
  const effectiveLikes = item.likes + bonus * 10;

  for (let i = 0; i < GRADES.length; i++) {
    if (effectiveLikes >= GRADES[i].minLikes) return GRADES[i];
  }
  return GRADES[GRADES.length - 1];
}

/* ══════════════════════════════════════
   MAP NODES
══════════════════════════════════════ */
function renderMap() {
  const container = document.getElementById('mapNodes');
  const emptyMsg   = document.getElementById('mapEmptyMsg');
  container.innerHTML = '';

  const visible = getFilteredItems();
  emptyMsg.style.display = visible.length ? 'none' : 'flex';

  visible.forEach(item => {
    const grade = computeGrade(item);
    const node = document.createElement('div');
    node.className = 'map-node';
    node.style.left = `${item.x}%`;
    node.style.top  = `${item.y}%`;
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', `${item.name} — ${grade.label} grade`);
    node.dataset.id = item.id;

    const bubble = document.createElement('div');
    bubble.className = 'map-node-bubble glow';
    bubble.style.borderColor = grade.color;
    bubble.style.color = grade.color;
    bubble.textContent = CATEGORY_ICONS[item.category] || '📦';

    const label = document.createElement('div');
    label.className = 'map-node-label';
    label.textContent = item.name;

    node.appendChild(bubble);
    node.appendChild(label);

    node.addEventListener('click', () => openDetailModal(item.id));
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openDetailModal(item.id); });

    container.appendChild(node);
  });
}

/* ══════════════════════════════════════
   ITEM CARDS
══════════════════════════════════════ */
function renderCards() {
  const grid = document.getElementById('itemsGrid');
  const countEl = document.getElementById('itemCount');
  grid.innerHTML = '';

  let visible = getFilteredItems();

  if (sortBy === 'likes') {
    visible.sort((a, b) => b.likes - a.likes);
  } else if (sortBy === 'grade') {
    visible.sort((a, b) => {
      const ai = GRADES.findIndex(g => g.id === computeGrade(a).id);
      const bi = GRADES.findIndex(g => g.id === computeGrade(b).id);
      return ai - bi;
    });
  } else {
    // newest = reverse insertion order; slice() avoids mutating the filtered array
    visible = visible.slice().reverse();
  }

  countEl.textContent = visible.length;

  visible.forEach(item => {
    const grade = computeGrade(item);
    const card = document.createElement('div');
    card.className = `item-card grade-${grade.id}`;
    card.style.setProperty('--grade-color', grade.color);
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-icon">${CATEGORY_ICONS[item.category] || '📦'}</span>
        <span class="grade-badge grade-${grade.id}">
          ${gradeIcon(grade.id)} ${grade.label}
        </span>
      </div>
      <div class="card-name">${escHtml(item.name)}</div>
      ${item.description ? `<div class="card-desc">${escHtml(item.description)}</div>` : ''}
      <div class="card-meta">
        <span class="cat-badge">${escHtml(CATEGORY_LABELS[item.category] || item.category)}</span>
        <button class="like-btn ${item.liked ? 'liked' : ''}" data-id="${item.id}" aria-label="${item.liked ? 'Unlike' : 'Like'} ${escHtml(item.name)} (${item.likes} likes)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
               fill="${item.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 21C12 21 3 14.5 3 8.5A5.5 5.5 0 0 1 12 5.8 5.5 5.5 0 0 1 21 8.5C21 14.5 12 21 12 21Z"/>
          </svg>
          ${item.likes}
        </button>
      </div>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.like-btn')) return; // handled below
      openDetailModal(item.id);
    });

    card.querySelector('.like-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleLike(item.id);
    });

    grid.appendChild(card);
  });
}

function gradeIcon(gradeId) {
  const icons = {
    platinum: '⬡', diamond: '💎', gold: '🥇',
    sapphire: '🔷', silver: '🥈', topaz: '🔶',
    copper: '🟠', quartz: '🔴',
  };
  return icons[gradeId] || '⬡';
}

/* ══════════════════════════════════════
   LIKE / UNLIKE
══════════════════════════════════════ */
function toggleLike(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  if (item.liked) {
    item.liked = false;
    item.likes = Math.max(0, item.likes - 1);
  } else {
    item.liked = true;
    item.likes += 1;
  }
  saveItems();
  renderCards();
  renderMap();
}

/* ══════════════════════════════════════
   SEARCH & SUGGESTIONS
══════════════════════════════════════ */
const searchInput       = document.getElementById('searchInput');
const suggestionsBox    = document.getElementById('searchSuggestions');
const addToMapBtn       = document.getElementById('addToMapBtn');

searchInput.addEventListener('input', handleSearchInput);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); triggerSearch(); }
  if (e.key === 'Escape') closeSuggestions();
});
document.getElementById('searchBtn').addEventListener('click', triggerSearch);

function handleSearchInput() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    if (searchQuery) {
      searchQuery = '';
      renderCards();
      renderMap();
    }
    closeSuggestions();
    return;
  }

  const matches = items.filter(i =>
    i.name.toLowerCase().includes(q) ||
    (i.description || '').toLowerCase().includes(q) ||
    i.category.toLowerCase().includes(q)
  ).slice(0, 6);

  if (!matches.length) { closeSuggestions(); return; }

  suggestionsBox.innerHTML = matches.map(item => {
    const grade = computeGrade(item);
    return `
      <div class="suggestion-item" role="option" tabindex="0" data-id="${item.id}">
        <span>${CATEGORY_ICONS[item.category] || '📦'}</span>
        <span>${escHtml(item.name)}</span>
        <span class="cat-badge">${escHtml(CATEGORY_LABELS[item.category] || item.category)}</span>
        <span class="grade-badge grade-${grade.id}" style="margin-left:auto">${grade.label}</span>
      </div>
    `;
  }).join('');

  suggestionsBox.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      openDetailModal(el.dataset.id);
      closeSuggestions();
      searchInput.value = '';
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        openDetailModal(el.dataset.id);
        closeSuggestions();
        searchInput.value = '';
      }
    });
  });

  suggestionsBox.classList.add('visible');
}

function triggerSearch() {
  closeSuggestions();
  const q = searchInput.value.trim();
  searchQuery = q.toLowerCase();
  renderCards();
  renderMap();
}

function closeSuggestions() {
  suggestionsBox.innerHTML = '';
  suggestionsBox.classList.remove('visible');
}

/* Click outside to close */
document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar-wrapper') && !e.target.closest('.search-suggestions')) {
    closeSuggestions();
  }
});

/* ══════════════════════════════════════
   ADD-TO-MAP BUTTON & MODAL
══════════════════════════════════════ */
addToMapBtn.addEventListener('click', () => openAddModal());

const addModal   = document.getElementById('addModal');
const addForm    = document.getElementById('addForm');
const modalCancel = document.getElementById('modalCancel');

function openAddModal(prefillName = '') {
  document.getElementById('modalName').value = prefillName || searchInput.value.trim();
  document.getElementById('modalDescription').value = '';
  document.getElementById('modalStyle').value = '';
  addModal.showModal();
}

modalCancel.addEventListener('click', () => addModal.close());

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('modalName').value.trim();
  const category = document.getElementById('modalCategory').value;
  const description = document.getElementById('modalDescription').value.trim();
  const style = document.getElementById('modalStyle').value.trim();

  if (!name) return;

  // Check duplicate
  const dupe = items.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (dupe) {
    addModal.close();
    showToast(`"${escHtml(name)}" is already on the map!`, 'warn');
    scrollToCard(dupe.id);
    return;
  }

  const id = `u${Date.now()}`;
  const x = randomBetween(5, 93);
  const y = randomBetween(5, 88);

  items.push({ id, name, category, description, style, likes: 0, liked: false, x, y });
  saveItems();
  addModal.close();
  searchInput.value = '';

  const grade = computeGrade(items[items.length - 1]);
  showToast(`🚀 "${escHtml(name)}" deployed to the map as ${grade.label}!`, 'success');

  renderAll();
  scrollToCard(id);
});

/* ══════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════ */
const detailModal = document.getElementById('detailModal');
document.getElementById('detailClose').addEventListener('click', () => detailModal.close());

function openDetailModal(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  const grade = computeGrade(item);
  const content = document.getElementById('detailContent');

  content.innerHTML = `
    <div class="detail-grade-bar" style="background: ${grade.color};"></div>
    <div class="detail-name">${escHtml(item.name)}</div>
    <div class="detail-meta">
      <span class="grade-badge grade-${grade.id}">${gradeIcon(grade.id)} ${grade.label}</span>
      <span class="cat-badge">${escHtml(CATEGORY_LABELS[item.category] || item.category)}</span>
      <span style="font-size:.85rem; color:var(--text-muted);">${CATEGORY_ICONS[item.category] || '📦'}</span>
    </div>
    ${item.description ? `<p class="detail-desc">${escHtml(item.description)}</p>` : ''}
    ${item.style ? `<p class="detail-style">✨ Style: <em>${escHtml(item.style)}</em></p>` : ''}
    <div class="detail-stats">
      <div class="stat-item">
        <span class="stat-label">Likes</span>
        <span class="stat-value" style="color:#ff6b6b;">${item.likes} ♥</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Grade</span>
        <span class="stat-value" style="color:${grade.color};">${grade.label}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Category</span>
        <span class="stat-value" style="font-size:.95rem;">${CATEGORY_LABELS[item.category] || item.category}</span>
      </div>
    </div>
    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <button class="like-btn ${item.liked ? 'liked' : ''}" id="detailLikeBtn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
             fill="${item.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M12 21C12 21 3 14.5 3 8.5A5.5 5.5 0 0 1 12 5.8 5.5 5.5 0 0 1 21 8.5C21 14.5 12 21 12 21Z"/>
        </svg>
        ${item.liked ? 'Unlike' : 'Like'} (${item.likes})
      </button>
      <span style="font-size:.8rem; color:var(--text-muted);">Likes help boost the grade!</span>
      ${item.id.startsWith('u') ? `
        <button class="btn-cancel" id="detailEditBtn" style="font-size:.85rem; padding:6px 14px; margin-left:auto;">✏️ Edit</button>
      ` : ''}
    </div>
  `;

  document.getElementById('detailLikeBtn').addEventListener('click', () => {
    toggleLike(id);
    openDetailModal(id); // refresh
  });

  const editBtn = document.getElementById('detailEditBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      detailModal.close();
      openEditModal(id);
    });
  }

  detailModal.showModal();
}

/* ══════════════════════════════════════
   CATEGORY CHIPS
══════════════════════════════════════ */
function buildCategoryChips() {
  const container = document.getElementById('categoryChips');
  container.innerHTML = `<span class="chip chip-all ${activeCategory === 'all' ? 'active' : ''}" data-cat="all" role="radio" aria-checked="${activeCategory === 'all'}" tabindex="0">All</span>`;

  Object.keys(CATEGORY_LABELS).forEach(cat => {
    if (!items.some(i => i.category === cat)) return;
    const chip = document.createElement('span');
    chip.className = `chip ${activeCategory === cat ? 'active' : ''}`;
    chip.dataset.cat = cat;
    chip.setAttribute('role', 'radio');
    chip.setAttribute('aria-checked', String(activeCategory === cat));
    chip.setAttribute('tabindex', '0');
    chip.textContent = `${CATEGORY_ICONS[cat] || ''} ${CATEGORY_LABELS[cat]}`;
    container.appendChild(chip);
  });

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.cat;
      container.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === activeCategory);
        c.setAttribute('aria-checked', String(c.dataset.cat === activeCategory));
      });
      renderCards();
      renderMap();
    });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') chip.click();
    });
  });
}

/* ══════════════════════════════════════
   SORT
══════════════════════════════════════ */
document.getElementById('sortSelect').addEventListener('change', e => {
  sortBy = e.target.value;
  renderCards();
});

/* ══════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════ */
const hamburgerBtn  = document.getElementById('hamburgerBtn');
const sideMenu      = document.getElementById('sideMenu');
const overlay       = document.getElementById('overlay');
const sideMenuClose = document.getElementById('sideMenuClose');

function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('visible');
  hamburgerBtn.classList.add('open');
  sideMenu.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  sideMenuClose.focus();
}
function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('visible');
  hamburgerBtn.classList.remove('open');
  sideMenu.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.focus();
}

hamburgerBtn.addEventListener('click', openMenu);
sideMenuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* Smooth-scroll links inside the hamburger menu */
document.querySelectorAll('.nav-scroll-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    closeMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), MENU_CLOSE_MS);
  });
});

/* Navbar top links — smooth scroll + active state */
document.querySelectorAll('.navbar-links .nav-link[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector('#' + link.dataset.section);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.navbar-links .nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* ══════════════════════════════════════
   USER SECTION (side menu)
══════════════════════════════════════ */
function buildUserSection() {
  const user      = getUser();
  const userEl    = document.getElementById('sideMenuUser');
  const loginLink = document.getElementById('menuLoginLink');

  if (user) {
    userEl.innerHTML = `
      <div class="user-badge">
        <span class="user-avatar">👤</span>
        <span class="user-name">${escHtml(user)}</span>
      </div>`;
    loginLink.textContent = '🚪 Logout';
    loginLink.onclick = e => {
      e.preventDefault();
      clearUser();
      buildUserSection();
      closeMenu();
      showToast('Logged out.', 'info');
    };
  } else {
    userEl.innerHTML = `<p class="side-menu-sign-in">Sign in via Gitpub to sync your activity.</p>`;
    loginLink.textContent = '🔑 Login / Sign up';
    loginLink.onclick = e => {
      e.preventDefault();
      document.getElementById('loginUsername').value = '';
      closeMenu();
      document.getElementById('loginModal').showModal();
    };
  }
}

/* ══════════════════════════════════════
   SETTINGS MODAL
══════════════════════════════════════ */
const settingsModal = document.getElementById('settingsModal');

document.getElementById('menuSettingsLink').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('settingsSort').value = sortBy;
  closeMenu();
  settingsModal.showModal();
});

document.getElementById('settingsClose').addEventListener('click', () => settingsModal.close());

document.getElementById('settingsSave').addEventListener('click', () => {
  sortBy = document.getElementById('settingsSort').value;
  document.getElementById('sortSelect').value = sortBy;
  savePrefs({ ...loadPrefs(), sortBy });
  settingsModal.close();
  renderCards();
  showToast('Settings saved! ✅', 'success');
});

document.getElementById('settingsClearBtn').addEventListener('click', () => {
  if (!confirm('Remove all items you added? The seed items will remain.')) return;
  items = items.filter(i => i.id.startsWith('s'));
  saveItems();
  renderAll();
  settingsModal.close();
  showToast('Your additions have been cleared.', 'info');
});

/* ══════════════════════════════════════
   LOGIN MODAL
══════════════════════════════════════ */
const loginModal = document.getElementById('loginModal');

document.getElementById('loginCancel').addEventListener('click', () => loginModal.close());

function doLogin() {
  const name = document.getElementById('loginUsername').value.trim();
  if (!name) { document.getElementById('loginUsername').focus(); return; }
  setUser(name);
  loginModal.close();
  buildUserSection();
  showToast(`Welcome, ${escHtml(name)}! 👋`, 'success');
}

document.getElementById('loginConfirmBtn').addEventListener('click', doLogin);

document.getElementById('loginUsername').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); doLogin(); }
});

document.getElementById('loginViaGitpubBtn').addEventListener('click', e => {
  e.preventDefault();
  loginModal.close();
  const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
  window.location.href = `${APP_URLS.gitpub}?returnUrl=${returnUrl}`;
});

/* ══════════════════════════════════════
   GRADE SHOWCASE
══════════════════════════════════════ */
function buildGradesShowcase() {
  const container = document.getElementById('gradesShowcase');
  if (!container) return;

  container.innerHTML = GRADES.map(g => {
    const gradeItems = items.filter(i => computeGrade(i).id === g.id);
    const topItem = gradeItems.slice().sort((a, b) => b.likes - a.likes)[0];
    const isActive = activeGrade === g.id;
    return `
      <div class="grade-tier-card grade-${g.id} ${isActive ? 'grade-tier-active' : ''}"
           data-grade="${g.id}" style="--grade-color:${g.color}"
           role="button" tabindex="0" aria-label="Filter by ${g.label} grade${isActive ? ' (active)' : ''}">
        <div class="grade-tier-header">
          <span class="grade-tier-icon">${gradeIcon(g.id)}</span>
          <span class="grade-tier-label">${g.label}</span>
          <span class="grade-tier-req">${g.minLikes > 0 ? `≥${g.minLikes} ♥` : 'New'}</span>
        </div>
        <div class="grade-tier-count">${gradeItems.length} item${gradeItems.length !== 1 ? 's' : ''}</div>
        ${topItem ? `
          <div class="grade-tier-top">
            <span>${CATEGORY_ICONS[topItem.category] || '📦'}</span>
            <span class="grade-tier-top-name">${escHtml(topItem.name)}</span>
          </div>` : `<div class="grade-tier-empty">No items yet</div>`}
      </div>`;
  }).join('');

  const hint = document.getElementById('gradeFilterHint');
  if (hint) hint.style.display = activeGrade !== 'all' ? 'inline' : 'none';

  container.querySelectorAll('.grade-tier-card').forEach(card => {
    const activate = () => {
      const gradeId = card.dataset.grade;
      activeGrade = activeGrade === gradeId ? 'all' : gradeId;
      buildGradesShowcase();
      renderCards();
      renderMap();
      if (activeGrade !== 'all') {
        document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
}

document.getElementById('clearGradeFilter')?.addEventListener('click', e => {
  e.preventDefault();
  activeGrade = 'all';
  buildGradesShowcase();
  renderCards();
  renderMap();
});

/* ══════════════════════════════════════
   EDIT / DELETE ITEM MODAL
══════════════════════════════════════ */
const editModal = document.getElementById('editModal');
const editForm  = document.getElementById('editForm');
let editingItemId = null;

document.getElementById('editCancel').addEventListener('click', () => editModal.close());

document.getElementById('editDeleteBtn').addEventListener('click', () => {
  if (!editingItemId) return;
  if (!confirm('Delete this item from the map?')) return;
  items = items.filter(i => i.id !== editingItemId);
  saveItems();
  editModal.close();
  detailModal.close();
  renderAll();
  showToast('Item deleted.', 'info');
});

editForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!editingItemId) return;
  const item = items.find(i => i.id === editingItemId);
  if (!item) return;
  const newName = document.getElementById('editName').value.trim();
  if (!newName) return;
  item.name        = newName;
  item.category    = document.getElementById('editCategory').value;
  item.description = document.getElementById('editDescription').value.trim();
  item.style       = document.getElementById('editStyle').value.trim();
  saveItems();
  editModal.close();
  renderAll();
  openDetailModal(editingItemId);
  showToast('Item updated! ✅', 'success');
});

function openEditModal(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingItemId = id;
  document.getElementById('editName').value        = item.name;
  document.getElementById('editCategory').value    = item.category;
  document.getElementById('editDescription').value = item.description || '';
  document.getElementById('editStyle').value       = item.style || '';
  editModal.showModal();
}


function buildGradeLegend() {
  const list = document.getElementById('gradeLegendList');
  list.innerHTML = GRADES.map(g => `
    <li>
      <span class="swatch" style="background:${g.color}; color:${g.color};"></span>
      <span>${g.label}</span>
      <span style="font-size:.78rem; color:var(--text-muted); margin-left:auto">
        ${g.minLikes > 0 ? `≥${g.minLikes} ♥` : 'New'}
      </span>
    </li>
  `).join('');
}

/* ══════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════ */
let toastContainer = null;

function showToast(message, type = 'info') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scrollToCard(id) {
  // Short timeout lets the DOM finish rendering the new card before scrolling.
  setTimeout(() => {
    const el = document.querySelector(`.item-card[data-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/* ══════════════════════════════════════
   RENDER ALL
══════════════════════════════════════ */
function renderAll() {
  buildCategoryChips();
  buildGradesShowcase();
  renderMap();
  renderCards();
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
(function init() {
  // Handle login return from Gitpub (?user=username)
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');
  if (userParam) {
    setUser(userParam);
    const url = new URL(window.location.href);
    url.searchParams.delete('user');
    history.replaceState({}, '', url.toString());
  }

  // Apply saved sort preference
  const prefs = loadPrefs();
  if (prefs.sortBy) {
    sortBy = prefs.sortBy;
    document.getElementById('sortSelect').value = sortBy;
  }

  const saved = loadItems();
  items = saved && saved.length ? saved : JSON.parse(JSON.stringify(SEED_ITEMS));

  buildGradeLegend();
  buildUserSection();
  renderAll();

  // Greet user after potential login
  if (userParam) {
    showToast(`Welcome, ${escHtml(userParam)}! 👋`, 'success');
  }
})();
