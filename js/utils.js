// Petites fonctions partagées par toutes les fonctionnalités.
export const $ = (sel, root = document) => root.querySelector(sel);
export const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
export const num = v => Math.round((parseFloat(v) || 0) * 10) / 10;
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
