/* ── LinuxQuest — Scenario Detail Page ──────────────────────────────── */

/* ── Nav ─────────────────────────────────────────────────────────────── */
function initNav() {
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
  });
  mobileMenu.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── Fetch ───────────────────────────────────────────────────────────── */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function loadScenario(id, trackId) {
  if (trackId) {
    try { return await fetchJSON(`scenarios/tracks/${trackId}/${id}.json`); } catch (_) {}
  }
  return fetchJSON(`scenarios/standalone/${id}.json`);
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function diffClass(d) {
  const k = (d || 'beginner').toLowerCase();
  if (k === 'intermediate') return 'card-label-intermediate';
  if (k === 'advanced')     return 'card-label-advanced';
  return 'card-label-beginner';
}

/* ── Copy command ────────────────────────────────────────────────────── */
function copyCmd(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'COPIED';
    btn.classList.add('sp-copy-done');
    setTimeout(() => { btn.textContent = 'COPY'; btn.classList.remove('sp-copy-done'); }, 1600);
  }).catch(() => {
    btn.textContent = 'COPY FAILED';
    setTimeout(() => { btn.textContent = 'COPY'; }, 1600);
  });
}

/* ── Track progress bar ──────────────────────────────────────────────── */
function renderTrackProgress(scenarios, currentId) {
  const bar = document.getElementById('track-nav');
  bar.hidden = false;
  bar.innerHTML = '<div class="tp-bar">' +
    scenarios.map((id, i) => {
      const num  = String(i + 1).padStart(2, '0');
      const cur  = id === currentId;
      const done = !cur && localStorage.getItem(`completed:${id}`) === 'true';
      const cls  = cur ? 'tp-step tp-current' : done ? 'tp-step tp-done' : 'tp-step';
      return (i > 0 ? '<span class="tp-arrow">›</span>' : '') +
        `<span class="${cls}" title="${escHtml(id)}">${num}</span>`;
    }).join('') +
  '</div>';
}

/* ── Hints ───────────────────────────────────────────────────────────── */
function renderHints(hints) {
  const container = document.getElementById('sp-hints');
  if (!hints.length) {
    container.innerHTML = '<p class="sp-prose sp-muted">No hints for this scenario.</p>';
    return;
  }
  let revealed = 0;
  function paint() {
    container.innerHTML = '';
    for (let i = 0; i < revealed; i++) {
      const div = document.createElement('div');
      div.className = 'sp-hint-item';
      div.innerHTML =
        `<span class="sp-hint-num">HINT ${i + 1} OF ${hints.length}</span>` +
        `<p class="sp-hint-text">${escHtml(hints[i])}</p>`;
      container.appendChild(div);
    }
    if (revealed < hints.length) {
      const btn = document.createElement('button');
      btn.className = 'sp-hint-btn';
      btn.textContent = `REVEAL HINT ${revealed + 1} OF ${hints.length}`;
      btn.addEventListener('click', () => { revealed++; paint(); });
      container.appendChild(btn);
    } else {
      const done = document.createElement('p');
      done.className = 'sp-prose sp-muted';
      done.textContent = 'All hints revealed.';
      container.appendChild(done);
    }
  }
  paint();
}

/* ── Solution toggle ─────────────────────────────────────────────────── */
function initSolutionToggle() {
  const btn = document.getElementById('sp-solution-toggle');
  const pre = document.getElementById('sp-solution');
  btn.addEventListener('click', () => {
    const showing = !pre.hidden;
    pre.hidden = showing;
    btn.textContent = showing ? 'SHOW SOLUTION' : 'HIDE SOLUTION';
    btn.classList.toggle('sp-toggle-active', !showing);
  });
}

/* ── Mark complete ───────────────────────────────────────────────────── */
function updateCompleteBtn(id) {
  const btn  = document.getElementById('sp-complete-btn');
  const done = localStorage.getItem(`completed:${id}`) === 'true';
  btn.textContent = done ? '✓ COMPLETED' : 'MARK COMPLETE';
  btn.classList.toggle('sp-complete-done', done);
}

function initCompleteBtn(id, trackScenarios) {
  document.getElementById('sp-complete-btn').addEventListener('click', () => {
    const done = localStorage.getItem(`completed:${id}`) === 'true';
    if (done) { localStorage.removeItem(`completed:${id}`); }
    else      { localStorage.setItem(`completed:${id}`, 'true'); }
    updateCompleteBtn(id);
    if (trackScenarios) renderTrackProgress(trackScenarios, id);
  });
}


/* ── Render ──────────────────────────────────────────────────────────── */
function renderScenario(scenario, trackId, trackScenarios) {
  document.title = `LinuxQuest — ${scenario.title || scenario.id}`;

  /* Header */
  document.getElementById('sp-title').textContent =
    (scenario.title || scenario.id).toUpperCase();

  const tags = Array.isArray(scenario.tags) && scenario.tags.length
    ? `<div class="sp-meta-tags">${scenario.tags.map(t => `<span class="tag">${escHtml(t.toUpperCase())}</span>`).join('')}</div>`
    : '';
  document.getElementById('sp-meta').innerHTML =
    `<span class="card-label ${diffClass(scenario.difficulty)}">${(scenario.difficulty || 'beginner').toUpperCase()}</span>${tags}`;

  /* Setup */
  const setup = scenario.setup || {};
  if (setup.description) {
    document.getElementById('sp-setup-desc').textContent = setup.description;
  }
  if (Array.isArray(setup.commands) && setup.commands.length) {
    document.getElementById('sp-setup-cmds').innerHTML = setup.commands.map(cmd =>
      `<div class="sp-cmd">
        <code class="sp-cmd-code">${escHtml(cmd)}</code>
        <button class="sp-copy-btn" onclick="copyCmd(this, ${JSON.stringify(cmd)})">COPY</button>
      </div>`
    ).join('');
  }
  if (setup.note) {
    const el = document.getElementById('sp-setup-note');
    el.textContent = setup.note; el.hidden = false;
  }
  if (setup.verify) {
    const el = document.getElementById('sp-setup-verify');
    el.textContent = `Verify: ${setup.verify}`; el.hidden = false;
  }

  /* Problem */
  document.getElementById('sp-problem').textContent = scenario.problem || '';

  /* Hints */
  renderHints(scenario.hints || []);

  /* Commands */
  const cmds = scenario.commands || [];
  if (cmds.length) {
    document.getElementById('sp-commands').innerHTML =
      cmds.map(c => `<span class="tag">${escHtml(c)}</span>`).join('');
  } else {
    document.getElementById('sp-cmds-section').hidden = true;
  }

  /* Solution */
  document.getElementById('sp-solution').textContent = scenario.solution || '';

  /* Complete state */
  updateCompleteBtn(scenario.id);

  /* Track nav */
  if (trackId && trackScenarios) {
    renderTrackProgress(trackScenarios, scenario.id);

    const resetBtn = document.getElementById('sp-reset-btn');
    resetBtn.hidden = false;
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all progress for this track?')) {
        trackScenarios.forEach(id => localStorage.removeItem(`completed:${id}`));
        updateCompleteBtn(scenario.id);
        renderTrackProgress(trackScenarios, scenario.id);
      }
    });
  }

  document.getElementById('sp-body').hidden = false;
}

/* ── Bootstrap ───────────────────────────────────────────────────────── */
async function init() {
  initNav();
  initSolutionToggle();

  const params  = new URLSearchParams(location.search);
  const id      = params.get('id');
  const trackId = params.get('track');

  if (!id) {
    document.getElementById('sp-loading').hidden = true;
    const err = document.getElementById('sp-error');
    err.textContent = 'NO SCENARIO ID PROVIDED.';
    err.hidden = false;
    return;
  }

  try {
    let trackScenarios = null;
    if (trackId) {
      try {
        const index = await fetchJSON('scenarios/index.json');
        const track = (index.tracks || []).find(t => t.id === trackId);
        if (track) trackScenarios = track.scenarios || null;
      } catch (_) {}
    }

    const scenario = await loadScenario(id, trackId);
    document.getElementById('sp-loading').hidden = true;
    renderScenario(scenario, trackId, trackScenarios);
    initCompleteBtn(scenario.id, trackScenarios);

  } catch (err) {
    document.getElementById('sp-loading').hidden = true;
    document.getElementById('sp-error').hidden = false;
    console.error('[LinuxQuest]', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
