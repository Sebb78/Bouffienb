// Seul fichier qui touche au stockage (IndexedDB, base "bouffienb", sur l'appareil).
// Les fonctionnalités lisent avec getState() et modifient avec update().
// Pour une nouvelle donnée : ajoute une clé dans DEFAULTS.
const DB_NAME = 'bouffienb';   // nom propre à l'app : tous les projets *.github.io d'un même compte partagent la même origine
const STORE = 'kv';
const KEY = 'state';

const DEFAULTS = {
  goals: { kcal: 2200, prot: 120, carb: 250, fat: 70 },
  days: {},          // { "2026-11-05": [ {id, name, meal, kcal, prot, carb, fat} ] }
  // water: {},      // exemple : une future fonctionnalité "Eau"
  // weight: [],     // exemple : une future fonctionnalité "Poids"
};

const merge = saved => ({ ...structuredClone(DEFAULTS), ...saved, goals: { ...DEFAULTS.goals, ...saved.goals } });

let state = merge({});
let db = null;
let warned = false;
const listeners = new Set();

const openDb = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const run = (mode, fn) => new Promise((resolve, reject) => {
  const tx = db.transaction(STORE, mode);
  const req = fn(tx.objectStore(STORE));
  tx.oncomplete = () => resolve(req.result);
  tx.onerror = tx.onabort = () => reject(tx.error);
});

// À appeler (et attendre) une fois au démarrage, avant le premier rendu.
export async function initStore() {
  try {
    db = await openDb();
    state = merge((await run('readonly', s => s.get(KEY))) || {});
    navigator.storage?.persist?.();   // demande au navigateur de ne pas purger les données
  } catch (e) {
    db = null;
    console.error(e);
    alert("Stockage indisponible : tes données ne seront pas conservées.");
  }
}

function persist() {
  if (!db) return;
  run('readwrite', s => s.put(state, KEY)).catch(e => {
    console.error(e);
    if (!warned) { warned = true; alert("Enregistrement impossible : exporte tes données dès que possible."); }
  });
}

export const getState = () => state;
export const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };

export function update(mutator) {
  mutator(state);
  persist();
  listeners.forEach(fn => fn(state));
}

export function replaceAll(data) {
  state = merge(data);
  persist();
  listeners.forEach(fn => fn(state));
}
