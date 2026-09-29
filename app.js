'use strict';

/* ---------- storage ---------- */

const STORE_KEY = 'discernment:v1';

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return upgrade(JSON.parse(raw));
  } catch (e) { /* fall through to seed */ }
  return clone(SEED);
}

// Bring in starter content added since this device's data was created.
function upgrade(data) {
  for (let v = (data.version ?? 1) + 1; v <= SEED.version; v++) {
    const u = SEED_UPDATES[v];
    if (!u) continue;
    for (const id of u.values ?? []) {
      const seeded = SEED.values.find(x => x.id === id);
      if (seeded && !data.values.some(x => x.id === id)) data.values.unshift(clone(seeded));
    }
    for (const [path, items] of Object.entries(u.lists ?? {})) {
      const [a, b] = path.split('.');
      const list = data[a]?.[b];
      if (list) for (const it of items) if (!list.includes(it)) list.unshift(it);
    }
  }
  data.version = SEED.version;
  return data;
}

let state = load();
save();

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Could not save on this device'); }
}

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const view = $('#view');
const dialog = $('#dialog');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const PRIORITIES = [
  { id: 'absolute', name: 'Non-negotiable' },
  { id: 'essential', name: 'Essential' },
  { id: 'important', name: 'Important' },
  { id: 'preference', name: 'Preference' },
];
const PRIORITY_RANK = { absolute: 0, essential: 1, important: 2, preference: 3 };

const STATUSES = [
  { id: 'seen', name: 'Clearly seen' },
  { id: 'some', name: 'Some signs' },
  { id: 'unknown', name: 'Not yet known' },
  { id: 'concern', name: 'Concern' },
];

function categoryName(id) {
  return state.categories.find(c => c.id === id)?.name ?? 'Other';
}

/* ---------- routing ---------- */

const TITLES = { values: 'Values', roles: 'Roles', vision: 'Vision', reflect: 'Reflect', more: 'More' };
let valuesFilter = 'all';

function route() {
  const [tab, arg] = (location.hash.slice(1) || 'values').split('/');
  const current = TITLES[tab] ? tab : 'values';

  document.querySelectorAll('.tabs button').forEach(b => {
    if (b.dataset.tab === current) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  $('#page-title').textContent = TITLES[current];
  $('#page-verse').textContent = VERSES[current];

  if (current === 'values') renderValues();
  else if (current === 'roles') renderRoles();
  else if (current === 'vision') renderVision();
  else if (current === 'reflect') arg ? renderReflection(arg) : renderReflections();
  else renderMore();

  window.scrollTo(0, 0);
}

document.querySelectorAll('.tabs button').forEach(b => {
  b.addEventListener('click', () => { location.hash = b.dataset.tab; });
});
window.addEventListener('hashchange', route);

/* ---------- editable string lists ---------- */

// Renders an editable list bound to state[path[0]][path[1]].
function listEditor(title, path, hint) {
  const items = state[path[0]][path[1]];
  const key = path.join('.');
  return `
    <section class="card list-card">
      <h2>${esc(title)}</h2>
      ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
      <ul class="edit-list" data-list="${key}">
        ${items.map((it, i) => `
          <li>
            <textarea rows="1" data-i="${i}" aria-label="Item ${i + 1}">${esc(it)}</textarea>
            <button class="icon-btn" data-remove="${i}" aria-label="Remove">×</button>
          </li>`).join('')}
      </ul>
      <form class="add-row" data-add="${key}">
        <input type="text" placeholder="Add…" aria-label="Add to ${esc(title)}">
        <button class="btn small" type="submit">Add</button>
      </form>
    </section>`;
}

function autosize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function bindListEditors(rerender) {
  view.querySelectorAll('.edit-list').forEach(ul => {
    const [a, b] = ul.dataset.list.split('.');
    const items = state[a][b];
    ul.querySelectorAll('textarea').forEach(ta => {
      autosize(ta);
      ta.addEventListener('input', () => {
        items[+ta.dataset.i] = ta.value;
        autosize(ta);
        save();
      });
      ta.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ta.blur(); } });
    });
    ul.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        items.splice(+btn.dataset.remove, 1);
        save();
        rerender();
      });
    });
  });
  view.querySelectorAll('form[data-add]').forEach(form => {
    const [a, b] = form.dataset.add.split('.');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      const v = input.value.trim();
      if (!v) return;
      state[a][b].push(v);
      save();
      rerender();
      view.querySelector(`form[data-add="${form.dataset.add}"] input`)?.focus();
    });
  });
}

/* ---------- Values ---------- */

function renderValues() {
  const filtered = state.values.filter(v => valuesFilter === 'all' || v.priority === valuesFilter);
  const counts = Object.fromEntries(PRIORITIES.map(p => [p.id, state.values.filter(v => v.priority === p.id).length]));

  const groups = state.categories
    .map(c => ({ ...c, items: filtered.filter(v => v.category === c.id) }))
    .filter(g => g.items.length);
  const orphans = filtered.filter(v => !state.categories.some(c => c.id === v.category));
  if (orphans.length) groups.push({ id: '_other', name: 'Other', items: orphans });

  view.innerHTML = `
    <p class="intro">Who she is today: what I'm looking for now.</p>
    <div class="chips" role="group" aria-label="Filter by priority">
      <button class="chip" data-filter="all" aria-pressed="${valuesFilter === 'all'}">All <b>${state.values.length}</b></button>
      ${PRIORITIES.map(p => `
        <button class="chip" data-filter="${p.id}" aria-pressed="${valuesFilter === p.id}">${p.name} <b>${counts[p.id]}</b></button>`).join('')}
    </div>

    ${groups.map(g => `
      <section class="group">
        <h2 class="group-title">${esc(g.name)}</h2>
        ${g.items.sort((x, y) => PRIORITY_RANK[x.priority] - PRIORITY_RANK[y.priority]).map(valueCard).join('')}
      </section>`).join('') || '<p class="empty">Nothing here yet.</p>'}

    <button class="btn primary block" id="add-value">+ Add a value</button>
  `;

  view.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
    valuesFilter = b.dataset.filter;
    renderValues();
  }));
  view.querySelectorAll('[data-edit-value]').forEach(b => b.addEventListener('click', () => editValue(b.dataset.editValue)));
  $('#add-value').addEventListener('click', () => editValue(null));
}

function valueCard(v) {
  return `
    <article class="card value">
      <div class="value-head">
        <span class="badge ${v.priority}">${PRIORITIES.find(p => p.id === v.priority)?.name ?? ''}</span>
        <button class="link" data-edit-value="${v.id}">Edit</button>
      </div>
      <h3>${esc(v.title)}</h3>
      ${v.desc ? `<p>${esc(v.desc)}</p>` : ''}
      ${v.lookFor ? `
        <details>
          <summary>What to look for</summary>
          <p>${esc(v.lookFor)}</p>
        </details>` : ''}
    </article>`;
}

function editValue(id) {
  const existing = state.values.find(v => v.id === id);
  const v = existing ?? { title: '', desc: '', lookFor: '', category: state.categories[0]?.id, priority: 'important' };

  dialog.innerHTML = `
    <form method="dialog" class="sheet" id="value-form">
      <h2>${existing ? 'Edit value' : 'New value'}</h2>
      <label>Value
        <input name="title" required value="${esc(v.title)}" placeholder="e.g. A gentle and quiet spirit">
      </label>
      <div class="row">
        <label>Category
          <select name="category">
            ${state.categories.map(c => `<option value="${c.id}" ${c.id === v.category ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </label>
        <label>Priority
          <select name="priority">
            ${PRIORITIES.map(p => `<option value="${p.id}" ${p.id === v.priority ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </label>
      </div>
      <label>Why it matters
        <textarea name="desc" rows="3">${esc(v.desc)}</textarea>
      </label>
      <label>What to look for
        <textarea name="lookFor" rows="3" placeholder="Questions or signs that would help me discern this">${esc(v.lookFor)}</textarea>
      </label>
      <div class="actions">
        ${existing ? '<button type="button" class="btn danger" id="del">Delete</button>' : '<span></span>'}
        <div>
          <button type="button" class="btn" id="cancel">Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </div>
    </form>`;

  const form = $('#value-form', dialog);
  $('#cancel', dialog).addEventListener('click', () => dialog.close());
  $('#del', dialog)?.addEventListener('click', () => {
    if (!confirm('Delete this value?')) return;
    state.values = state.values.filter(x => x.id !== id);
    save();
    dialog.close();
    renderValues();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.title = data.title.trim();
    if (!data.title) return;
    if (existing) Object.assign(existing, data);
    else state.values.push({ id: uid('v'), ...data });
    save();
    dialog.close();
    renderValues();
  });
  dialog.showModal();
}

/* ---------- Roles ---------- */

function renderRoles() {
  view.innerHTML = `
    <p class="intro">What our home could look like in the future. Still working this out; keep refining it with prayer and wise counsel.</p>
    ${listEditor('Her', ['roles', 'her'])}
    ${listEditor('Me', ['roles', 'me'])}
    ${listEditor('Together', ['roles', 'together'])}
    ${listEditor('Open questions', ['roles', 'questions'], 'Things I\'m still figuring out practically.')}
  `;
  bindListEditors(renderRoles);
}

/* ---------- Vision ---------- */

function renderVision() {
  view.innerHTML = `
    ${listEditor('Our kids', ['vision', 'kids'], 'What I hope to raise up, Lord willing.')}
    ${listEditor('Family life', ['vision', 'family'])}
    ${listEditor('Families to learn from', ['vision', 'models'], 'Who has a healthy family and is also missionally oriented?')}
    ${listEditor('Who I\'m becoming', ['vision', 'me'], 'Pursuing these values starts with me.')}
    <section class="card quiet">
      <h2>Held loosely</h2>
      <p>All of this is Lord willing. God can change any of these plans at any point, and His plans are better than mine. Romance isn't the answer — Jesus is. Seek first His kingdom.</p>
    </section>
  `;
  bindListEditors(renderVision);
}

/* ---------- Reflect ---------- */

function summarize(r) {
  const counts = Object.fromEntries(STATUSES.map(s => [s.id, 0]));
  for (const v of state.values) {
    const s = r.marks?.[v.id]?.status;
    if (s) counts[s]++;
  }
  return counts;
}

function statusBar(r) {
  const c = summarize(r);
  const total = state.values.length || 1;
  const unmarked = total - STATUSES.reduce((n, s) => n + c[s.id], 0);
  return `
    <div class="bar" role="img" aria-label="${STATUSES.map(s => `${c[s.id]} ${s.name.toLowerCase()}`).join(', ')}">
      ${STATUSES.map(s => c[s.id] ? `<span class="seg ${s.id}" style="flex:${c[s.id]}"></span>` : '').join('')}
      ${unmarked ? `<span class="seg none" style="flex:${unmarked}"></span>` : ''}
    </div>
    <ul class="legend">
      ${STATUSES.map(s => `<li><i class="dot ${s.id}"></i>${c[s.id]} ${s.name.toLowerCase()}</li>`).join('')}
    </ul>`;
}

function renderReflections() {
  const list = [...state.reflections].sort((a, b) => b.updated.localeCompare(a.updated));
  view.innerHTML = `
    <p class="intro">A private journal for when someone comes into view. Observe fruit over time, pray, and invite wise counsel. This isn't a score; it's a way to see clearly.</p>
    ${list.map(r => `
      <a class="card reflection-link" href="#reflect/${r.id}">
        <div class="value-head">
          <h3>${esc(r.name)}</h3>
          <span class="muted">${fmtDate(r.updated)}</span>
        </div>
        ${statusBar(r)}
      </a>`).join('') || '<p class="empty">No reflections yet.</p>'}
    <button class="btn primary block" id="new-reflection">+ New reflection</button>
  `;
  $('#new-reflection').addEventListener('click', newReflection);
}

function newReflection() {
  dialog.innerHTML = `
    <form method="dialog" class="sheet" id="r-form">
      <h2>New reflection</h2>
      <label>Name or initials
        <input name="name" required autocomplete="off" placeholder="Only you will see this">
      </label>
      <div class="actions">
        <span></span>
        <div>
          <button type="button" class="btn" id="cancel">Cancel</button>
          <button type="submit" class="btn primary">Start</button>
        </div>
      </div>
    </form>`;
  $('#cancel', dialog).addEventListener('click', () => dialog.close());
  $('#r-form', dialog).addEventListener('submit', e => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const r = { id: uid('r'), name, created: now, updated: now, marks: {}, notes: '', prayer: '' };
    state.reflections.push(r);
    save();
    dialog.close();
    location.hash = 'reflect/' + r.id;
  });
  dialog.showModal();
}

function renderReflection(id) {
  const r = state.reflections.find(x => x.id === id);
  if (!r) { location.hash = 'reflect'; return; }
  r.marks ??= {};

  const values = [...state.values].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  const touch = () => { r.updated = new Date().toISOString(); save(); };

  view.innerHTML = `
    <a class="back" href="#reflect">‹ All reflections</a>
    <section class="card">
      <div class="value-head">
        <h2 class="r-name">${esc(r.name)}</h2>
        <span class="muted">Since ${fmtDate(r.created)}</span>
      </div>
      <div id="summary">${statusBar(r)}</div>
    </section>

    ${values.map(v => {
      const m = r.marks[v.id] ?? {};
      return `
      <article class="card mark" data-v="${v.id}">
        <div class="value-head">
          <span class="badge ${v.priority}">${PRIORITIES.find(p => p.id === v.priority)?.name ?? ''}</span>
          <span class="muted">${esc(categoryName(v.category))}</span>
        </div>
        <h3>${esc(v.title)}</h3>
        ${v.lookFor ? `<p class="hint">${esc(v.lookFor)}</p>` : ''}
        <div class="seg-control" role="radiogroup" aria-label="What I've observed">
          ${STATUSES.map(s => `
            <button role="radio" class="${s.id}" data-status="${s.id}" aria-checked="${m.status === s.id}">${s.name}</button>`).join('')}
        </div>
        <textarea rows="1" data-note placeholder="What I've observed…">${esc(m.note)}</textarea>
      </article>`;
    }).join('')}

    <section class="card">
      <h2>Overall notes</h2>
      <textarea rows="4" id="r-notes" placeholder="What stands out? What do trusted people in my life see?">${esc(r.notes)}</textarea>
    </section>
    <section class="card">
      <h2>Prayer</h2>
      <textarea rows="3" id="r-prayer" placeholder="Lord, give me wisdom and peace…">${esc(r.prayer)}</textarea>
    </section>

    <div class="row-actions">
      <button class="btn" id="rename">Rename</button>
      <button class="btn danger" id="delete">Delete reflection</button>
    </div>
  `;

  view.querySelectorAll('.mark').forEach(card => {
    const vid = card.dataset.v;
    card.querySelectorAll('[data-status]').forEach(btn => btn.addEventListener('click', () => {
      const m = (r.marks[vid] ??= {});
      m.status = m.status === btn.dataset.status ? undefined : btn.dataset.status;
      card.querySelectorAll('[data-status]').forEach(b => b.setAttribute('aria-checked', b.dataset.status === m.status));
      $('#summary').innerHTML = statusBar(r);
      touch();
    }));
    const ta = card.querySelector('[data-note]');
    autosize(ta);
    ta.addEventListener('input', () => {
      (r.marks[vid] ??= {}).note = ta.value;
      autosize(ta);
      touch();
    });
  });
  $('#r-notes').addEventListener('input', e => { r.notes = e.target.value; touch(); });
  $('#r-prayer').addEventListener('input', e => { r.prayer = e.target.value; touch(); });
  $('#rename').addEventListener('click', () => {
    const name = prompt('Name or initials', r.name)?.trim();
    if (!name) return;
    r.name = name;
    touch();
    renderReflection(id);
  });
  $('#delete').addEventListener('click', () => {
    if (!confirm(`Delete the reflection for ${r.name}? This can't be undone.`)) return;
    state.reflections = state.reflections.filter(x => x.id !== id);
    save();
    location.hash = 'reflect';
  });
}

/* ---------- More ---------- */

function renderMore() {
  view.innerHTML = `
    <section class="card">
      <h2>Your data</h2>
      <p>Everything stays on this device. Nothing is sent anywhere. Export a backup now and then, especially before switching phones.</p>
      <div class="row-actions">
        <button class="btn" id="export">Export backup</button>
        <label class="btn">Import backup<input type="file" id="import" accept="application/json" hidden></label>
      </div>
    </section>

    <section class="card">
      <h2>Categories</h2>
      <ul class="edit-list" id="cats">
        ${state.categories.map((c, i) => `
          <li>
            <textarea rows="1" data-i="${i}" aria-label="Category name">${esc(c.name)}</textarea>
            <button class="icon-btn" data-remove="${i}" aria-label="Remove">×</button>
          </li>`).join('')}
      </ul>
      <form class="add-row" id="add-cat">
        <input type="text" placeholder="New category…" aria-label="New category">
        <button class="btn small" type="submit">Add</button>
      </form>
    </section>

    <section class="card">
      <h2>Install</h2>
      <p>On iPhone: tap Share, then <b>Add to Home Screen</b>. On Android: open the browser menu and choose <b>Install app</b>. It works offline once installed.</p>
    </section>

    <section class="card">
      <h2>Start over</h2>
      <p>Restore the original starter list. Your reflections are kept unless you choose to erase everything.</p>
      <div class="row-actions">
        <button class="btn" id="reset">Restore starter content</button>
        <button class="btn danger" id="wipe">Erase everything</button>
      </div>
    </section>
  `;

  $('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `discernment-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $('#import').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.values) || !data.roles || !data.vision) throw new Error('bad file');
      if (!confirm('Replace everything on this device with this backup?')) return;
      state = upgrade({ ...clone(SEED), version: 1, ...data, reflections: data.reflections ?? [] });
      save();
      toast('Backup restored');
      renderMore();
    } catch (err) {
      toast('That file isn\'t a valid backup');
    }
  });

  const cats = $('#cats');
  cats.querySelectorAll('textarea').forEach(ta => {
    autosize(ta);
    ta.addEventListener('input', () => { state.categories[+ta.dataset.i].name = ta.value; save(); });
    ta.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ta.blur(); } });
  });
  cats.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
    const c = state.categories[+btn.dataset.remove];
    const used = state.values.filter(v => v.category === c.id).length;
    if (used && !confirm(`${used} value(s) use "${c.name}". They'll move to "Other". Remove anyway?`)) return;
    state.categories.splice(+btn.dataset.remove, 1);
    save();
    renderMore();
  }));
  $('#add-cat').addEventListener('submit', e => {
    e.preventDefault();
    const name = e.target.querySelector('input').value.trim();
    if (!name) return;
    state.categories.push({ id: uid('c'), name });
    save();
    renderMore();
  });

  $('#reset').addEventListener('click', () => {
    if (!confirm('Replace your values, roles, and vision with the starter content?')) return;
    state = { ...clone(SEED), reflections: state.reflections };
    save();
    toast('Starter content restored');
  });
  $('#wipe').addEventListener('click', () => {
    if (!confirm('Erase all values, roles, vision, and reflections on this device?')) return;
    state = clone(SEED);
    save();
    toast('Everything reset');
  });
}

/* ---------- boot ---------- */

dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

route();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
