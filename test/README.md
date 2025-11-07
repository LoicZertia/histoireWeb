# Test de Charge - 60 Joueurs Simultanés

## 🚀 Utilisation

1. **Démarrer le jeu sur Heroku** (mode host)
   - Ouvre https://quizzhist-web-bebeb63d5f7e.herokuapp.com/host
   - Clique sur "Créer une partie"
   - Note le code de partie (ex: ABC123)

2. **Lancer le test de charge**
   ```powershell
   cd test
   node load-test.js
   ```

3. **Entrer le code de partie** quand demandé

4. **Observer les résultats**
   - Les 60 joueurs vont se connecter automatiquement
   - Ils vont rejoindre la partie avec des noms Joueur1 à Joueur60
   - Pendant les questions, ils voteront automatiquement de façon aléatoire
   - Les statistiques s'affichent en temps réel

## 📊 Ce qui est testé

- ✅ **Connexions simultanées** : 60 WebSocket en parallèle
- ✅ **Stabilité du serveur** : Pas de crash sous charge
- ✅ **Performances réseau** : Latence et temps de réponse
- ✅ **Synchronisation** : Tous les joueurs reçoivent les mêmes states
- ✅ **Scoring** : Calcul correct des points pour 60 joueurs
- ✅ **Déconnexions** : Gestion des erreurs réseau

## 🎯 Comportement des bots

- Connexion par lots de 10 pour éviter la surcharge
- Vote aléatoire entre 1 et 5 secondes après l'affichage de la question
- Choix aléatoire parmi les 4 réponses possibles
- Affichage des résultats (correct/incorrect) et points gagnés

## 📈 Métriques à surveiller

### Côté Heroku (logs)
```powershell
heroku logs --tail --app quizzhist-web
```

Surveiller :
- Temps de réponse des WebSocket
- Utilisation mémoire
- Erreurs éventuelles

### Côté Test
- Nombre de joueurs connectés (doit rester à 60)
- Taux de réponses (tous doivent voter)
- Latence des messages

## ⚠️ Limitations Heroku

Heroku Free/Hobby a des limites :
- **10 000 connexions simultanées max** (60 est très safe)
- **512 MB RAM** (surveiller la consommation)
- **30s timeout** pour les requêtes HTTP (WebSocket OK)

## 🛑 Arrêter le test

Appuyez sur `Ctrl+C` dans le terminal du test.
Tous les bots se déconnecteront proprement.

## 💡 Conseils

1. **Test progressif** : Commence avec 10 joueurs, puis 30, puis 60
2. **Surveillance** : Garde un œil sur `heroku logs` pendant le test
3. **Réseau local** : Teste aussi en local pour comparer les performances
4. **Timing** : Lance tous les bots AVANT de démarrer les questions côté host
