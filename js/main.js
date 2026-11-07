// Point d'entrée. Pour ajouter une fonctionnalité : importe-la et ajoute-la à FEATURES.
import diary from './features/diary.js';
import settings from './features/settings.js';
import settings from './features/food.js';
import settings from './features/sport.js';
import { initStore, subscribe } from './store.js';

const FEATURES = [diary, settings, food, sport];

async function start() {
  await initStore();   // charge les données depuis IndexedDB avant d'afficher quoi que ce soit

  const app = document.getElementById('app');
  const tabs = document.getElementById('tabs');
  const sections = {};

  FEATURES.forEach(f => {
    const el = document.createElement('section');
    el.hidden = true;
    app.append(el);
    sections[f.id] = el;
    f.mount(el);
    tabs.insertAdjacentHTML('beforeend', `<a href="#${f.id}" data-id="${f.id}"><span>${f.icon}</span>${f.title}</a>`);
  });

  let activeId = null;
  function show() {
    const id = FEATURES.some(f => f.id === location.hash.slice(1)) ? location.hash.slice(1) : FEATURES[0].id;
    activeId = id;
    FEATURES.forEach(f => {
      sections[f.id].hidden = f.id !== id;
      tabs.querySelector(`[data-id="${f.id}"]`).classList.toggle('on', f.id === id);
    });
    FEATURES.find(f => f.id === id).render();
  }

  // À chaque modification des données, on redessine uniquement l'écran visible.
  subscribe(() => FEATURES.find(f => f.id === activeId)?.render());
  addEventListener('hashchange', show);
  show();
}

start();

// Chemin et scope relatifs : fonctionne depuis n'importe quel sous-dossier (ex. /nutritrack/).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js', { scope: './' }).catch(console.error);
}
