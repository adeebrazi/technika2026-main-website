// Client state
let appState = {
  limit: 1000,
  groups: [
    {
      id: 1,
      name: "Group Alpha",
      tag: "Alpha",
      link: "https://chat.whatsapp.com/JGuwj0BeaqXHtaOT8azHtc",
      count: 0,
      status: "OPEN",
      accent: "#00FF66"
    },
    {
      id: 2,
      name: "Group Beta",
      tag: "Beta",
      link: "https://chat.whatsapp.com/CjfVMQB3G8oA9IlKH3RTXm",
      count: 0,
      status: "LOCKED",
      accent: "#FFE600"
    },
    {
      id: 3,
      name: "Group Gamma",
      tag: "Gamma",
      link: "https://chat.whatsapp.com/invite-gamma-03",
      count: 0,
      status: "LOCKED",
      accent: "#00D8F6"
    },
    {
      id: 4,
      name: "Group Delta",
      tag: "Delta",
      link: "https://chat.whatsapp.com/invite-delta-04",
      count: 0,
      status: "LOCKED",
      accent: "#FF007F"
    }
  ],
  activeGroupId: 1,
  totalJoined: 0,
  totalCapacity: 4000,
  totalRemaining: 4000,
  allFull: false
};

let previousState = null;

// ==========================================
// DISABLE CONTEXT MENU & DEV SHORTCUTS
// ==========================================
const handleContextMenu = (e) => {
  e.preventDefault();
  return false;
};

document.addEventListener('contextmenu', handleContextMenu, { capture: true });
window.addEventListener('contextmenu', handleContextMenu, { capture: true });

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
    (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
    (e.ctrlKey && (e.key === 's' || e.key === 'S'))
  ) {
    e.preventDefault();
    return false;
  }
}, { capture: true });

// ==========================================
// 2-THEME ENGINE (Main Website Parity)
// ==========================================
function getSavedTheme() {
  const saved = localStorage.getItem('technika_theme');
  if (saved === 'main' || saved === 'light') return saved;
  const legacy = localStorage.getItem('theme');
  if (legacy === 'light') return 'light';
  return 'main';
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.remove('dark', 'theme-main', 'theme-light');

  if (theme === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.add('dark', 'theme-main');
  }

  // Rotate Theme Pointer Ring
  const ring = document.getElementById('themeRotaryRing');
  if (ring) {
    ring.style.transform = theme === 'main' ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  // Update Rotary Theme Icon
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'main' ? 'sparkles' : 'sun');
  }

  refreshIcons();
}

function handleThemeToggle() {
  const current = getSavedTheme();
  const next = current === 'main' ? 'light' : 'main';
  try {
    localStorage.setItem('technika_theme', next);
    localStorage.setItem('theme', next === 'main' ? 'dark' : 'light');
  } catch (err) {}
  applyTheme(next);
}

document.getElementById('toggleThemeBtn')?.addEventListener('click', handleThemeToggle);

window.addEventListener('storage', (e) => {
  if (e.key === 'technika_theme' || e.key === 'theme') {
    applyTheme(getSavedTheme());
  }
});

// Initialize Lucide icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Toast notification helper
function showToast(title, message, bg = 'bg-[var(--brut-lime)]', text = 'text-black') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `brut-toast ${bg} ${text} p-4 pointer-events-auto max-w-sm flex items-start gap-3 shadow-[5px_5px_0px_#000]`;
  toast.innerHTML = `
    <div class="mt-0.5 font-black text-lg">⚡</div>
    <div class="flex-1">
      <div class="font-display font-black text-sm uppercase">${title}</div>
      <div class="text-xs font-semibold mt-0.5">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Setup Real-time SSE Connection
function setupSSE() {
  if (!!window.EventSource) {
    try {
      const source = new EventSource('/api/whatsapp/events');
      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleStateUpdate(data);
        } catch (err) {}
      };
    } catch (e) {}
  }
  // Periodic state refresh
  setInterval(fetchState, 3000);
}

async function fetchState() {
  try {
    let res = await fetch('/api/whatsapp/status').catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('https://reg.technika2026.online/api/whatsapp/status').catch(() => null);
    }
    if (!res || !res.ok) {
      res = await fetch('/api/status').catch(() => null);
    }
    if (res && res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.groups)) {
          handleStateUpdate(data);
        }
      }
    }
  } catch (err) {}
}

// Handle State Updates & Detect Rollovers
function handleStateUpdate(newState) {
  if (previousState && previousState.activeGroupId !== newState.activeGroupId) {
    const prevId = previousState.activeGroupId;
    const nextId = newState.activeGroupId;

    if (prevId && nextId) {
      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      showToast(
        "⚡ AUTO-ROLLOVER TRIGGERED!",
        `Group #${prevId} reached 1,000 members and is FROZEN! Group #${nextId} is now OPEN for applications!`,
        'bg-[var(--brut-yellow)]'
      );
    } else if (newState.allFull) {
      showToast(
        "🏆 ALL 4 GROUPS ARE FULL!",
        "All 4,000 seats across all squads have reached maximum capacity!",
        'bg-[var(--brut-pink)]',
        'text-white'
      );
    }
  }

  previousState = JSON.parse(JSON.stringify(newState));
  appState = newState;
  renderUI();
}

// Render The 4 Distinct, Neo-Brutalist Group Cards
function renderUI() {
  const { limit, groups } = appState;
  const grid = document.getElementById('groupsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  groups.forEach((g) => {
    const card = document.createElement('div');
    const seatsAvailable = Math.max(0, limit - g.count);
    const pct = Math.min(100, Math.round((g.count / limit) * 100));
    const isOpen = g.status === 'OPEN';
    const isFrozen = g.status === 'FROZEN';
    const accent = g.accent || '#00FF66';
    const textOnAccent = '#000000';

    const watermarkOpacity = (g.id === 4) 
      ? 'opacity-[0.22] dark:opacity-[0.28]' 
      : (g.id === 1) 
        ? 'opacity-[0.14] dark:opacity-[0.18]' 
        : 'opacity-[0.12] dark:opacity-[0.15]';

    let badgeHtml = '';
    let actionBtnHtml = '';
    let queueNote = '';

    if (g.id === 2) queueNote = 'UNLOCKS AFTER ALPHA';
    else if (g.id === 3) queueNote = 'UNLOCKS AFTER BETA';
    else if (g.id === 4) queueNote = 'UNLOCKS AFTER GAMMA';

    if (isOpen) {
      badgeHtml = `
        <span class="inline-flex items-center gap-1.5 font-display font-black text-[11px] uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]" style="background-color: ${accent}; color: ${textOnAccent};">
          <span class="w-2 h-2 rounded-full bg-black animate-ping"></span>
          <span>ACTIVE NOW</span>
        </span>
      `;
      actionBtnHtml = `
        <button onclick="handleJoinGroup(${g.id})" class="brut-btn w-full py-3 px-3 font-display font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_#000]" style="background-color: ${accent}; color: ${textOnAccent};">
          <span>JOIN WHATSAPP GROUP</span>
          <i data-lucide="arrow-up-right" class="w-4 h-4" style="color: ${textOnAccent};"></i>
        </button>
        <button onclick="openQrModal(${g.id})" class="w-full mt-2 py-1.5 px-3 bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 font-display font-bold text-[11px] uppercase border border-black/30 dark:border-white/20 flex items-center justify-center gap-1.5 transition text-current">
          <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
          <span>SCAN ON MOBILE</span>
        </button>
      `;
    } else if (isFrozen) {
      badgeHtml = `
        <span class="inline-flex items-center gap-1 bg-red-600 text-white font-display font-black text-[11px] uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
          <i data-lucide="check-check" class="w-3.5 h-3.5 text-white"></i>
          <span>1,000 / 1,000 FILLED</span>
        </span>
      `;
      actionBtnHtml = `
        <div class="w-full py-3 px-3 bg-red-950/40 text-red-300 font-display font-bold text-xs uppercase border-2 border-red-600/60 flex items-center justify-center gap-1.5">
          <i data-lucide="shield-alert" class="w-4 h-4"></i>
          <span>GROUP FULL · FROZEN</span>
        </div>
      `;
    } else {
      badgeHtml = `
        <span class="badge-locked inline-flex items-center gap-1 font-display font-bold text-[11px] uppercase px-2 py-0.5 border-2">
          <i data-lucide="lock" class="w-3 h-3"></i>
          <span>STANDBY</span>
        </span>
      `;
      actionBtnHtml = `
        <div class="w-full py-2.5 px-3 btn-locked font-display font-bold text-xs uppercase border-2 flex items-center justify-center gap-1.5 select-none">
          <i data-lucide="clock" class="w-3.5 h-3.5 opacity-70"></i>
          <span>${queueNote}</span>
        </div>
        <div class="text-[10px] text-center font-semibold uppercase tracking-wider opacity-60 mt-2 select-none">
          Auto-opens at 1,000 members
        </div>
      `;
    }

    card.className = `group-card relative brut-border flex flex-col justify-between transition-all duration-200 overflow-hidden ${isOpen ? 'active-group shadow-[6px_6px_0px_#000]' : 'opacity-90 hover:opacity-100 hover:shadow-[6px_6px_0px_#000]'} hover:-translate-y-1`;
    card.innerHTML = `
      <div class="h-1.5 w-full" style="background-color: ${accent};"></div>

      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-3.5 border-b-2 card-header-border">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 flex items-center justify-center font-display font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000]" style="background-color: ${accent}; color: ${textOnAccent};">
                0${g.id}
              </span>
              <h3 class="card-group-title font-display font-black text-base uppercase tracking-tight m-0">
                ${g.name}
              </h3>
            </div>
            <div>
              ${badgeHtml}
            </div>
          </div>

          <div class="card-metric-box relative p-3.5 border-2 mb-3.5 overflow-hidden">
            <div class="absolute right-1 -bottom-3 font-display font-black text-7xl select-none pointer-events-none ${watermarkOpacity}" style="color: ${accent};">
              0${g.id}
            </div>

            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
              <span>QUOTA STATUS</span>
              <span>CAP: ${limit}</span>
            </div>

            <div class="font-display font-black text-4xl sm:text-5xl tabular-nums leading-none tracking-tight my-1 ${isOpen ? '' : 'opacity-85'}" style="color: ${accent};">
              ${seatsAvailable.toLocaleString()}
            </div>

            <div class="flex items-center justify-between mt-2 pt-2 border-t border-black/15 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider">
              <span class="card-metric-label">SEATS AVAILABLE</span>
              <span class="font-mono text-[10px] opacity-75">${g.count} JOINED</span>
            </div>
          </div>

          <div class="mb-2">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
              <span class="opacity-70">CAPACITY</span>
              <span class="font-mono font-bold" style="color: ${isOpen ? accent : 'inherit'}">${pct}%</span>
            </div>
            <div class="w-full h-2.5 card-progress-track border-2 overflow-hidden bg-black/30">
              <div 
                class="h-full transition-all duration-300 ${isOpen ? 'brutalist-striped' : ''}" 
                style="width: ${Math.max(pct, isOpen ? 2 : 0)}%; background-color: ${accent};"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t-2 card-footer-border">
          ${actionBtnHtml}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  refreshIcons();
}

// User Action: Join WhatsApp Group
async function handleJoinGroup(groupId) {
  const targetGroup = appState.groups.find(g => g.id === groupId);
  if (!targetGroup || targetGroup.status !== 'OPEN') {
    showToast("Group Unavailable", "This group is not currently accepting joins.", "bg-rose-200");
    return;
  }

  const hasClaimed = localStorage.getItem(`claimed_seat_group_${groupId}`);
  if (hasClaimed) {
    showToast("Already Registered", "Seat already secured! Opening your WhatsApp group directly ↗", "bg-[var(--brut-yellow)]");
    window.open(targetGroup.link, '_blank');
    return;
  }

  try {
    let res = await fetch('/api/whatsapp/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId })
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch('https://reg.technika2026.online/api/whatsapp/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      }).catch(() => null);
    }

    if (!res || !res.ok) {
      res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      }).catch(() => null);
    }

    if (res && res.ok) {
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(`claimed_seat_group_${groupId}`, 'true');
        const link = data.whatsappUrl || targetGroup.link;
        window.open(link, '_blank');
        if (data.state) handleStateUpdate(data.state);
      } else {
        showToast("Cannot Join", data.message, "bg-rose-200");
      }
    } else {
      window.open(targetGroup.link, '_blank');
    }
  } catch (err) {
    window.open(targetGroup.link, '_blank');
  }
}

// QR Code Modal handling
let currentModalGroup = null;

function openQrModal(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;
  currentModalGroup = group;

  document.getElementById('qrModalTitle').innerText = `${group.name} (${group.tag})`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(group.link)}`;
  document.getElementById('qrImage').src = qrUrl;

  const modal = document.getElementById('qrModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function copyCurrentLink() {
  if (currentModalGroup) {
    copyGroupLink(currentModalGroup.id);
  }
}

function copyGroupLink(groupId) {
  const group = appState.groups.find(g => g.id === groupId);
  if (!group) return;
  navigator.clipboard.writeText(group.link).then(() => {
    showToast("Link Copied!", `WhatsApp link for ${group.name} copied to clipboard.`, "bg-[var(--brut-lime)]");
  }).catch(() => {
    showToast("Error", "Unable to copy to clipboard.", "bg-rose-200");
  });
}

function toggleFooterText(key) {
  const moreText = document.getElementById(`${key}MoreText`);
  const btnText = document.getElementById(`${key}BtnText`);
  const btnArrow = document.getElementById(`${key}BtnArrow`);
  if (!moreText || !btnText || !btnArrow) return;

  const isHidden = moreText.classList.contains('hidden');
  if (isHidden) {
    moreText.classList.remove('hidden');
    btnText.innerText = 'READ LESS';
    btnArrow.innerText = '▲';
  } else {
    moreText.classList.add('hidden');
    btnText.innerText = 'READ MORE';
    btnArrow.innerText = '▼';
  }
}

// Boot up
window.addEventListener('DOMContentLoaded', () => {
  setupSSE();
  fetchState();
  applyTheme(getSavedTheme());
  refreshIcons();
});
