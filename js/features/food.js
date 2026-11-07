//Fonctionnalité Sport : Page permettant de créer des recettes et gérer les données de nourriture
import { getState, update } from '../store.js';
import { $, iso, num, esc, uid  } from '../utils.js';

let root;

function mount(el) { /* construit le HTML une fois */ 
    root = el;
    el.innerHTML = 
    `<header class="top"><h1>Recettes</h1></header>
    <form class="f" method="dialog">
    <label><input name="search" required autocomplete="off" placeholder="Rechercher une recette"></label>
    </form>
    <div data-ref="meals"></div>`
}
function render()  { /* met à jour l'affichage */ }

export default { id: 'food', title: 'Recettes', icon: '🍳', mount, render };