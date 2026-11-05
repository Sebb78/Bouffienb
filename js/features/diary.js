// Fonctionnalité "Journal" : saisie et suivi des repas du jour.
// Contrat d'une fonctionnalité : { id, title, icon, mount(el), render() }
import { getState, update } from '../store.js';
import { $, iso, num, esc, uid } from '../utils.js';

const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];
const MACROS = [['prot', 'Protéines', 'var(--prot)'], ['carb', 'Glucides', 'var(--carb)'], ['fat', 'Lipides', 'var(--fat)']];
let root, current = new Date();

const dayItems = () => getState().days[iso(current)] || [];

function dayLabel() {
  const rel = d => { const x = new Date(); x.setDate(x.getDate() + d); return iso(x); };
  const long = current.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const r = { [rel(0)]: "Aujourd'hui", [rel(-1)]: 'Hier', [rel(1)]: 'Demain' }[iso(current)];
  return r ? `${r}<small>${long}</small>` : long;
}

function recentFoods() {
  const seen = new Map(), days = getState().days;
  Object.keys(days).sort().reverse().forEach(d =>
    days[d].slice().reverse().forEach(i => { if (!seen.has(i.name.toLowerCase())) seen.set(i.name.toLowerCase(), i); }));
  return [...seen.values()].slice(0, 12);
}

function mount(el) {
  root = el;
  el.innerHTML = `
    <header class="top">
      <button class="icon" data-act="prev" aria-label="Jour précédent">‹</button>
      <h1 data-ref="title"></h1>
      <button class="icon" data-act="next" aria-label="Jour suivant">›</button>
    </header>
    <section class="card"><div class="ringrow">
      <div class="ring">
        <svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fg" cx="50" cy="50" r="42"/></svg>
        <div class="c"><b data-ref="left"></b><span data-ref="leftLabel"></span></div>
      </div>
      <div class="macros" data-ref="macros"></div>
    </div></section>
    <div data-ref="meals"></div>
    <button class="fab" data-act="add">+ Ajouter</button>
    <dialog data-ref="dlg"><div class="sheet">
      <h3>Ajouter un aliment</h3>
      <div class="chips" data-ref="recent"></div>
      <form class="f" method="dialog">
        <label>Nom<input name="name" required autocomplete="off" placeholder="Ex. Yaourt grec"></label>
        <div class="g2">
          <label>Repas<select name="meal">${MEALS.map(m => `<option>${m}</option>`).join('')}</select></label>
          <label>Calories (kcal)<input name="kcal" type="number" inputmode="decimal" min="0" step="any" required></label>
        </div>
        <div class="g3">
          <label>Protéines (g)<input name="prot" type="number" inputmode="decimal" min="0" step="any"></label>
          <label>Glucides (g)<input name="carb" type="number" inputmode="decimal" min="0" step="any"></label>
          <label>Lipides (g)<input name="fat" type="number" inputmode="decimal" min="0" step="any"></label>
        </div>
        <div class="row"><button type="button" class="btn" data-act="cancel">Annuler</button><button class="btn p">Enregistrer</button></div>
      </form>
    </div></dialog>`;

  const dlg = $('[data-ref=dlg]', el), form = $('form', dlg);
  const shift = n => { current.setDate(current.getDate() + n); render(); };

  el.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    const del = e.target.closest('[data-del]')?.dataset.del;
    const rec = e.target.closest('[data-r]')?.dataset.r;
    if (act === 'prev') shift(-1);
    if (act === 'next') shift(1);
    if (act === 'cancel') dlg.close();
    if (act === 'add') openAdd(dlg, form);
    if (del) update(s => {
      const k = iso(current);
      s.days[k] = (s.days[k] || []).filter(i => i.id !== del);
      if (!s.days[k].length) delete s.days[k];
    });
    if (rec !== undefined) {
      const f = recentFoods()[rec];
      Object.keys(f).filter(k => k in form.elements).forEach(k => form.elements[k].value = f[k]);
    }
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  form.addEventListener('submit', () => {
    const v = Object.fromEntries(new FormData(form));
    update(s => {
      const k = iso(current);
      (s.days[k] = s.days[k] || []).push({ id: uid(), name: v.name.trim(), meal: v.meal,
        kcal: num(v.kcal), prot: num(v.prot), carb: num(v.carb), fat: num(v.fat) });
    });
  });
}

function openAdd(dlg, form) {
  form.reset();
  const h = new Date().getHours();
  form.elements.meal.value = h < 10 ? MEALS[0] : h < 15 ? MEALS[1] : h < 18 ? MEALS[3] : MEALS[2];
  const r = recentFoods(), box = $('[data-ref=recent]', dlg);
  box.innerHTML = r.map((f, n) => `<button type="button" class="chip" data-r="${n}">${esc(f.name)}</button>`).join('');
  box.hidden = !r.length;
  dlg.showModal();
}

function render() {
  const items = dayItems(), g = getState().goals;
  const tot = items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, prot: a.prot + i.prot, carb: a.carb + i.carb, fat: a.fat + i.fat }),
    { kcal: 0, prot: 0, carb: 0, fat: 0 });
  const ref = n => $(`[data-ref=${n}]`, root);

  ref('title').innerHTML = dayLabel();

  const C = 2 * Math.PI * 42, ratio = g.kcal ? tot.kcal / g.kcal : 0, fg = $('.fg', root);
  fg.style.strokeDasharray = C;
  fg.style.strokeDashoffset = C * (1 - Math.min(ratio, 1));
  fg.classList.toggle('over', ratio > 1);
  const left = Math.round(g.kcal - tot.kcal);
  ref('left').textContent = Math.abs(left);
  ref('leftLabel').textContent = left >= 0 ? 'kcal restantes' : 'kcal en trop';

  ref('macros').innerHTML = MACROS.map(([k, label, color]) => `
    <div class="m"><div class="l"><span>${label}</span><span>${Math.round(tot[k])} / ${g[k]} g</span></div>
    <div class="bar"><i style="width:${g[k] ? Math.min(tot[k] / g[k] * 100, 100) : 0}%;background:${color}"></i></div></div>`).join('');

  ref('meals').innerHTML = MEALS.map(m => {
    const list = items.filter(i => i.meal === m);
    const rows = list.length ? list.map(i => `
      <div class="item"><div class="n"><b>${esc(i.name)}</b><small>P ${i.prot} · G ${i.carb} · L ${i.fat}</small></div>
      <span class="k">${Math.round(i.kcal)}</span>
      <button class="x" data-del="${i.id}" aria-label="Supprimer ${esc(i.name)}">✕</button></div>`).join('')
      : `<div class="empty">Rien d'ajouté.</div>`;
    return `<section class="meal"><h2>${m}<span>${Math.round(list.reduce((a, i) => a + i.kcal, 0))} kcal</span></h2><div class="list">${rows}</div></section>`;
  }).join('');
}

export default { id: 'diary', title: 'Journal', icon: '🍽', mount, render };
