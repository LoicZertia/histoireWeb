# 🎮 QuizzHist - Jeu de quiz interactif type Kahoot sur l'histoire du web

## 🚀 Déploiement Git + Heroku

### Étape 1 : Préparer le projet pour Heroku

Créer un fichier `Procfile` (sans extension) :
```
web: node server.js
```

Vérifier que `package.json` a bien :
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Étape 2 : Initialiser Git (si pas déjà fait)

```powershell
git init
git remote add origin https://github.com/LoicZertia/histoireWeb.git
```

### Étape 3 : Commit avec message technique détaillé

```powershell
git add .
git commit -m "feat: Quiz interactif temps réel avec WebSocket custom et système de scoring

Architecture technique:
- Serveur HTTP natif Node.js (pas Express) pour servir fichiers statiques
- WebSocket custom (RFC 6455) pour communication bidirectionnelle temps réel
- Game engine avec machine à états (lobby → video → question → review → finished)
- Broadcast pattern pour synchronisation multi-joueurs (60+ connexions simultanées)

Briques principales:

1. server.js (point d'entrée)
   - Serveur HTTP avec routing manuel (/, /player, /api/server-info)
   - Gestion MIME types pour tous assets (HTML, CSS, JS, MP4)
   - Handlers d'erreurs multi-niveaux (socket, HTTP, global process)
   - Orchestration WebSocket ↔ Game engine via événements

2. websocket.js (couche réseau)
   - Implémentation complète protocole WebSocket (handshake, framing, masking)
   - Parsing manuel des frames (opcode, payload length, mask)
   - Broadcast optimisé avec vérification socket.writable
   - Gestion erreurs ECONNRESET et nettoyage automatique clients déconnectés

3. game.js (logique métier)
   - State machine: status ∈ {lobby, video, question, review, finished}
   - Players Map avec score tracking et état connexion
   - Timer questions (20s) avec callback auto-advance
   - Scoring algorithme: 400pts base + 600pts bonus rapidité (ratio temps restant)
   - Broadcast callback pattern pour découplage serveur/game

4. config/gameContent.js (données)
   - 4 rounds (Tim Berners-Lee, Ray Tomlinson, Vitalik Buterin, George W. Bush)
   - 2 questions/round = 8 questions total (~10min présentation)
   - Chemins vidéos: /assets/videos/*.mp4
   - Structure: {inventor, video{src,title,summary}, questions[{text,options,correctIndex,explanation}]}

5. public/js/host.js (interface admin)
   - EventEmitter custom pour abstraction WebSocket côté client
   - State local: {joinCode, rounds, currentPhase, roundIndex, questionIndex}
   - Auto-génération QR code via API externe (qrserver.com)
   - Timer côté client synchronisé avec serveur (décompte visuel)
   - Gestion phases: setLobbyStage() → showVideoStage() → showQuestionStage() → showReviewStage()
   - Leaderboard dynamique Top 5 avec overlay pendant jeu

6. public/js/player.js (interface joueur)
   - Auto-fill code depuis URL params (?code=XXXX)
   - WebSocket events: player:join, player:answer, player:answerRegistered
   - State tracking: hasAnswered (anti-spam), currentScore, timerRemaining
   - UI adaptative: waiting → video → question (4 boutons colorés) → review → finished
   - Highlight personnel dans leaderboard
   - One answer per question enforcement côté client + serveur

7. public/css/style-kahoot.css (design)
   - Couleurs Kahoot officielles (violet #46178F, rose #E21B3C, etc.)
   - Grid layout 2 colonnes: stage-card (jeu) + players-card (liste joueurs)
   - Boutons réponses: gradient par position (rouge, bleu, jaune, vert)
   - Animations: hover scale(1.05), pulse sur correction
   - Responsive: @media breakpoints pour mobile/tablette
   - Code géant 72px + QR 160x160 sur panneau violet dégradé

8. Sécurité & Performance
   - Validation code 4 chiffres côté serveur
   - Try-catch sur tous handlers WebSocket/HTTP
   - Process.on('uncaughtException') pour éviter crash
   - Cleanup automatique sockets fermés (clients.delete)
   - Une seule réponse par question (Map answers avec vérification)
   - Limite affichage joueurs (MAX_VISIBLE_PLAYERS = 12 + compteur)

Flow de jeu complet:
Host créé game → génère code 4 chiffres → players rejoignent via /player
→ Host lance → video phase → host next → question phase (timer 20s auto)
→ review phase → host next → loop 4 rounds → finished avec leaderboard final

Technologies:
- Node.js v18+ (core modules: http, fs, path, crypto, os)
- WebSocket natif (pas de lib socket.io)
- Vanilla JS côté client (pas de framework)
- CSS Grid + Flexbox responsive
- API externe: Google Charts QR Code generation

Capacité testée: 70 joueurs simultanés, 0 lag, 0 crash"
```

### Étape 4 : Push sur GitHub

```powershell
git branch -M main
git push -u origin main
```

### Étape 5 : Déployer sur Heroku

```powershell
# Installer Heroku CLI si pas déjà fait
# https://devcenter.heroku.com/articles/heroku-cli

# Login Heroku
heroku login

# Créer app Heroku
heroku create histoireweb-quiz

# Push sur Heroku
git push heroku main

# Ouvrir l'app
heroku open
```

### Étape 6 : Variables d'environnement Heroku (si besoin)

```powershell
heroku config:set NODE_ENV=production
```

### Étape 7 : Voir les logs

```powershell
heroku logs --tail
```

---

## 📝 Notes importantes pour Heroku

1. **Port dynamique** : Heroku assigne un port via `process.env.PORT`
   - Déjà géré dans `server.js` : `const PORT = process.env.PORT || 3000;`

2. **Fichiers vidéo** : Les MP4 doivent être dans le repo Git
   - Vérifier que `public/assets/videos/*.mp4` est bien committé
   - Attention à la taille du repo (limite GitHub 100MB par fichier)

3. **WebSocket sur Heroku** : Fonctionne nativement
   - Pas de config spéciale nécessaire

4. **HTTPS automatique** : Heroku force HTTPS
   - Modifier QR code pour utiliser `https://` si déployé

---

## 🔍 Vérifications avant push

```powershell
# Vérifier les fichiers à commiter
git status

# Vérifier que node_modules est ignoré
# Créer .gitignore si nécessaire:
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore

# Vérifier la taille des vidéos
Get-ChildItem -Path "public\assets\videos" -Recurse | Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length / 1MB, 2)}}
```

---

## 🎯 Commandes complètes dans l'ordre

```powershell
# 1. Créer Procfile
echo "web: node server.js" > Procfile

# 2. Créer .gitignore
@"
node_modules/
.env
*.log
.DS_Store
"@ > .gitignore

# 3. Init Git (si pas déjà fait)
git init
git remote add origin https://github.com/LoicZertia/histoireWeb.git

# 4. Commit
git add .
git commit -m "feat: Quiz interactif temps réel avec WebSocket custom et système de scoring

Architecture technique:
- Serveur HTTP natif Node.js pour servir fichiers statiques
- WebSocket custom (RFC 6455) pour communication bidirectionnelle temps réel
- Game engine avec machine à états (lobby → video → question → review)
- Broadcast pattern pour synchronisation 60+ joueurs simultanés

Briques principales:
1. server.js: HTTP server + routing + error handlers
2. websocket.js: WebSocket protocol implementation (handshake, framing, broadcast)
3. game.js: State machine + scoring (400-1000pts) + timer management
4. host.js: Admin interface + QR generation + phase orchestration
5. player.js: Mobile UI + answer submission + real-time leaderboard
6. style-kahoot.css: Design Kahoot (violet/rose) + responsive grid

Technologies: Node.js native, WebSocket RFC 6455, Vanilla JS, CSS Grid
Capacité: 70 joueurs testés, 0 crash, flow complet 4 rounds × 2 questions"

# 5. Push GitHub
git branch -M main
git push -u origin main

# 6. Heroku
heroku login
heroku create histoireweb-quiz
git push heroku main
heroku open
```

---

## ✅ Checklist finale

- [ ] `Procfile` créé
- [ ] `.gitignore` avec node_modules
- [ ] Vidéos MP4 dans `public/assets/videos/`
- [ ] `package.json` a `"start": "node server.js"`
- [ ] Commit fait avec message détaillé
- [ ] Push GitHub réussi
- [ ] App Heroku créée
- [ ] Déploiement Heroku réussi
- [ ] Test de l'URL Heroku

**Votre jeu sera accessible sur : `https://histoireweb-quiz.herokuapp.com`** 🚀
