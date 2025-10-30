# 🎯 AIDE-MÉMOIRE ORAL - QuizzHist

## ⚡ Démarrage rapide (5 secondes)

```powershell
npm run dev
```

Puis ouvrir : **http://localhost:3000**

---

## 📺 Pendant l'oral

### Vous (le host) :
1. **Projeter** l'écran du navigateur (http://localhost:3000)
2. **Attendre** que les élèves se connectent (vous voyez la liste)
3. **Cliquer "Lancer"** quand tout le monde est prêt
4. **Laisser la vidéo jouer** (~1 min)
5. **Cliquer "Questions"** quand la vidéo est finie
6. **Attendre** 20 secondes par question (automatique)
7. **Cliquer "Suivant"** pour passer à la question/round suivant
8. **Répéter** pour les 4 inventeurs

### Les élèves :
1. Scanner le **QR code** ou aller sur l'URL affichée
2. Entrer leur **pseudo**
3. Entrer le **code à 4 chiffres** affiché
4. Répondre aux questions le plus vite possible !

---

## ⏱️ Timing (10 minutes total)

- **4 vidéos** × ~1 min = 4 min
- **8 questions** × ~20 sec = 2.5 min
- **Transitions + corrections** = 3 min
- **TOTAL** = ~9-10 minutes

---

## 🔥 Si problème

### Le serveur ne démarre pas
→ Vérifier que vous êtes dans le bon dossier : `cd quizzhist`

### Les joueurs ne peuvent pas se connecter
→ Vérifier qu'ils entrent le **bon code** (celui affiché à l'écran)

### Une vidéo ne se charge pas
→ Fichiers vidéo dans `public/assets/videos/` :
- tim-berners-lee.mp4
- ray-tomlinson.mp4
- vitalik-buterin.mp4  
- bush.mp4

---

## 🎯 Boutons host

| Bouton | Quand cliquer |
|--------|---------------|
| **Lancer** | Quand tout le monde est connecté (début du jeu) |
| **Questions** | Après la vidéo (pour lancer les 2 questions) |
| **Suivant** | Après chaque correction (pour passer à la suite) |
| **Réinitialiser** | Uniquement si vous voulez recommencer à zéro |

---

## ✅ Checklist avant l'oral

- [ ] Serveur démarré (`npm run dev`)
- [ ] Page host ouverte et projetée
- [ ] Code et QR code visibles
- [ ] Connexion internet/Wi-Fi OK (pour QR code)
- [ ] Les 4 vidéos sont dans le bon dossier
- [ ] Tout le monde peut scanner le QR

---

## 🚀 C'EST PARTI !

Amusez-vous bien ! 🎉
