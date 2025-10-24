const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const QRCode = require('qrcode');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Fonction pour obtenir l'URL de base (local ou Heroku)
function getBaseURL() {
  if (process.env.NODE_ENV === 'production' || process.env.HEROKU_APP_NAME) {
    // En production sur Heroku
    return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
  } else {
    // En local
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return `http://${iface.address}:${PORT}`;
        }
      }
    }
    return `http://localhost:${PORT}`;
  }
}

const BASE_URL = getBaseURL();

// Servir les fichiers statiques
app.use(express.static('public'));

// État du jeu global
const gameState = {
  sessionCode: generateSessionCode(),
  players: new Map(), // socketId -> { pseudo, score, answers }
  currentQuestion: null,
  questionIndex: -1,
  isQuizActive: false,
  timer: null,
  timeRemaining: 0,
  responses: new Map() // questionIndex -> Map(socketId -> { answer, time })
};

// Questions du quiz (ère 1 - Vannevar Bush comme exemple)
const quizQuestions = [
  {
    question: "En quelle année Vannevar Bush a-t-il publié 'As We May Think' ?",
    options: ["1935", "1945", "1955", "1965"],
    correct: 1,
    era: "Vannevar Bush (1900-1945)",
    timeLimit: 20
  },
  {
    question: "Quel système a imaginé Vannevar Bush dans son article ?",
    options: ["Internet", "Memex", "ARPANET", "World Wide Web"],
    correct: 1,
    era: "Vannevar Bush (1900-1945)",
    timeLimit: 20
  },
  {
    question: "Qui a inventé l'email en 1971 ?",
    options: ["Tim Berners-Lee", "Ray Tomlinson", "Vint Cerf", "Larry Page"],
    correct: 1,
    era: "Ray Tomlinson (1958-1990)",
    timeLimit: 20
  },
  {
    question: "Quel symbole a été choisi par Ray Tomlinson pour séparer le nom et l'adresse ?",
    options: ["#", "@", "&", "%"],
    correct: 1,
    era: "Ray Tomlinson (1958-1990)",
    timeLimit: 15
  },
  {
    question: "En quelle année Tim Berners-Lee a-t-il créé le World Wide Web ?",
    options: ["1989", "1991", "1993", "1995"],
    correct: 1,
    era: "Tim Berners-Lee (1990-2020)",
    timeLimit: 20
  },
  {
    question: "Quel était le premier navigateur web créé par Tim Berners-Lee ?",
    options: ["Mosaic", "Netscape", "WorldWideWeb", "Internet Explorer"],
    correct: 2,
    era: "Tim Berners-Lee (1990-2020)",
    timeLimit: 20
  },
  {
    question: "Qu'est-ce qu'Ethereum, co-fondé par Gavin Wood ?",
    options: ["Un réseau social", "Une plateforme blockchain", "Un moteur de recherche", "Un système d'email"],
    correct: 1,
    era: "Gavin Wood (2020+)",
    timeLimit: 20
  },
  {
    question: "Quel langage de programmation Gavin Wood a-t-il créé pour Ethereum ?",
    options: ["JavaScript", "Python", "Solidity", "Ruby"],
    correct: 2,
    era: "Gavin Wood (2020+)",
    timeLimit: 25
  }
];

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculateScore(isCorrect, timeRemaining, totalTime) {
  if (!isCorrect) return 0;
  // Score basé sur vitesse : 1000 pts max si réponse immédiate
  const speedBonus = Math.floor((timeRemaining / totalTime) * 500);
  return 500 + speedBonus; // 500 pts base + 0-500 pts vitesse
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/play', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

app.get('/qrcode', async (req, res) => {
  try {
    // Utilise l'URL de base (local ou Heroku)
    const url = `${BASE_URL}/play`;
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#00F0FF', light: '#0D0221' }
    });
    res.json({ qrCode: qrCodeDataURL, url, sessionCode: gameState.sessionCode });
  } catch (error) {
    res.status(500).json({ error: 'QR code generation failed' });
  }
});

// Socket.IO événements
io.on('connection', (socket) => {
  console.log(`Nouvelle connexion: ${socket.id}`);

  // Joueur rejoint avec pseudo
  socket.on('join-game', (data) => {
    const { pseudo } = data;
    
    if (!pseudo || pseudo.trim().length === 0) {
      socket.emit('join-error', { message: 'Pseudo requis' });
      return;
    }

    // Vérifie si pseudo déjà pris
    const pseudoExists = Array.from(gameState.players.values())
      .some(p => p.pseudo.toLowerCase() === pseudo.toLowerCase());
    
    if (pseudoExists) {
      socket.emit('join-error', { message: 'Pseudo déjà pris' });
      return;
    }

    gameState.players.set(socket.id, {
      pseudo: pseudo.trim(),
      score: 0,
      answers: [],
      joinedAt: Date.now()
    });

    socket.emit('join-success', {
      sessionCode: gameState.sessionCode,
      pseudo: pseudo.trim()
    });

    // Broadcast liste joueurs à l'admin
    io.emit('players-update', {
      players: Array.from(gameState.players.entries()).map(([id, p]) => ({
        id,
        pseudo: p.pseudo,
        score: p.score
      })),
      count: gameState.players.size
    });

    console.log(`${pseudo} a rejoint. Total: ${gameState.players.size} joueurs`);
  });

  // Admin démarre le quiz
  socket.on('start-quiz', () => {
    if (gameState.isQuizActive) {
      socket.emit('error', { message: 'Quiz déjà en cours' });
      return;
    }

    gameState.isQuizActive = true;
    gameState.questionIndex = -1;
    
    // Réinitialise les scores
    gameState.players.forEach(player => {
      player.score = 0;
      player.answers = [];
    });

    io.emit('quiz-started', { totalQuestions: quizQuestions.length });
    console.log('Quiz démarré!');

    // Démarre première question après 3 secondes
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  });

  // Passe à la question suivante
  socket.on('next-question', () => {
    nextQuestion();
  });

  // Joueur soumet réponse
  socket.on('submit-answer', (data) => {
    const { questionIndex, answer, timeRemaining } = data;
    const player = gameState.players.get(socket.id);

    if (!player) return;
    if (questionIndex !== gameState.questionIndex) return;
    if (gameState.responses.get(questionIndex)?.has(socket.id)) {
      // Déjà répondu
      return;
    }

    // Enregistre la réponse
    if (!gameState.responses.has(questionIndex)) {
      gameState.responses.set(questionIndex, new Map());
    }
    
    gameState.responses.get(questionIndex).set(socket.id, {
      answer,
      time: timeRemaining,
      timestamp: Date.now()
    });

    const question = quizQuestions[questionIndex];
    const isCorrect = answer === question.correct;
    const points = calculateScore(isCorrect, timeRemaining, question.timeLimit);

    if (isCorrect) {
      player.score += points;
      player.answers.push({ questionIndex, correct: true, points });
    } else {
      player.answers.push({ questionIndex, correct: false, points: 0 });
    }

    // Confirme juste que la réponse est enregistrée (sans révéler si c'est correct)
    socket.emit('answer-submitted', { 
      questionIndex,
      message: 'Réponse enregistrée !'
    });

    console.log(`${player.pseudo} a répondu: ${answer} (${isCorrect ? 'Correct' : 'Faux'}) +${points}pts`);

    // Update admin avec stats en temps réel
    broadcastQuestionStats();
  });

  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    if (player) {
      console.log(`${player.pseudo} s'est déconnecté`);
      gameState.players.delete(socket.id);
      
      io.emit('players-update', {
        players: Array.from(gameState.players.entries()).map(([id, p]) => ({
          id,
          pseudo: p.pseudo,
          score: p.score
        })),
        count: gameState.players.size
      });
    }
  });
});

function nextQuestion() {
  gameState.questionIndex++;

  if (gameState.questionIndex >= quizQuestions.length) {
    endQuiz();
    return;
  }

  const question = quizQuestions[gameState.questionIndex];
  gameState.currentQuestion = question;
  gameState.timeRemaining = question.timeLimit;

  // Broadcast question à tous
  io.emit('new-question', {
    questionIndex: gameState.questionIndex,
    question: question.question,
    options: question.options,
    era: question.era,
    timeLimit: question.timeLimit,
    totalQuestions: quizQuestions.length
  });

  console.log(`Question ${gameState.questionIndex + 1}/${quizQuestions.length}: ${question.question}`);

  // Timer
  startTimer(question.timeLimit);
}

function startTimer(duration) {
  if (gameState.timer) clearInterval(gameState.timer);
  
  gameState.timeRemaining = duration;

  gameState.timer = setInterval(() => {
    gameState.timeRemaining--;

    io.emit('timer-update', { timeRemaining: gameState.timeRemaining });

    if (gameState.timeRemaining <= 0) {
      clearInterval(gameState.timer);
      showResults();
    }
  }, 1000);
}

function showResults() {
  const question = quizQuestions[gameState.questionIndex];
  const responses = gameState.responses.get(gameState.questionIndex) || new Map();

  // Calcule stats
  const stats = question.options.map((opt, idx) => {
    const count = Array.from(responses.values()).filter(r => r.answer === idx).length;
    return { option: opt, count, isCorrect: idx === question.correct };
  });

  // Top 5 joueurs
  const leaderboard = Array.from(gameState.players.entries())
    .map(([id, p]) => ({ pseudo: p.pseudo, score: p.score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Broadcast général pour l'admin
  io.emit('question-results', {
    questionIndex: gameState.questionIndex,
    correctAnswer: question.correct,
    stats,
    leaderboard,
    totalResponses: responses.size,
    totalPlayers: gameState.players.size
  });

  // Envoie le résultat individuel à chaque joueur
  gameState.players.forEach((player, socketId) => {
    const playerResponse = responses.get(socketId);
    if (playerResponse) {
      const isCorrect = playerResponse.answer === question.correct;
      const playerAnswer = player.answers.find(a => a.questionIndex === gameState.questionIndex);
      
      io.to(socketId).emit('player-result', {
        questionIndex: gameState.questionIndex,
        isCorrect,
        correctAnswer: question.correct,
        yourAnswer: playerResponse.answer,
        points: playerAnswer ? playerAnswer.points : 0,
        newScore: player.score
      });
    }
  });

  console.log(`Résultats question ${gameState.questionIndex + 1}: ${responses.size}/${gameState.players.size} réponses`);
}

function broadcastQuestionStats() {
  const responses = gameState.responses.get(gameState.questionIndex) || new Map();
  const question = quizQuestions[gameState.questionIndex];

  const stats = question.options.map((opt, idx) => {
    const count = Array.from(responses.values()).filter(r => r.answer === idx).length;
    return { option: opt, count };
  });

  io.emit('live-stats', {
    questionIndex: gameState.questionIndex,
    stats,
    totalResponses: responses.size,
    totalPlayers: gameState.players.size
  });
}

function endQuiz() {
  gameState.isQuizActive = false;
  clearInterval(gameState.timer);

  const finalLeaderboard = Array.from(gameState.players.entries())
    .map(([id, p]) => ({
      pseudo: p.pseudo,
      score: p.score,
      correctAnswers: p.answers.filter(a => a.correct).length
    }))
    .sort((a, b) => b.score - a.score);

  io.emit('quiz-ended', {
    leaderboard: finalLeaderboard,
    totalQuestions: quizQuestions.length
  });

  console.log('Quiz terminé!');
  console.log('Classement final:', finalLeaderboard.slice(0, 3));
}

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   CHRONOS Multi-Player Quiz Server         ║
║                                            ║
║   🚀 Server running on port ${PORT}         ║
║   📱 Admin: ${BASE_URL}
║   🎮 Players: ${BASE_URL}/play
║                                            ║
║   Session Code: ${gameState.sessionCode}              ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════╝
  `);
});
