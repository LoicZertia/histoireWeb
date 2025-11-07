const WebSocket = require('ws');
const readline = require('readline');

// Configuration
const PLAYER_COUNT = 60;
const BASE_URL = 'wss://quizzhist-web-bebeb63d5f7e.herokuapp.com';

// Stockage des connexions
const players = [];
let gameCode = '';

// Interface pour saisir le code
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function createPlayer(index) {
    return new Promise((resolve, reject) => {
        const playerName = `Joueur${index}`;
        const ws = new WebSocket(BASE_URL);
        
        const player = {
            id: index,
            name: playerName,
            ws: ws,
            connected: false,
            answered: false
        };

        ws.on('open', () => {
            player.connected = true;
            log(`✓ ${playerName} connecté`, colors.green);
            resolve(player);
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handlePlayerMessage(player, message);
            } catch (error) {
                log(`Erreur parsing message pour ${playerName}: ${error.message}`, colors.red);
            }
        });

        ws.on('error', (error) => {
            log(`✗ Erreur ${playerName}: ${error.message}`, colors.red);
        });

        ws.on('close', () => {
            player.connected = false;
            log(`✗ ${playerName} déconnecté`, colors.yellow);
        });

        // Timeout de connexion
        setTimeout(() => {
            if (!player.connected) {
                reject(new Error(`Timeout connexion pour ${playerName}`));
            }
        }, 10000);
    });
}

function handlePlayerMessage(player, message) {
    const { event, data } = message;
    
    switch (event) {
        case 'player:joined':
            log(`→ ${player.name} a rejoint la partie ${gameCode}`, colors.cyan);
            break;
        
        case 'player:joinRejected':
            log(`✗ ${player.name} rejeté: ${data.reason}`, colors.red);
            break;
        
        case 'phase:question':
            if (!player.answered) {
                // Vote aléatoire après un délai aléatoire (1-5 secondes)
                const delay = Math.random() * 4000 + 1000;
                setTimeout(() => {
                    sendAnswer(player, data.question);
                }, delay);
            }
            break;
        
        case 'player:answerResult':
            player.answered = false; // Prêt pour la prochaine question
            const result = data.isCorrect ? '✓ Correct' : '✗ Incorrect';
            const points = data.pointsEarned || 0;
            log(`${player.name}: ${result} (+${points} pts)`, data.isCorrect ? colors.green : colors.red);
            break;
    }
}

function sendAnswer(player, question) {
    if (!player.connected || player.answered) return;
    
    // Réponse aléatoire entre 0 et 3
    const answerIndex = Math.floor(Math.random() * 4);
    
    player.ws.send(JSON.stringify({
        event: 'player:answer',
        data: {
            questionId: question.id,
            choiceIndex: answerIndex
        }
    }));
    
    player.answered = true;
    log(`${player.name} a voté: option ${answerIndex}`, colors.blue);
}

async function joinGame() {
    log(`\n📝 Connexion de ${PLAYER_COUNT} joueurs à la partie ${gameCode}...`, colors.bright);
    
    // Créer tous les joueurs en parallèle (par groupes de 10)
    const batchSize = 10;
    for (let i = 0; i < PLAYER_COUNT; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, PLAYER_COUNT); j++) {
            batch.push(createPlayer(j + 1));
        }
        
        try {
            const connectedPlayers = await Promise.all(batch);
            players.push(...connectedPlayers);
            
            // Rejoindre la partie pour ce lot
            for (const player of connectedPlayers) {
                player.ws.send(JSON.stringify({
                    event: 'player:join',
                    data: {
                        code: gameCode,
                        name: player.name
                    }
                }));
            }
            
            log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(PLAYER_COUNT / batchSize)} connecté`, colors.green);
            
            // Pause entre les batches pour éviter de surcharger
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            log(`Erreur lors de la connexion du batch: ${error.message}`, colors.red);
        }
    }
    
    log(`\n✅ ${players.length}/${PLAYER_COUNT} joueurs connectés et prêts!`, colors.bright + colors.green);
    log(`\n📊 Statistiques en temps réel:`, colors.bright);
}

function showStats() {
    setInterval(() => {
        const connected = players.filter(p => p.connected).length;
        const answered = players.filter(p => p.answered).length;
        
        process.stdout.write(`\r🔗 Connectés: ${connected}/${PLAYER_COUNT} | 🎯 En train de répondre: ${answered}   `);
    }, 1000);
}

function cleanup() {
    log('\n\n🛑 Arrêt du test...', colors.yellow);
    players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.close();
        }
    });
    process.exit(0);
}

// Gestion de l'arrêt propre
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Point d'entrée
async function main() {
    log('╔════════════════════════════════════════════╗', colors.bright);
    log('║   TEST DE CHARGE - QUIZZHIST               ║', colors.bright);
    log('║   60 Joueurs Simultanés                    ║', colors.bright);
    log('╚════════════════════════════════════════════╝', colors.bright);
    log('');
    
    rl.question('🎮 Entrez le code de la partie: ', async (code) => {
        gameCode = code.trim().toUpperCase();
        
        if (!gameCode) {
            log('❌ Code invalide!', colors.red);
            rl.close();
            return;
        }
        
        rl.close();
        
        try {
            await joinGame();
            showStats();
            
            log('\n💡 Les joueurs vont répondre automatiquement aux questions.', colors.cyan);
            log('💡 Appuyez sur Ctrl+C pour arrêter le test.\n', colors.cyan);
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, colors.red);
            cleanup();
        }
    });
}

main();
