# Bouffienb

Suivi nutritionnel 100 % local : aucune donnée n'est envoyée nulle part, tout est dans IndexedDB
(base `bouffienb`) sur l'appareil. Pas de build, pas de dépendance, pas de serveur applicatif.

## Publier sur GitHub Pages
1. Crée un dépôt (ex. `nutritrack`) et envoie le **contenu** de ce dossier à la racine du dépôt
   (`index.html` doit être à la racine, pas dans un sous-dossier).
2. Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. L'app est servie sur `https://<pseudo>.github.io/<nom-du-dépôt>/`.
Tous les chemins sont relatifs : le nom du dépôt n'a pas d'importance.

## iPhone
Ouvre l'adresse dans **Safari**, puis Partager → « Sur l'écran d'accueil », et utilise l'app depuis
cette icône. Les données de l'app installée sont séparées de celles de l'onglet Safari.

## Tester en local
    python3 -m http.server 8000      # puis http://localhost:8000

## Structure
    index.html              coquille de la page
    css/style.css           styles
    js/main.js              démarrage, navigation, enregistrement du service worker
    js/store.js             données (IndexedDB) : initStore(), getState(), update(fn), subscribe(fn)
    js/utils.js             helpers
    js/features/*.js        une fonctionnalité par fichier
    sw.js                   mode hors ligne
    manifest.webmanifest    installation sur l'écran d'accueil
    icons/                  icônes de l'app

## Ajouter une fonctionnalité (ex. suivi de l'eau)
1. `store.js` : ajoute une clé dans `DEFAULTS` (ex. `water: {}`).
2. Crée `js/features/water.js` qui exporte `{ id, title, icon, mount(el), render() }`
   (copie `settings.js` comme modèle).
3. `main.js` : importe-la et ajoute-la à `FEATURES`.
4. `sw.js` : ajoute le fichier à `FILES` et incrémente `VERSION`.

## Mises à jour
Le service worker sert la version en cache puis récupère la nouvelle en arrière-plan : après un
déploiement, la nouvelle version apparaît au deuxième lancement. Incrémente `VERSION` dans `sw.js`
si tu ajoutes ou renomme des fichiers.
