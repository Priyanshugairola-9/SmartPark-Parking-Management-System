/**
 * user.js  SmartPark Public Page
 * Polls /api/status every 1s, renders layout image + spot pins + grid cards.
 * FIX: tracks currentLayoutUrl so image always updates on re-upload.
 */
'use strict';
const POLL_MS = 1000;
const $ = id => document.getElementById(id);

const sAvail        = $('s-avail');
const sOcc          = $('s-occ');
const sTotal        = $('s-total');
const availBar      = $('availBar');
const availPct      = $('availPct');
const refreshInfo   = $('refreshInfo');
const emptyState    = $('emptyState');
const mapContainer  = $('mapContainer');
const mapCanvas     = $('mapCanvas');
const mapImg        = $('mapImg');
const mapUpdate     = $('mapUpdate');
const spotSection   = $('spotSection');
const spotGrid      = $('spotGrid');
const spotCount     = $('spotCount');
const popupBackdrop = $('popupBackdrop');
const popupClose    = $('popupClose');
const popupIcon     = $('popupIcon');
const popupName     = $('popupName');
const popupBadge    = $('popupBadge');
const popupMeta     = $('popupMeta');
const toast         = $('toast');

// Track current layout URL so we detect changes
let currentLayoutUrl = null;

// ── Toast ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Popup ─────────────────────────────────────────────────
function openPopup(id, info) {
  popupIcon.textContent  = info.occupied ? '🚗' : '✅';
  popupName.textContent  = info.label;
  popupBadge.textContent = info.occupied ? 'Occupied' : 'Available';
  popupBadge.className   = `popup-badge ${info.occupied ? 'occ' : 'avail'}`;
  popupMeta.textContent  = `Spot ID: ${id}`;
  popupBackdrop.classList.add('open');
}
function closePopup() { popupBackdrop.classList.remove('open'); }
popupClose.addEventListener('click', closePopup);
popupBackdrop.addEventListener('click', e => { if (e.target === popupBackdrop) closePopup(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

// ── Render spot pins on the image ─────────────────────────
function renderPins(spots) {
  mapCanvas.querySelectorAll('.spot-pin').forEach(el => el.remove());
  Object.entries(spots).forEach(([id, info]) => {
    const pin = document.createElement('div');
    pin.className  = `spot-pin ${info.occupied ? 'occ' : 'avail'}`;
    pin.id         = `pin-${id}`;
    pin.style.left = `${info.x}%`;
    pin.style.top  = `${info.y}%`;
    pin.innerHTML  = `<div class="pin-body">${info.label}</div><span class="pin-tail"></span>`;
    pin.addEventListener('click', () => openPopup(id, info));
    mapCanvas.appendChild(pin);
  });
}

// ── Render spot grid ──────────────────────────────────────
function renderGrid(spots) {
  const ids = Object.keys(spots);
  spotCount.textContent = `${ids.length} spot${ids.length !== 1 ? 's' : ''}`;
  ids.forEach(id => {
    const info = spots[id];
    let card   = $(`sc-${id}`);
    if (!card) {
      card    = document.createElement('div');
      card.id = `sc-${id}`;
      card.addEventListener('click', () => openPopup(id, spots[id]));
      spotGrid.appendChild(card);
    }
    card.className = `spot-card ${info.occupied ? 'occ' : 'avail'}`;
    card.innerHTML = `
      <span class="sc-emoji">${info.occupied ? '🚗' : '✅'}</span>
      <span class="sc-name">${info.label}</span>
      <span class="sc-status">${info.occupied ? 'Occupied' : 'Available'}</span>
    `;
  });
  spotGrid.querySelectorAll('[id^="sc-"]').forEach(el => {
    if (!spots[el.id.replace('sc-', '')]) el.remove();
  });
}

// ── Main poll ─────────────────────────────────────────────
async function poll() {
  try {
    const res  = await fetch('/api/status');
    const data = await res.json();
    const { summary, spots, layout_image } = data;

    // Stats
    const total = summary.total, avail = summary.available, occ = summary.occupied;
    const pct   = total > 0 ? Math.round((avail / total) * 100) : 0;
    sAvail.textContent   = avail;
    sOcc.textContent     = occ;
    sTotal.textContent   = total;
    availBar.style.width = `${pct}%`;
    availPct.textContent = `${pct}% free`;

    const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
    refreshInfo.textContent = `Updated ${now}`;
    mapUpdate.textContent   = `Updated ${now}`;

    // Layout image — always update if URL changed
    if (!layout_image) {
      emptyState.style.display   = 'block';
      mapContainer.style.display = 'none';
      spotSection.style.display  = 'none';
      currentLayoutUrl = null;
      return;
    }

    // Show map container
    emptyState.style.display   = 'none';
    mapContainer.style.display = 'block';

    // Update image src only when URL actually changed (avoids flicker)
    if (layout_image !== currentLayoutUrl) {
      mapImg.src       = layout_image;
      currentLayoutUrl = layout_image;
    }

    // Render spots
    if (total > 0) {
      renderPins(spots);
      renderGrid(spots);
      spotSection.style.display = 'block';
    } else {
      mapCanvas.querySelectorAll('.spot-pin').forEach(el => el.remove());
      spotGrid.innerHTML        = '';
      spotSection.style.display = 'none';
    }

  } catch {
    mapUpdate.textContent = '⚠ Connection error — retrying…';
  }
}

poll();
setInterval(poll, POLL_MS);

// ═══════════════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════════════
(function() {
  const saved = localStorage.getItem('sp-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sp-theme', next);
    });
  }
})();

// ═══════════════════════════════════════════════════════════
//  ADMIN LOGIN MODAL
// ═══════════════════════════════════════════════════════════
const adminBtn          = $('adminBtn');
const adminModalBackdrop= $('adminModalBackdrop');
const adminModalClose   = $('adminModalClose');
const adminPwInput      = $('adminPwInput');
const adminEyeBtn       = $('adminEyeBtn');
const adminEyeIcon      = $('adminEyeIcon');
const adminModalError   = $('adminModalError');
const adminSubmitBtn    = $('adminSubmitBtn');
const adminSubmitText   = $('adminSubmitText');

// Open modal
adminBtn.addEventListener('click', () => {
  adminModalBackdrop.classList.add('open');
  adminModalError.textContent = '';
  adminPwInput.value = '';
  setTimeout(() => adminPwInput.focus(), 120);
});

// Close modal
function closeAdminModal() {
  adminModalBackdrop.classList.remove('open');
  adminPwInput.value = '';
  adminModalError.textContent = '';
  adminSubmitBtn.disabled = false;
  adminSubmitBtn.classList.remove('success');
  adminSubmitText.textContent = 'Go to Admin Panel';
}
adminModalClose.addEventListener('click', closeAdminModal);
adminModalBackdrop.addEventListener('click', e => {
  if (e.target === adminModalBackdrop) closeAdminModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdminModal();
});

// Show/hide password
adminEyeBtn.addEventListener('click', () => {
  const show = adminPwInput.type === 'password';
  adminPwInput.type = show ? 'text' : 'password';
  adminEyeIcon.innerHTML = show
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// Submit on Enter key
adminPwInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') adminSubmitBtn.click();
});

// Submit — verify password against server then redirect
adminSubmitBtn.addEventListener('click', async () => {
  const pw = adminPwInput.value.trim();
  if (!pw) {
    adminModalError.textContent = 'Please enter the password.';
    adminPwInput.classList.add('shake');
    setTimeout(() => adminPwInput.classList.remove('shake'), 500);
    return;
  }

  adminSubmitBtn.disabled = true;
  adminSubmitText.textContent = 'Verifying…';
  adminModalError.textContent = '';

  try {
    const res  = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();

    if (data.success) {
      // Show success state briefly then redirect
      adminSubmitBtn.classList.add('success');
      adminSubmitText.textContent = '✓ Access granted — redirecting…';
      setTimeout(() => { window.location.href = '/admin'; }, 800);
    } else {
      // Wrong password
      adminModalError.textContent = '✕  Incorrect password. Try again.';
      adminPwInput.value = '';
      adminPwInput.classList.add('shake');
      setTimeout(() => {
        adminPwInput.classList.remove('shake');
        adminPwInput.focus();
      }, 500);
      adminSubmitBtn.disabled = false;
      adminSubmitText.textContent = 'Go to Admin Panel';
    }
  } catch {
    adminModalError.textContent = '⚠ Could not reach server. Is it running?';
    adminSubmitBtn.disabled = false;
    adminSubmitText.textContent = 'Go to Admin Panel';
  }
});
