# Script de Déploiement Heroku - CHRONOS Quiz
# Exécuter avec : .\deploy-heroku.ps1

Write-Host "🚀 CHRONOS Quiz - Déploiement Heroku" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérification des prérequis
Write-Host "`n1. Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Git
try {
    git --version | Out-Null
    Write-Host "✅ Git installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier Heroku
try {
    npx heroku --version | Out-Null
    Write-Host "✅ Heroku CLI accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier login Heroku
Write-Host "`n2. Vérification de la connexion Heroku..." -ForegroundColor Yellow
try {
    $auth = npx heroku auth:whoami 2>$null
    if ($auth) {
        Write-Host "✅ Connecté en tant que: $auth" -ForegroundColor Green
    } else {
        throw "Non connecté"
    }
} catch {
    Write-Host "❌ Non connecté à Heroku" -ForegroundColor Red
    Write-Host "Exécutez: npx heroku login" -ForegroundColor Yellow
    exit 1
}

# Demander le nom de l'app
Write-Host "`n3. Configuration de l'application..." -ForegroundColor Yellow
$appName = Read-Host "Nom de l'app Heroku (ex: chronos-quiz-histoire)"

if (-not $appName) {
    $appName = "chronos-quiz-histoire-$(Get-Random -Maximum 9999)"
    Write-Host "Nom généré automatiquement: $appName" -ForegroundColor Cyan
}

# Créer l'application
Write-Host "`n4. Création de l'application Heroku..." -ForegroundColor Yellow
try {
    npx heroku create $appName
    Write-Host "✅ Application '$appName' créée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ L'application existe peut-être déjà" -ForegroundColor Yellow
}

# Configuration des variables d'environnement
Write-Host "`n5. Configuration des variables..." -ForegroundColor Yellow
npx heroku config:set NODE_ENV=production --app $appName
npx heroku config:set HEROKU_APP_NAME=$appName --app $appName
Write-Host "✅ Variables d'environnement configurées" -ForegroundColor Green

# Commit des derniers changements
Write-Host "`n6. Commit des changements..." -ForegroundColor Yellow
git add .
git commit -m "🚀 Ready for Heroku deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ErrorAction SilentlyContinue
Write-Host "✅ Changements commités" -ForegroundColor Green

# Déploiement
Write-Host "`n7. Déploiement sur Heroku..." -ForegroundColor Yellow
Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Cyan

try {
    git push heroku main
    Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host "Vérifiez les logs avec: npx heroku logs --tail --app $appName" -ForegroundColor Yellow
    exit 1
}

# Ouverture de l'application
Write-Host "`n8. Ouverture de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
npx heroku open --app $appName

# Affichage des informations finales
Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "📱 Admin: https://$appName.herokuapp.com" -ForegroundColor Cyan
Write-Host "🎮 Players: https://$appName.herokuapp.com/play" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "• Logs: npx heroku logs --tail --app $appName" -ForegroundColor White
Write-Host "• Restart: npx heroku restart --app $appName" -ForegroundColor White
Write-Host "• Info: npx heroku info --app $appName" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Votre quiz est maintenant accessible partout dans le monde!" -ForegroundColor Green