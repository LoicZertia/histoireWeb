# 🚀 Guide de Déploiement Heroku - CHRONOS Quiz

## 📋 Prérequis
- ✅ Compte Heroku créé
- ❌ **Carte de crédit requise** pour vérifier le compte : https://heroku.com/verify
- ✅ Git installé et configuré
- ✅ npx heroku accessible

## 🔧 Étapes de Déploiement

### 1. Vérification du Compte Heroku
```bash
# Aller sur https://heroku.com/verify
# Ajouter une carte de crédit (aucun frais pour l'usage gratuit)
```

### 2. Création de l'Application
```powershell
# Dans le dossier du projet
cd c:\Users\ploya\OneDrive\Bureau\frise

# Créer l'app Heroku
npx heroku create chronos-quiz-histoire

# Ou si le nom est pris :
npx heroku create chronos-quiz-histoire-2024
npx heroku create votre-nom-chronos-quiz
```

### 3. Configuration des Variables d'Environnement
```powershell
# Définir l'environnement de production
npx heroku config:set NODE_ENV=production

# Optionnel : définir le nom de l'app pour l'URL automatique
npx heroku config:set HEROKU_APP_NAME=chronos-quiz-histoire
```

### 4. Déploiement
```powershell
# Pousser sur Heroku (branche main → master Heroku)
git push heroku main

# Ou si problème avec la branche :
git push heroku main:master
```

### 5. Ouverture de l'Application
```powershell
# Ouvrir l'app dans le navigateur
npx heroku open

# Voir les logs en temps réel
npx heroku logs --tail
```

---

## 🌐 URLs Générées Automatiquement

Une fois déployé, l'application sera accessible à :
- **Admin (projection)** : `https://chronos-quiz-histoire.herokuapp.com/`
- **Joueurs (mobile)** : `https://chronos-quiz-histoire.herokuapp.com/play`

Le QR code se mettra automatiquement à jour avec l'URL Heroku !

---

## 📱 Fonctionnalités Post-Déploiement

### QR Code Automatique
- ✅ Détection automatique de l'environnement (local vs Heroku)
- ✅ URL du QR code mise à jour automatiquement
- ✅ Pas besoin de changer l'IP manuellement

### Socket.IO en Production
- ✅ Compatible avec les proxies Heroku
- ✅ Fallback automatique si WebSocket échoue
- ✅ Sessions persistantes entre les requêtes

### Performance
- ✅ Compression Gzip automatique
- ✅ Cache des fichiers statiques
- ✅ Port dynamique Heroku géré automatiquement

---

## 🛠️ Commandes Utiles

```powershell
# Voir les infos de l'app
npx heroku info

# Redémarrer l'app
npx heroku restart

# Voir les logs d'erreur
npx heroku logs --tail

# Ouvrir le dashboard Heroku
npx heroku dashboard

# Supprimer l'app (si besoin)
npx heroku apps:destroy chronos-quiz-histoire
```

---

## 🎯 Test de l'Application Déployée

1. **Admin Screen** : Ouvrir `https://votre-app.herokuapp.com`
   - ✅ QR code affiché avec l'URL Heroku
   - ✅ Session code généré
   - ✅ Aucun joueur connecté au début

2. **Player Screen** : Scanner le QR code ou aller sur `/play`
   - ✅ Page de connexion avec pseudo
   - ✅ Connexion Socket.IO établie
   - ✅ Vibrations et sons fonctionnent

3. **Quiz Flow** : Lancer le quiz depuis l'admin
   - ✅ 8 questions d'Histoire du Web
   - ✅ Timer synchronisé
   - ✅ Feedback anti-triche (attente puis révélation)
   - ✅ Leaderboard en temps réel

---

## 🔐 Sécurité en Production

### Variables d'Environnement
- `NODE_ENV=production` : Mode production
- `PORT` : Assigné automatiquement par Heroku
- `HEROKU_APP_NAME` : Nom de l'app pour URL automatique

### Headers Sécurisés
L'application utilise HTTPS automatiquement sur Heroku avec :
- ✅ Certificats SSL gratuits
- ✅ Redirection HTTP → HTTPS
- ✅ Headers de sécurité par défaut

---

## 📊 Métriques et Monitoring

```powershell
# Voir l'utilisation des dynos
npx heroku ps

# Métriques en temps réel
npx heroku logs --tail

# Dashboard avec métriques détaillées
npx heroku dashboard
```

### Limites Gratuites Heroku
- ✅ **550 heures/mois** (suffisant pour 1 mois)
- ✅ **10,000 lignes PostgreSQL** (pas utilisées ici)
- ✅ **Domaine .herokuapp.com** inclus
- ⚠️ **Mise en veille après 30min d'inactivité** (réveil en ~10s)

---

## 🎮 Conseils pour l'Oral

### Démonstration
1. **Montrer l'URL live** : "Voici notre quiz déployé en production"
2. **Scanner le QR** : "Les étudiants peuvent rejoindre facilement"
3. **Multi-device** : "Testons avec plusieurs téléphones"
4. **Temps réel** : "Tout est synchronisé via WebSocket"

### Points Techniques à Mentionner
- **Déploiement cloud** : "Application hébergée sur Heroku"
- **Scalabilité** : "Peut gérer plusieurs classes simultanément"
- **Mobile-first** : "Optimisé pour les smartphones"
- **Sécurité** : "Système anti-triche implémenté"

---

## 🆘 Dépannage

### Problème de Déploiement
```powershell
# Si erreur de build
npx heroku logs --tail

# Si problème de port
npx heroku config:get PORT

# Si Socket.IO ne fonctionne pas
npx heroku restart
```

### Erreurs Communes
1. **"Application error"** → Vérifier les logs avec `npx heroku logs`
2. **"Cannot GET /"** → Vérifier que les fichiers `public/` sont bien présents
3. **Socket.IO disconnections** → Normal, Heroku gère automatiquement

---

## 🎉 Félicitations !

Une fois déployé, vous aurez un quiz Kahoot professionnel accessible partout dans le monde ! 🌍

**Partager l'URL :** `https://votre-app.herokuapp.com/play`

---

**Prochaines Étapes :**
- [ ] Vérifier le compte Heroku
- [ ] Créer l'application
- [ ] Déployer avec `git push heroku main`
- [ ] Tester avec plusieurs appareils
- [ ] Préparer la démonstration pour l'oral

🚀 **Bonne chance pour votre présentation !**