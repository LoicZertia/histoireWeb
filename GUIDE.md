# Guide QuizzHist - Jeu type Kahoot pour l'oral

## ✅ Corrections effectuées

### Bugs critiques corrigés :
1. ✅ **player.js vide** → Recréé complètement avec toute la logique WebSocket
2. ✅ **Chemins vidéos incorrects** → Mis à jour vers `/assets/videos/`
3. ✅ **Crash ECONNRESET** → Ajout gestion d'erreurs robuste sur tous les sockets
4. ✅ **Route /player** → Fonctionne correctement
5. ✅ **Bouton Reset** → Événement `host:resetGame` ajouté au serveur

### Fichiers vidéo disponibles :
- `tim-berners-lee.mp4`
- `ray-tomlinson.mp4`
- `vitalik-buterin.mp4`
- `bush.mp4`

---

## 🎮 Comment utiliser le jeu

### 1. Démarrer le serveur

```powershell
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

### 2. Page Administrateur (Host)

1. Ouvrir **http://localhost:3000** dans le navigateur
2. Un **code à 4 chiffres** et un **QR code** apparaissent automatiquement
3. La liste des joueurs connectés s'affiche en temps réel

### 3. Connexion des joueurs

Les joueurs scannent le QR code ou vont sur **http://localhost:3000/player** et entrent :
- Leur **pseudo**
- Le **code à 4 chiffres** affiché sur l'écran du host

### 4. Lancer le jeu

1. Quand tout le monde est connecté, le host clique sur **"Lancer"**
2. Le jeu démarre automatiquement

---

## 📺 Déroulement du jeu

### Flow automatique :
```
Vidéo 1 (Tim Berners-Lee)
  ↓
[Host clique "Questions"]
  ↓
Question 1 (20 secondes)
  ↓
[Auto après timeout OU Host clique "Afficher correction"]
  ↓
Correction Question 1
  ↓
[Host clique "Suivant"]
  ↓
Question 2 (20 secondes)
  ↓
Correction Question 2
  ↓
[Host clique "Suivant"]
  ↓
Vidéo 2 (Ray Tomlinson)
  ↓
... (répète pour 4 rounds)
  ↓
Classement final
```

### Important :
- **Le host doit cliquer sur "Suivant"** pour avancer après chaque phase
- Les **vidéos NE se lancent PAS automatiquement** après → le host clique "Questions" quand la vidéo est terminée
- Les **questions ont un timer de 20 secondes** puis passent automatiquement à la correction
- Le **classement se met à jour** après chaque question

---

## 🎯 Système de points

- **Bonne réponse** = 400 points de base
- **Bonus rapidité** = jusqu'à 600 points (plus on répond vite, plus on gagne)
- **Total maximum par question** = 1000 points

---

## 🔧 Contrôles Host

| Bouton | Fonction |
|--------|----------|
| **Lancer** | Démarre le jeu (désactivé après le lancement) |
| **Suivant** | Avance à la phase suivante (vidéo → quiz → question suivante → round suivant) |
| **Réinitialiser** | Reset le jeu et déconnecte tous les joueurs |
| **Nouvelle salle** | Crée une nouvelle salle avec un nouveau code |

---

## ⚠️ Points d'attention

1. **Vidéos** : Les vidéos doivent être dans `public/assets/videos/`
2. **Connexion stable** : Si un joueur perd la connexion, il doit recharger la page
3. **Code unique** : Chaque session a un code unique à 4 chiffres
4. **60 joueurs max** : Le serveur est optimisé pour ~60 connexions simultanées
5. **Timing oral** : 4 rounds × (vidéo ~1min + 2 questions ~40s) ≈ **8-10 minutes**

---

## 🐛 En cas de problème

### Le serveur crash avec "ECONNRESET"
→ ✅ **CORRIGÉ** : Gestion d'erreurs ajoutée

### Le QR code ne s'affiche pas
→ Vérifier que le serveur est bien démarré et accessible

### Les joueurs ne peuvent pas se connecter
→ Vérifier que le **code est correct** et que la salle n'a pas été réinitialisée

### Les vidéos ne se lancent pas
→ Vérifier que les fichiers MP4 sont bien dans `public/assets/videos/`

### Le bouton "Lancer" est grisé
→ Aucun joueur n'est connecté OU le jeu a déjà démarré

---

## 📱 Design type Kahoot

Le design actuel est **moderne et coloré** avec :
- ✅ Code et QR code bien visibles
- ✅ Liste de joueurs en temps réel
- ✅ Classement Top 5 pendant le jeu
- ✅ Interface responsive pour mobile (joueurs)
- ✅ Grand écran pour projection (host)

Le **fonctionnel est prioritaire** → tout fonctionne sans bug maintenant ! 🎉
