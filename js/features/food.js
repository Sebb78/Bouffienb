//Fonctionnalité Sport : Page permettant de créer des recettes et gérer les données de nourriture
import { getState, update } from '../store.js';
import { $, iso, num, esc, uid  } from '../utils.js';

//const ;

let root;

function mount(el) { /* construit le HTML une fois */ 
    root = el;
    el.innerHTML = 
    `<header class="top"><h1>Recettes</h1></header>
    <form class="f" method="dialog">
    <label><input name="search" required autocomplete="off" placeholder="Rechercher une recette"></label>
    </form>
    <div data-ref="recipe"></div>
    <button class="fab" data-act="add">+ Recette</button>
    <dialog data-ref="dlg"><div class="sheet">
      <h3>Ajouter une recette</h3>
      <form class="f" method="dialog">
        <label>Nom<input name="name" required autocomplete="off" placeholder="Ex. Bouillabesse"></label>
        <div class="row"><button type="button" class="btn" data-act="cancel">Annuler</button><button class="btn p">Enregistrer</button></div>
      </form>
    </div></dialog>
    `;

    // Actions
    el.addEventListener('click', e => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'add') openAdd(dlg, form);
    });

}
function render()  { /* met à jour l'affichage */ 
    /*ref('recipe').innerHTML = RECIPE.map(m => {

    })

    ref('meals').innerHTML = MEALS.map(m => {
        const list = items.filter(i => i.meal === m);
        const rows = list.length ? list.map(i => `
          <div class="item"><div class="n"><b>${esc(i.name)}</b><small>P ${i.prot} · G ${i.carb} · L ${i.fat}</small></div>
          <span class="k">${Math.round(i.kcal)}</span>
          </div>`).join('')
          : `<div class="empty">Rien d'ajouté.</div>`;
        return `<section class="meal"><h2>${m}<span>${Math.round(list.reduce((a, i) => a + i.kcal, 0))} kcal</span></h2><div class="list">${rows}</div></section>`;
      }).join('');
      */
    
}

export default { id: 'food', title: 'Recettes', icon: '🍳', mount, render };