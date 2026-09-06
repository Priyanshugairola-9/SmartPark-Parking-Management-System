/**
 * admin.js  SmartPark Admin Dashboard
 *
 * FIXES applied:
 *  1. Layout image URL is now /uploads/<file> (no /static/ prefix) matching Flask routing
 *  2. syncEditorImage() called on: poll URL change, tab switch, upload, save
 *  3. Editor canvas has guaranteed min-height so it never collapses
 *  4. Saved server spots shown as coloured overlays on the editor map
 *  5. Mini-map (overview) and editor both use the same reliable URL
 */
'use strict';
const POLL_MS = 1500;
const $ = id => document.getElementById(id);

// ── Theme Toggle ──────────────────────────────────────────
(function() {
  const saved = localStorage.getItem('sp-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sp-theme', theme);
  }

  ['themeToggle', 'themeToggleMobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();

// ── DOM ───────────────────────────────────────────────────
const loginScreen     = $('loginScreen');
const dashboard       = $('dashboard');
const passwordInput   = $('passwordInput');
const eyeBtn          = $('eyeBtn');
const eyeIcon         = $('eyeIcon');
const loginBtn        = $('loginBtn');
const loginBtnText    = $('loginBtnText');
const loginError      = $('loginError');
const sidebar         = $('sidebar');
const burgerBtn       = $('burgerBtn');
const logoutBtn       = $('logoutBtn');
const logoutBtnMobile = $('logoutBtnMobile');
const navItems        = document.querySelectorAll('.nav-item');
const kpiTotal        = $('kpi-total');
const kpiAvail        = $('kpi-avail');
const kpiOcc          = $('kpi-occ');
const kpiPct          = $('kpi-pct');
const miniMapEmpty    = $('miniMapEmpty');
const miniMapCanvas   = $('miniMapCanvas');
const miniImg         = $('miniImg');
const spotTableBody   = $('spotTableBody');
const uploadZone      = $('uploadZone');
const uploadZoneInner = $('uploadZoneInner');
const imageInput      = $('imageInput');
const uploadPreview   = $('uploadPreview');
const previewImg      = $('previewImg');
const previewName     = $('previewName');
const changeImgBtn    = $('changeImgBtn');
const uploadBtn       = $('uploadBtn');
const deleteLayoutBtn = $('deleteLayoutBtn');
const noLayoutMsg     = $('noLayoutMsg');
const editorCanvas    = $('editorCanvas');
const editorImg       = $('editorImg');
const addModeBtn      = $('addModeBtn');
const undoLastBtn     = $('undoLastBtn');
const clearAllBtn     = $('clearAllBtn');
const saveSpotsBtn    = $('saveSpotsBtn');
const pendingCount    = $('pendingCount');
const sensorGrid      = $('sensorGrid');
const resetAllBtn     = $('resetAllBtn');
const toast           = $('toast');

// ── State ─────────────────────────────────────────────────
const S = {
  addMode: false,
  pending: {},       // id → {label,x,y}  unsaved
  server:  {},       // latest from /api/status
  layoutUrl: null,   // e.g. "/uploads/layout_xxx.jpg"
  counter: 0,
  timer: null,
};

// ══ TOAST ═════════════════════════════════════════════════
let toastTimer;
function toast_(msg, type='') {
  toast.textContent = msg;
  toast.style.borderColor = type==='err'?'#ef4444':type==='ok'?'#22c55e':'';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'), 3000);
}

// ══ AUTH ══════════════════════════════════════════════════
eyeBtn.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  eyeIcon.innerHTML = show
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

loginBtn.addEventListener('click', async () => {
  const pw = passwordInput.value.trim();
  if (!pw) { loginError.textContent = 'Enter the password.'; return; }
  loginBtnText.textContent = 'Signing in…'; loginBtn.disabled = true; loginError.textContent = '';
  try {
    const r = await fetch('/api/admin/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({password: pw})
    });
    const d = await r.json();
    if (d.success) {
      loginScreen.style.display = 'none';
      dashboard.style.display   = 'flex';
      startDash();
    } else {
      loginError.textContent = '✕ Wrong password. Try again.';
      passwordInput.value = ''; passwordInput.focus();
    }
  } catch { loginError.textContent = '⚠ Network error.'; }
  loginBtnText.textContent = 'Sign In'; loginBtn.disabled = false;
});

async function doLogout() {
  await fetch('/api/admin/logout', {method:'POST'});
  clearInterval(S.timer);
  loginScreen.style.display = 'flex';
  dashboard.style.display   = 'none';
  passwordInput.value = '';
}
logoutBtn.addEventListener('click', doLogout);
logoutBtnMobile.addEventListener('click', doLogout);

// ══ SIDEBAR / TABS ════════════════════════════════════════
burgerBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', e => {
  if (window.innerWidth < 768 && !sidebar.contains(e.target) && !burgerBtn.contains(e.target))
    sidebar.classList.remove('open');
});

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    $(`tab-${btn.dataset.tab}`).classList.add('active');
    sidebar.classList.remove('open');
    // Always re-sync the editor when the layout tab becomes visible
    if (btn.dataset.tab === 'layout') syncEditor();
  });
});

// ══ POLL ══════════════════════════════════════════════════
function startDash() { poll(); S.timer = setInterval(poll, POLL_MS); }

async function poll() {
  try {
    const r    = await fetch('/api/status');
    const data = await r.json();
    const { summary, spots, layout_image } = data;
    S.server = spots || {};

    // Detect layout URL change and re-sync editor + mini-map
    if (layout_image !== S.layoutUrl) {
      S.layoutUrl = layout_image;
      syncEditor();
      syncMiniMap(layout_image);
    }

    // KPIs
    const t = summary.total, a = summary.available, o = summary.occupied;
    const pct = t > 0 ? Math.round((o/t)*100) : 0;
    kpiTotal.textContent = t; kpiAvail.textContent = a;
    kpiOcc.textContent   = o; kpiPct.textContent   = `${pct}%`;

    // Mini-map markers
    if (layout_image) renderMiniMarkers(spots);

    // Table + sensor buttons (always refresh)
    renderTable(spots);
    renderSensors(spots);

    // Keep server-spot overlays current on the editor
    renderServerOverlays();

  } catch { /* network blip */ }
}

// ══ MINI-MAP ══════════════════════════════════════════════
function syncMiniMap(url) {
  if (url) {
    miniMapEmpty.style.display  = 'none';
    miniMapCanvas.style.display = 'block';
    miniImg.src = url;          // direct assignment — always works
  } else {
    miniMapEmpty.style.display  = 'block';
    miniMapCanvas.style.display = 'none';
    miniImg.src = '';
  }
}

function renderMiniMarkers(spots) {
  miniMapCanvas.querySelectorAll('.mini-marker').forEach(el => el.remove());
  Object.entries(spots).forEach(([, info]) => {
    const m = document.createElement('div');
    m.className  = 'mini-marker';
    m.style.left = `${info.x}%`;
    m.style.top  = `${info.y}%`;
    m.innerHTML  = `<div class="mini-pin ${info.occupied?'occ':'avail'}">${info.label}</div>`;
    miniMapCanvas.appendChild(m);
  });
}

// ══ EDITOR SYNC  — THE CORE FIX ═══════════════════════════
// Called whenever layout URL changes OR layout tab becomes visible.
function syncEditor() {
  if (!S.layoutUrl) {
    noLayoutMsg.style.display  = 'block';
    editorCanvas.style.display = 'none';
    return;
  }
  noLayoutMsg.style.display  = 'none';
  editorCanvas.style.display = 'block';

  // Set src — compare against absolute URL to avoid flicker
  const want = new URL(S.layoutUrl, location.origin).href;
  if (editorImg.src !== want) {
    editorImg.src = S.layoutUrl;
  }

  // Re-paint pending markers that lost DOM elements
  Object.entries(S.pending).forEach(([id, info]) => {
    if (!$(`em-${id}`)) addEditorPin(id, info.x, info.y, info.label);
  });

  renderServerOverlays();
}

// Saved server spots shown as coloured read-only overlays on the editor
function renderServerOverlays() {
  if (!S.layoutUrl) return;
  editorCanvas.querySelectorAll('.es-marker').forEach(el => el.remove());
  Object.entries(S.server).forEach(([id, info]) => {
    if (S.pending[id]) return;   // skip if being re-edited
    const m = document.createElement('div');
    m.className  = 'es-marker';
    m.style.left = `${info.x}%`;
    m.style.top  = `${info.y}%`;
    m.innerHTML  = `
      <div class="es-pin ${info.occupied?'es-occ':'es-avail'}">${info.label}</div>
      <span class="es-tail ${info.occupied?'es-occ-tail':'es-avail-tail'}"></span>`;
    editorCanvas.appendChild(m);
  });
}

// ══ TABLE ═════════════════════════════════════════════════
function renderTable(spots) {
  const ids = Object.keys(spots);
  if (!ids.length) {
    spotTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">No spots defined</td></tr>`;
    return;
  }
  spotTableBody.innerHTML = ids.map(id => {
    const s = spots[id];
    const badge = s.occupied
      ? `<span class="badge-occ">🔴 Occupied</span>`
      : `<span class="badge-avail">🟢 Available</span>`;
    return `<tr>
      <td><code style="font-size:.7rem;color:#64748b">${id}</code></td>
      <td><strong>${s.label}</strong></td>
      <td style="font-family:var(--font-m);font-size:.7rem;color:#64748b">${Math.round(s.x)}%, ${Math.round(s.y)}%</td>
      <td>${badge}</td></tr>`;
  }).join('');
}

// ══ UPLOAD ════════════════════════════════════════════════
uploadZoneInner.addEventListener('click', () => imageInput.click());
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0]; if (f) handleFile(f);
});
imageInput.addEventListener('change', () => { if (imageInput.files[0]) handleFile(imageInput.files[0]); });
changeImgBtn.addEventListener('click', () => imageInput.click());

function handleFile(f) {
  if (!f.type.match(/image\/(png|jpeg|webp)/)) { toast_('PNG / JPG / WebP only', 'err'); return; }
  previewName.textContent     = f.name;
  previewImg.src              = URL.createObjectURL(f);
  uploadZone.style.display    = 'none';
  uploadPreview.style.display = 'flex';
  uploadBtn.disabled          = false;
}

uploadBtn.addEventListener('click', async () => {
  const f = imageInput.files[0]; if (!f) return;
  uploadBtn.innerHTML = '⏳ Uploading…'; uploadBtn.disabled = true;
  const fd = new FormData(); fd.append('image', f);
  try {
    const r = await fetch('/api/admin/upload-layout', {method:'POST', body:fd});
    const d = await r.json();
    if (d.success) {
      toast_('✅ Layout uploaded!', 'ok');
      uploadBtn.innerHTML = '✓ Uploaded';
      editorCanvas.querySelectorAll('.e-marker,.es-marker').forEach(el=>el.remove());
      S.pending = {}; S.counter = 0; updateCount();
      S.layoutUrl = d.url;      // ← set immediately so syncEditor works at once
      syncEditor();
      syncMiniMap(d.url);
      await poll();
    } else {
      toast_('Upload failed: '+d.error, 'err');
      uploadBtn.innerHTML = '↑ Upload Layout'; uploadBtn.disabled = false;
    }
  } catch {
    toast_('Network error', 'err');
    uploadBtn.innerHTML = '↑ Upload Layout'; uploadBtn.disabled = false;
  }
});

deleteLayoutBtn.addEventListener('click', async () => {
  if (!confirm('Delete layout and all spots?')) return;
  await fetch('/api/admin/delete-layout', {method:'POST'});
  editorCanvas.querySelectorAll('.e-marker,.es-marker').forEach(el=>el.remove());
  S.pending = {}; S.counter = 0; S.layoutUrl = null; updateCount();
  uploadZone.style.display    = 'block';
  uploadPreview.style.display = 'none';
  uploadBtn.disabled = true; uploadBtn.innerHTML = '↑ Upload Layout';
  editorImg.src = ''; noLayoutMsg.style.display = 'block'; editorCanvas.style.display = 'none';
  syncMiniMap(null); toast_('Layout deleted', 'ok'); await poll();
});

// ══ SPOT PLACEMENT ════════════════════════════════════════
addModeBtn.addEventListener('click', () => {
  S.addMode = !S.addMode;
  addModeBtn.classList.toggle('active', S.addMode);
  addModeBtn.innerHTML = S.addMode
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Adding… (click map)`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Mode`;
  editorCanvas.classList.toggle('add-mode', S.addMode);
});

editorCanvas.addEventListener('click', e => {
  if (!S.addMode || e.target.closest('.e-marker') || e.target.closest('.es-marker')) return;
  const rect = editorCanvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width)  * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  S.counter++;
  const id = `spot_${Date.now()}`, lbl = `S${S.counter}`;
  S.pending[id] = {label:lbl, x, y};
  addEditorPin(id, x, y, lbl); updateCount();
  toast_(`Spot ${lbl} placed`);
});

function addEditorPin(id, x, y, label) {
  const old = $(`em-${id}`); if (old) old.remove();
  const m = document.createElement('div');
  m.className = 'e-marker'; m.id = `em-${id}`;
  m.style.left = `${x}%`; m.style.top = `${y}%`;
  m.innerHTML = `
    <div class="e-pin">${label}</div>
    <span class="e-tail"></span>
    <input class="e-label-input" type="text" value="${label}" maxlength="5"/>
    <button class="e-del">✕</button>`;
  m.querySelector('.e-label-input').addEventListener('click', e => e.stopPropagation());
  m.querySelector('.e-label-input').addEventListener('input', ev => {
    m.querySelector('.e-pin').textContent = ev.target.value;
    if (S.pending[id]) S.pending[id].label = ev.target.value;
  });
  m.querySelector('.e-del').addEventListener('click', e => {
    e.stopPropagation(); m.remove(); delete S.pending[id]; updateCount(); toast_('Spot removed');
  });
  editorCanvas.appendChild(m);
}

undoLastBtn.addEventListener('click', () => {
  const ids = Object.keys(S.pending);
  if (!ids.length) { toast_('Nothing to undo'); return; }
  const last = ids[ids.length-1];
  const el = $(`em-${last}`); if (el) el.remove();
  delete S.pending[last]; updateCount(); toast_('Undone');
});

clearAllBtn.addEventListener('click', async () => {
  if (!confirm('Clear all spots?')) return;
  await fetch('/api/admin/clear-spots', {method:'POST'});
  editorCanvas.querySelectorAll('.e-marker,.es-marker').forEach(el=>el.remove());
  S.pending = {}; S.counter = 0; updateCount();
  toast_('All cleared', 'ok'); await poll();
});

saveSpotsBtn.addEventListener('click', async () => {
  const pend = Object.keys(S.pending);
  if (!pend.length) { toast_('No new spots to save', 'err'); return; }
  const merged = {};
  Object.entries(S.server).forEach(([id, info]) => { if (!S.pending[id]) merged[id] = info; });
  Object.assign(merged, S.pending);
  saveSpotsBtn.innerHTML = '⏳ Saving…';
  try {
    const r = await fetch('/api/admin/spots', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({spots: merged})
    });
    const d = await r.json();
    if (d.success) {
      toast_(`✅ ${pend.length} spot(s) saved!`, 'ok');
      editorCanvas.querySelectorAll('.e-marker').forEach(el=>el.remove());
      S.pending = {}; S.counter = 0; updateCount();
      await poll(); syncEditor();
    } else { toast_('Save failed','err'); }
  } catch { toast_('Network error','err'); }
  saveSpotsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save All Spots`;
});

function updateCount() {
  const n = Object.keys(S.pending).length;
  pendingCount.textContent = n === 0
    ? 'No pending spots — all saved'
    : `${n} unsaved spot${n!==1?'s':''} — click Save All Spots`;
}

// ══ SENSORS ═══════════════════════════════════════════════
function renderSensors(spots) {
  const ids = Object.keys(spots);
  if (!ids.length) {
    sensorGrid.innerHTML = `<div class="sensor-empty">No spots yet — use <strong>Layout & Spots</strong> tab first.</div>`;
    return;
  }
  sensorGrid.querySelectorAll('.sensor-btn').forEach(el => {
    if (!spots[el.id.replace('ssbtn-','')]) el.remove();
  });
  ids.forEach(id => {
    const info = spots[id];
    let btn = $(`ssbtn-${id}`);
    if (!btn) {
      btn = document.createElement('div');
      btn.id = `ssbtn-${id}`;
      btn.addEventListener('click', () => doToggle(id));
      sensorGrid.appendChild(btn);
    }
    btn.className = `sensor-btn${info.occupied?' is-occ':''}`;
    btn.innerHTML = `
      <span class="sensor-btn-icon">${info.occupied?'🚗':'🅿️'}</span>
      <span class="sensor-btn-label">${info.label}</span>
      <span class="sensor-btn-status">${info.occupied?'Occupied':'Available'}</span>`;
  });
}

async function doToggle(id) {
  await fetch(`/api/admin/toggle/${id}`, {method:'POST'});
  await poll(); syncEditor();
  toast_(`Toggled ${S.server[id]?.label||id}`);
}

resetAllBtn.addEventListener('click', async () => {
  await fetch('/api/admin/reset', {method:'POST'});
  toast_('All reset to available','ok'); await poll(); syncEditor();
});

// ══ BOOT ══════════════════════════════════════════════════
(async function init() {
  try {
    const r = await fetch('/api/admin/check');
    const d = await r.json();
    if (d.logged_in) {
      loginScreen.style.display = 'none';
      dashboard.style.display   = 'flex';
      startDash();
    }
  } catch {}
})();
