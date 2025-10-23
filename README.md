# CHRONOS — Quiz Multi-Joueurs Temps Réel (Histoire du Web)

**Version 2.0** - Système de quiz interactif type Kahoot pour présentation orale

## 🎯 Concept

Quiz multi-joueurs temps réel sur l'histoire du Web avec :
- **Écran de projection** pour l'orateur (affichage QR code, questions, stats live, classement)
- **Interface mobile** pour les participants (scan QR, réponse aux questions, feedback instantané)
- **Synchronisation temps réel** via WebSocket (Socket.IO)

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 16+ ([télécharger](https://nodejs.org))

### Installation
```bash
# Cloner le projet
git clone https://github.com/LoicZertia/histoireWeb.git
cd histoireWeb

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📱 Utilisation pour l'oral

### 1️⃣ Préparation (avant la présentation)
1. Lancer le serveur : `npm start`
2. Ouvrir `http://localhost:3000` sur l'ordinateur de projection
3. Un **QR code** s'affiche automatiquement

### 2️⃣ Pendant la présentation
1. **Les participants** scannent le QR code avec leur téléphone
2. Ils entrent un **pseudo** (vérification unicité)
3. L'**écran de projection** affiche la liste des joueurs connectés en temps réel
4. **L'orateur** clique sur "Démarrer le Quiz" quand tout le monde est prêt

### 3️⃣ Déroulement du quiz
- Chaque question s'affiche simultanément sur l'écran et les mobiles
- **Timer synchronisé** (15-25 secondes selon la question)
- Les participants répondent sur leur mobile
- **Stats en temps réel** : nombre de réponses, distribution des choix
- **Score basé sur vitesse** : réponse correcte + bonus de rapidité (max 1000 pts)
- Après chaque question : affichage de la bonne réponse + **top 5** du classement

### 4️⃣ Fin du quiz
- **Classement final** avec score total et nombre de bonnes réponses
- Podium avec top 3 mis en valeur

## 🎮 Fonctionnalités

### Écran Admin (Projection)
- ✅ Génération automatique de QR code
- ✅ Liste des joueurs connectés en temps réel
- ✅ Affichage des questions avec timer
- ✅ Statistiques live des réponses
- ✅ Classement en temps réel
- ✅ Design néo-brutaliste conservé

### Interface Joueur (Mobile)
- ✅ Saisie pseudo avec validation
- ✅ Écran d'attente avant le quiz
- ✅ Questions avec timer synchronisé
- ✅ Feedback immédiat (correct/incorrect)
- ✅ Affichage du score personnel
- ✅ Interface tactile optimisée

### Serveur (Node.js + Socket.IO)
- ✅ Gestion des connexions/déconnexions
- ✅ Validation des pseudos (unicité)
- ✅ Synchronisation temps réel
- ✅ Calcul automatique des scores
- ✅ Timer serveur synchronisé
- ✅ 8 questions sur les 4 ères historiques

## 📊 Système de Points

- **Réponse correcte** : 500 pts de base
- **Bonus vitesse** : jusqu'à 500 pts supplémentaires selon temps restant
- **Score maximum** : 1000 pts par question
- **Réponse incorrecte** : 0 pt

## 🛠️ Stack Technique

- **Backend** : Node.js + Express + Socket.IO
- **Frontend** : HTML5 + CSS3 (néo-brutalisme) + JavaScript vanilla
- **Temps réel** : WebSocket via Socket.IO
- **QR Code** : qrcode.js
- **Design** : Conserve le style néo-brutaliste original (cyan, rose, jaune)

## 📁 Structure

```
histoireWeb/
├── server.js              # Serveur Node.js + Socket.IO
├── package.json           # Dependencies
├── public/
│   ├── admin.html        # Page admin (écran projection)
│   ├── player.html       # Page joueur (mobile)
│   ├── styles.css        # Styles néo-brutalistes
│   ├── index-old.html    # Ancienne version solo
│   └── script-old.js     # Ancien script solo
└── README.md
```

## 🌐 Déploiement (optionnel)

Pour un vrai oral avec accès public, déployer sur :
- **Heroku** (gratuit) : `git push heroku main`
- **Railway** (gratuit) : import GitHub
- **Render** (gratuit) : import GitHub

Sinon, utiliser votre **réseau local** :
1. Trouver votre IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Les participants vont sur `http://[VOTRE_IP]:3000/play`

## 🎨 Personnalisation

### Ajouter des questions
Éditer `server.js`, section `quizQuestions` (ligne ~24) :

```javascript
const quizQuestions = [
  {
    question: "Votre question ?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct: 1, // Index de la bonne réponse (0-3)
    era: "Nom de l'ère",
    timeLimit: 20 // Secondes
  },
  // ...
];
```

### Modifier les couleurs
Éditer `public/styles.css`, section `:root` (lignes 8-17)

## 📝 Changelog v2.0

- ✨ **Mode multi-joueurs** avec Socket.IO
- 📱 **QR code** pour connexion rapide
- ⏱️ **Timer synchronisé** serveur
- 🏆 **Classement temps réel**
- 📊 **Statistiques live** des réponses
- 🎯 **Score basé sur vitesse**
- 📲 **Interface mobile optimisée**
- 🎨 **Conservation du design néo-brutaliste**

---

**Ancienne version solo** disponible dans `public/index-old.html`
