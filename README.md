# CHRONOS — Machine à Voyager dans le Temps (Histoire du Web)

Refonte interactive et gamifiée d'une frise chronologique sur l'histoire du Web.

## Points clefs

- Design néo-brutaliste spatial avec palette cyberpunk (cyan, rose néon, jaune) et ombres brutales.
- Interface gamifiée : énergie temporelle, score, artefacts collectés, achievements.
- 4 ères historiques (Vannevar Bush, Ray Tomlinson, Tim Berners-Lee, Gavin Wood) avec 4 mini-jeux par ère.
- Système de progression sauvegardé dans `localStorage`.

## Optimisations de performance

- Canvas particules optimisé : réduction du nombre de particules, détection low-perf, skip frames si FPS bas.
- Animations infinies non essentielles désactivées ou fortement ralenties.
- Backdrop-filter réduit et `will-change` utilisé pour accélération GPU.
- Throttling souris, debounce resize, pause sur onglet caché.

## Fichiers

- `index.html` — Interface principale
- `script.js` — Logiciel interactif et mini-jeux
- `styles.css` — Styles néo-brutalistes et animations

## Commit

Commit message utilisé :

"✨ Refonte complète : Machine à Voyager dans le Temps (CHRONOS)

🎨 Design néo-brutaliste spatial unique
- Palette cyberpunk : cyan électrique, rose néon, jaune cyber
- Ombres brutales décalées (8-12px) pour effet 3D saisissant
- Typographie distinctive : Space Grotesk + JetBrains Mono
- Formes géométriques anguleuses sans border-radius
- Glassmorphism avancé avec effets de profondeur

🎮 Gamification complète
- 4 ères historiques
- 4 mini-jeux par ère
- Système de progression avec énergie, points et artefacts
- Sauvegarde automatique (localStorage)

🚀 Optimisations performance drastiques
- Canvas particules : 120→35 particules
- Détection auto performance (mobile/low-end)
- Skip frames dynamique si FPS < 30
- 90% animations infinies désactivées
- Backdrop-filter réduit
- Throttling souris : 50ms
- Pause automatique sur onglet caché

✨ Interactions avancées
- Curseur personnalisé magnétique
- Boutons magnétiques

🛠️ Stack technique
- HTML/CSS/JS vanilla
"
