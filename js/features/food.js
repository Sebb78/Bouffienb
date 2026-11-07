//Fonctionnalité Sport : Page permettant de créer des recettes et gérer les données de nourriture
import { getState, update } from '../store.js';
import { $, iso, num, esc, uid  } from '../utils.js';

let root;

function mount(el) { /* construit le HTML une fois */ 
    root = el;
    el.innerHTML = '<header class="top"><h1>Recettes</h1></header>'
}
function render()  { /* met à jour l'affichage */ }

export default { id: 'food', title: 'Recettes', icon: '🍳', mount, render };