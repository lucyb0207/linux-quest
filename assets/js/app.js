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

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Scenario Card ───────────────────────────────────────────────────── */
function buildScenarioCard(scenario) {
  const done = localStorage.getItem(`completed:${scenario.id}`) === 'true';
  const diff = (scenario.difficulty || 'beginner').toUpperCase();
  const href = `scenario.html?id=${encodeURIComponent(scenario.id)}`;
  return `
    <a class="scenario-card animate" href="${href}">
      <div class="card-header">
        <div class="card-meta">
          <span class="card-label ${difficultyClass(scenario.difficulty)}">${diff}</span>
          ${done ? '<span class="card-done">✓ DONE</span>' : ''}
        </div>
        <span class="card-prompt" aria-hidden="true">&gt;_</span>
      </div>
      <h3 class="card-title">${(scenario.title || scenario.id).toUpperCase()}</h3>
      <p class="card-desc">${truncate(scenario.problem, 130)}</p>
      ${renderTags(scenario.tags)}
      <span class="card-cta">PRACTICE <span class="arrow">→</span></span>
    </a>
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

/* ── Track Block ─────────────────────────────────────────────────────── */
let _enrichedTracks = [];

function buildTrackBlock(track) {
  const scenarios = track.scenarioData || [];
  const total     = scenarios.length;
  const completed = scenarios.filter(s => localStorage.getItem(`completed:${s.id}`) === 'true').length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const env       = (track.environment || '').toUpperCase();

  /* Header CTA — links to next unlocked or first */
  const nextIdx  = scenarios.findIndex(s => localStorage.getItem(`completed:${s.id}`) !== 'true');
  const ctaId    = nextIdx >= 0 ? scenarios[nextIdx].id : (scenarios[0] || {}).id || '';
  const ctaHref  = ctaId ? `scenario.html?id=${encodeURIComponent(ctaId)}&track=${encodeURIComponent(track.id)}` : '#tracks';
  const ctaLabel = completed === 0 ? 'START TRACK' : completed === total ? '✓ COMPLETED — REVISIT' : 'CONTINUE';

  const cards = scenarios.map((s, i) => {
    const isDone    = localStorage.getItem(`completed:${s.id}`) === 'true';
    const prevDone  = i === 0 || localStorage.getItem(`completed:${scenarios[i - 1].id}`) === 'true';
    const isCurrent = !isDone && prevDone;
    const href      = `scenario.html?id=${encodeURIComponent(s.id)}&track=${encodeURIComponent(track.id)}`;
    const num       = String(i + 1).padStart(2, '0');
    const diff      = (s.difficulty || 'beginner').toUpperCase();
    const diffCls   = difficultyClass(s.difficulty);
    const title     = escHtml((s.title || s.id).toUpperCase());
    const desc      = escHtml(truncate(s.problem || '', 110));

    if (isDone) {
      return `
        <a class="tsc-card tsc-done animate" href="${href}">
          <div class="tsc-top">
            <span class="tsc-num">${num}</span>
            <span class="tsc-status tsc-status-done">&#10003; DONE</span>
          </div>
          <span class="card-label ${diffCls}">${diff}</span>
          <h4 class="tsc-title">${title}</h4>
          <p class="tsc-desc">${desc}</p>
          <span class="tsc-cta">REVISIT <span class="arrow">&#8594;</span></span>
        </a>`;
    }

    if (isCurrent) {
      return `
        <a class="tsc-card tsc-current animate" href="${href}">
          <div class="tsc-top">
            <span class="tsc-num">${num}</span>
            <span class="tsc-status tsc-status-current">&#9654; UP NEXT</span>
          </div>
          <span class="card-label ${diffCls}">${diff}</span>
          <h4 class="tsc-title">${title}</h4>
          <p class="tsc-desc">${desc}</p>
          <span class="tsc-cta">START <span class="arrow">&#8594;</span></span>
        </a>`;
    }

    return `
      <div class="tsc-card tsc-locked animate">
        <div class="tsc-top">
          <span class="tsc-num">${num}</span>
          <span class="tsc-status tsc-status-locked">&#128274; LOCKED</span>
        </div>
        <span class="card-label ${diffCls}">${diff}</span>
        <h4 class="tsc-title">${title}</h4>
        <p class="tsc-desc">${desc}</p>
        <button class="tsc-skip-btn"
          data-track-id="${escHtml(track.id)}"
          data-up-to="${i}">skip prerequisites</button>
      </div>`;
  }).join('');

  return `
    <div class="track-block animate">
      <div class="track-bar">
        <div class="track-bar-left">
          ${env ? `<span class="track-env-tag">${env} ENVIRONMENT</span>` : ''}
          <h3 class="track-bar-title">${escHtml((track.title || track.id).toUpperCase())}</h3>
          <p class="track-bar-desc">${escHtml(truncate(track.description || '', 160))}</p>
        </div>
        <div class="track-bar-right">
          <p class="track-bar-progress-label">${completed} / ${total} COMPLETED</p>
          <div class="track-bar-progress">
            <div class="track-bar-progress-fill" style="width:${pct}%"></div>
          </div>
          <a class="track-bar-cta" href="${ctaHref}">${ctaLabel} <span class="arrow">&#8594;</span></a>
        </div>
      </div>
      <div class="tsc-grid">
        ${cards}
      </div>
    </div>`;
}

/* ── Render Tracks ───────────────────────────────────────────────────── */
function paintTracks() {
  const grid = document.getElementById('tracks-grid');
  grid.innerHTML = _enrichedTracks.map(buildTrackBlock).join('');
  grid.querySelectorAll('.animate').forEach(el => scrollRevealObserver.observe(el));

  grid.querySelectorAll('.tsc-skip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.trackId;
      const upTo    = parseInt(btn.dataset.upTo, 10);
      const track   = _enrichedTracks.find(t => t.id === trackId);
      if (!track) return;
      track.scenarioData.slice(0, upTo).forEach(s => {
        localStorage.setItem(`completed:${s.id}`, 'true');
      });
      paintTracks();
    });
  });
}

async function renderTracks(tracks) {
  const grid = document.getElementById('tracks-grid');

  if (!Array.isArray(tracks) || tracks.length === 0) {
    grid.innerHTML = `<p class="state-msg">NO TRACKS YET — <a href="https://github.com/HassanAbdullahHere/linux-quest" target="_blank" rel="noopener" style="color:var(--green)">CONTRIBUTE ONE →</a></p>`;
    return;
  }

  _enrichedTracks = await Promise.all(tracks.map(async track => {
    const ids     = Array.isArray(track.scenarios) ? track.scenarios : [];
    const results = await Promise.allSettled(
      ids.map(id => fetchScenario(id, `tracks/${track.id}`))
    );
    const scenarioData = results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { id: ids[i], title: ids[i], difficulty: 'beginner', problem: '' }
    );
    return { ...track, scenarioData };
  }));

  paintTracks();
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
