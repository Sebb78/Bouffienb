// Fonctionnalité "Réglages" : objectifs quotidiens, export et import des données.
import { getState, update, replaceAll } from '../store.js';
import { $, iso, num } from '../utils.js';

let root;

function mount(el) {
  root = el;
  el.innerHTML = `
    <header class="top"><h1>Réglages</h1></header>
    <section class="card">
      <form class="f" data-ref="goals">
        <strong>Objectifs quotidiens</strong>
        <label>Calories (kcal)<input name="kcal" type="number" inputmode="decimal" min="0" required></label>
        <div class="g3">
          <label>Protéines (g)<input name="prot" type="number" inputmode="decimal" min="0" required></label>
          <label>Glucides (g)<input name="carb" type="number" inputmode="decimal" min="0" required></label>
          <label>Lipides (g)<input name="fat" type="number" inputmode="decimal" min="0" required></label>
        </div>
        <button class="btn p" style="flex:none">Enregistrer</button>
      </form>
    </section>
    <section class="card">
      <strong>Données</strong>
      <div class="row"><button class="btn" data-act="export">Exporter</button><button class="btn" data-act="import">Importer</button></div>
      <p class="hint">Les données restent sur cet appareil. Exporte-les de temps en temps pour garder une sauvegarde.</p>
      <input type="file" accept="application/json" hidden data-ref="file">
    </section>`;

  const form = $('[data-ref=goals]', el), file = $('[data-ref=file]', el);

  form.addEventListener('submit', e => {
    e.preventDefault();
    update(s => { for (const k of ['kcal', 'prot', 'carb', 'fat']) s.goals[k] = num(form.elements[k].value); });
    form.querySelector('button').textContent = 'Enregistré ✓';
    setTimeout(() => form.querySelector('button').textContent = 'Enregistrer', 1500);
  });

  el.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'import') file.click();
    if (act === 'export') {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' }));
      a.download = `bouffienb-${iso(new Date())}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });

  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d.goals || !d.days) throw 0;
      if (confirm('Remplacer les données actuelles par ce fichier ?')) replaceAll(d);
    } catch (e) { alert("Ce fichier n'est pas une sauvegarde valide."); }
    file.value = '';
  });
}

function render() {
  const g = getState().goals, f = $('[data-ref=goals]', root).elements;
  for (const k of ['kcal', 'prot', 'carb', 'fat']) f[k].value = g[k];
}

export default { id: 'settings', title: 'Réglages', icon: '⚙️', mount, render };
