/* ── LinuxQuest — Landing Page ──────────────────────────────────────── */

const SCENARIOS_INDEX = 'scenarios/index.json';

/* ── Stars Canvas ─────────────────────────────────────────────────────── */
function initStars() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const stars = [];
  let raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function populate() {
    stars.length = 0;
    const count = Math.floor((canvas.width * canvas.height) / 5000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.1 + 0.2,
        o:     Math.random() * 0.6 + 0.1,
        dir:   Math.random() > 0.5 ? 1 : -1,
        speed: Math.random() * 0.003 + 0.001
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.o += s.speed * s.dir;
      if (s.o >= 0.75 || s.o <= 0.05) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,240,250,${s.o.toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    populate();
  });

  resize();
  populate();
  draw();

  /* Pause when tab is hidden to save CPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }
  });
}

/* ── Scroll Reveal (IntersectionObserver) ─────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate').forEach(el => observer.observe(el));
}

/* Animate hero content immediately (it's above the fold) */
function revealHero() {
  document.querySelectorAll('.hero .animate').forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('visible'), delay + 200);
  });
}

/* ── Nav Scroll Effect ───────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 48);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
  });

  /* Close mobile menu on link click */
  mobileMenu.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── Animated Counter ─────────────────────────────────────────────────── */
function animateCount(el, target) {
  if (target === 0) { el.textContent = '0'; return; }
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function updateStats(scenarioCount, trackCount) {
  const scenarioEl = document.getElementById('stat-scenarios');
  const trackEl    = document.getElementById('stat-tracks');

  /* Trigger when stats bar enters viewport */
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCount(scenarioEl, scenarioCount);
      animateCount(trackEl, trackCount);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function truncate(text, max) {
  if (!text || text.length <= max) return text || '';
  return text.slice(0, max).trimEnd() + '…';
}

function difficultyClass(d) {
  const key = (d || 'beginner').toLowerCase();
  if (key === 'intermediate') return 'card-label-intermediate';
  if (key === 'advanced')     return 'card-label-advanced';
  return 'card-label-beginner';
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return `<div class="card-tags">${tags.map(t => `<span class="tag">${t.toUpperCase()}</span>`).join('')}</div>`;
}

/* ── Scenario Card ───────────────────────────────────────────────────── */
function buildScenarioCard(scenario) {
  const done = localStorage.getItem(`completed:${scenario.id}`) === 'true';
  const diff = (scenario.difficulty || 'beginner').toUpperCase();
  return `
    <article class="scenario-card animate" role="article">
      <div class="card-meta">
        <span class="card-label ${difficultyClass(scenario.difficulty)}">${diff}</span>
        ${done ? '<span class="card-done">✓ DONE</span>' : ''}
      </div>
      <h3 class="card-title">${(scenario.title || scenario.id).toUpperCase()}</h3>
      <p class="card-desc">${truncate(scenario.problem, 130)}</p>
      ${renderTags(scenario.tags)}
      <a href="scenario.html?id=${encodeURIComponent(scenario.id)}" class="btn-ghost-sm">PRACTICE →</a>
    </article>
  `;
}

/* ── Track Path ──────────────────────────────────────────────────────── */
function buildTrackPath(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  const visible = ids.slice(0, 5);
  const steps = visible.map((_id, i) =>
    `<span class="track-step">${String(i + 1).padStart(2, '0')}</span>` +
    (i < visible.length - 1 ? '<span class="track-step-arrow">›</span>' : '')
  ).join('');
  const more = ids.length > 5
    ? '<span class="track-step-arrow">›</span><span class="track-step">…</span>'
    : '';
  return `<div class="track-path">${steps}${more}</div>`;
}

/* ── Track Card ──────────────────────────────────────────────────────── */
function buildTrackCard(track) {
  const ids   = Array.isArray(track.scenarios) ? track.scenarios : [];
  const first = ids[0] || '';
  const href  = first
    ? `scenario.html?id=${encodeURIComponent(first)}&track=${encodeURIComponent(track.id)}`
    : '#tracks';
  const count = ids.length;
  const env   = (track.environment || '').toUpperCase();

  return `
    <article class="track-card animate" role="article">
      ${env ? `<span class="track-env">${env} ENVIRONMENT</span>` : ''}
      <h3 class="track-title">${(track.title || track.id).toUpperCase()}</h3>
      <p class="track-desc">${truncate(track.description, 150)}</p>
      ${buildTrackPath(ids)}
      <p class="track-count">${count} SCENARIO${count !== 1 ? 'S' : ''}</p>
      <a href="${href}" class="btn-ghost-sm">START TRACK →</a>
    </article>
  `;
}

/* ── Fetch Scenario JSON ─────────────────────────────────────────────── */
async function fetchScenario(id, folder) {
  const res = await fetch(`scenarios/${folder}/${id}.json`);
  if (!res.ok) throw new Error(`404: ${id}`);
  return res.json();
}

/* ── Render Standalone ───────────────────────────────────────────────── */
async function renderStandalone(ids) {
  const grid = document.getElementById('standalone-grid');

  if (!Array.isArray(ids) || ids.length === 0) {
    grid.innerHTML = `<p class="state-msg">NO SCENARIOS YET — <a href="https://github.com/HassanAbdullahHere/linux-quest" target="_blank" rel="noopener" style="color:var(--green)">CONTRIBUTE ONE →</a></p>`;
    return;
  }

  const results = await Promise.allSettled(
    ids.map(id => fetchScenario(id, 'standalone'))
  );

  const cards = results
    .filter(r => r.status === 'fulfilled')
    .map(r => buildScenarioCard(r.value))
    .join('');

  grid.innerHTML = cards || `<p class="state-msg">COULD NOT LOAD SCENARIOS.</p>`;

  /* Observe newly injected cards */
  grid.querySelectorAll('.animate').forEach(el => {
    scrollRevealObserver.observe(el);
  });
}

/* ── Render Tracks ───────────────────────────────────────────────────── */
function renderTracks(tracks) {
  const grid = document.getElementById('tracks-grid');

  if (!Array.isArray(tracks) || tracks.length === 0) {
    grid.innerHTML = `<p class="state-msg">NO TRACKS YET — <a href="https://github.com/HassanAbdullahHere/linux-quest" target="_blank" rel="noopener" style="color:var(--green)">CONTRIBUTE ONE →</a></p>`;
    return;
  }

  grid.innerHTML = tracks.map(buildTrackCard).join('');

  grid.querySelectorAll('.animate').forEach(el => {
    scrollRevealObserver.observe(el);
  });
}

/* ── Global Observer (used by render functions) ─────────────────────── */
let scrollRevealObserver;

function createObserver() {
  scrollRevealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollRevealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });
}

/* ── Bootstrap ───────────────────────────────────────────────────────── */
async function init() {
  createObserver();
  initStars();
  initNav();
  revealHero();
  initScrollReveal();

  try {
    const res = await fetch(SCENARIOS_INDEX);
    if (!res.ok) throw new Error('Could not load scenarios/index.json');
    const index = await res.json();

    const standalone = index.standalone || [];
    const tracks     = index.tracks     || [];

    updateStats(standalone.length, tracks.length);
    await renderStandalone(standalone);
    renderTracks(tracks);
  } catch (err) {
    document.getElementById('standalone-grid').innerHTML =
      `<p class="state-msg">FAILED TO LOAD — SERVE OVER HTTP, NOT FILE://</p>`;
    document.getElementById('tracks-grid').innerHTML =
      `<p class="state-msg">FAILED TO LOAD TRACKS.</p>`;
    console.error('[LinuxQuest]', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
