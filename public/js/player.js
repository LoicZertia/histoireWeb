class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  emit(eventName, ...args) {
    const listeners = this.events[eventName];
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }
}

const socket = new EventEmitter();
const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  socket.emit('connect');
};

ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    if (message.event) {
        socket.emit(message.event, message.data);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
  socket.emit('disconnect');
};

function emitToServer(eventName, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: eventName, data: data }));
    }
}

const joinForm = document.getElementById('join-form');
const playerNameInput = document.getElementById('player-name');
const gameCodeInput = document.getElementById('game-code');
const joinError = document.getElementById('join-error');
const joinSection = document.getElementById('join-section');
const gameSection = document.getElementById('game-section');
const gameHeading = document.getElementById('game-heading');
const questionArea = document.getElementById('question-area');
const playerTimerEl = document.getElementById('player-timer');
const playerScoreEl = document.getElementById('player-score');
const playerLeaderboardEl = document.getElementById('player-leaderboard');
const playerStatusEl = document.getElementById('player-status');

const answerButtonTemplate = document.getElementById('answer-button-template');
const leaderboardItemTemplate = document.getElementById('leaderboard-item-template');

const state = {
  playerName: '',
  gameCode: '',
  currentScore: 0,
  hasAnswered: false,
  timerInterval: null,
  timerRemaining: 0,
};

// Players must type the code manually (no auto-fill from URL)
// This ensures they see and remember the game code

function showError(message) {
  joinError.textContent = message;
  joinError.classList.remove('hidden');
  setTimeout(() => {
    joinError.classList.add('hidden');
  }, 5000);
}

function clearTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  playerTimerEl.classList.add('hidden');
  state.timerRemaining = 0;
}

function startTimer(seconds, elapsedMs = 0) {
  clearTimer();
  const elapsedSeconds = Math.floor((elapsedMs || 0) / 1000);
  state.timerRemaining = Math.max(seconds - elapsedSeconds, 0);
  playerTimerEl.textContent = state.timerRemaining.toString();
  playerTimerEl.classList.remove('hidden');
  
  if (state.timerRemaining <= 0) {
    playerTimerEl.textContent = '0';
    return;
  }
  
  state.timerInterval = setInterval(() => {
    state.timerRemaining -= 1;
    if (state.timerRemaining <= 0) {
      clearTimer();
      playerTimerEl.textContent = '0';
      playerTimerEl.classList.remove('hidden');
      return;
    }
    playerTimerEl.textContent = state.timerRemaining.toString();
  }, 1000);
}

function updateScore(score) {
  state.currentScore = score;
  const scoreStrong = playerScoreEl.querySelector('strong');
  if (scoreStrong) {
    scoreStrong.textContent = score.toString();
  }
  playerScoreEl.classList.remove('hidden');
}

function renderLeaderboard(entries) {
  playerLeaderboardEl.innerHTML = '';
  
  if (!Array.isArray(entries) || entries.length === 0) {
    const fallback = document.createElement('li');
    fallback.textContent = 'En attente des premiers scores...';
    playerLeaderboardEl.appendChild(fallback);
    return;
  }

  entries.forEach((entry, index) => {
    const fragment = leaderboardItemTemplate.content.cloneNode(true);
    fragment.querySelector('.rank').textContent = `${index + 1}`;
    fragment.querySelector('.name').textContent = entry.name;
    fragment.querySelector('.score').textContent = `${entry.score} pts`;
    
    // Highlight myself
    const li = fragment.querySelector('li');
    if (entry.name === state.playerName) {
      li.classList.add('highlight');
    }
    
    playerLeaderboardEl.appendChild(fragment);
  });
}

function showWaitingState(message = 'En attente du prochain round...') {
  questionArea.className = 'question-area waiting';
  questionArea.innerHTML = `<p>${message}</p>`;
  state.hasAnswered = false;
}

function showVideoState(payload) {
  gameHeading.textContent = `Vidéo : ${payload.inventor}`;
  questionArea.className = 'question-area video';
  
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-container';
  
  const video = document.createElement('video');
  video.src = payload.video.src;
  video.setAttribute('controls', 'true');
  video.setAttribute('playsinline', 'true');
  video.setAttribute('autoplay', 'true');
  
  const summary = document.createElement('p');
  summary.textContent = payload.video.summary || '';
  
  videoContainer.append(video, summary);
  questionArea.innerHTML = '';
  questionArea.appendChild(videoContainer);
  
  clearTimer();
}

function showQuestionState(payload) {
  gameHeading.textContent = `Question ${payload.questionIndex + 1}`;
  questionArea.className = 'question-area question';
  questionArea.innerHTML = '';
  
  const questionText = document.createElement('h3');
  questionText.textContent = payload.question.text;
  questionArea.appendChild(questionText);
  
  const choicesGrid = document.createElement('div');
  choicesGrid.className = 'answer-grid';
  
  payload.question.options.forEach((option, index) => {
    const fragment = answerButtonTemplate.content.cloneNode(true);
    const button = fragment.querySelector('button');
    button.textContent = option;
    button.dataset.index = index;
    
    button.addEventListener('click', () => {
      if (state.hasAnswered) return;
      
      state.hasAnswered = true;
      emitToServer('player:answer', { choiceIndex: index });
      
      // Disable all buttons
      choicesGrid.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.index === index.toString()) {
          btn.classList.add('selected');
        }
      });
    });
    
    choicesGrid.appendChild(fragment);
  });
  
  questionArea.appendChild(choicesGrid);
  state.hasAnswered = false;
  
  startTimer(payload.timeLimitSeconds, payload.elapsedMs || 0);
}

function showReviewState(payload) {
  gameHeading.textContent = 'Correction';
  questionArea.className = 'question-area review';
  questionArea.innerHTML = '';
  
  const questionText = document.createElement('h3');
  questionText.textContent = payload.question.text;
  questionArea.appendChild(questionText);
  
  const choicesGrid = document.createElement('div');
  choicesGrid.className = 'answer-grid';
  
  payload.question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = option;
    button.disabled = true;
    
    if (index === payload.question.correctIndex) {
      button.classList.add('correct');
    }
    
    choicesGrid.appendChild(button);
  });
  
  questionArea.appendChild(choicesGrid);
  
  if (payload.question.explanation) {
    const explanation = document.createElement('p');
    explanation.className = 'explanation';
    explanation.textContent = payload.question.explanation;
    questionArea.appendChild(explanation);
  }
  
  clearTimer();
  
  if (payload.leaderboard) {
    renderLeaderboard(payload.leaderboard);
    
    // Update my score
    const myEntry = payload.leaderboard.find(e => e.name === state.playerName);
    if (myEntry) {
      updateScore(myEntry.score);
    }
  }
}

function showFinishedState(payload) {
  gameHeading.textContent = 'Quiz terminé !';
  questionArea.className = 'question-area finished';
  questionArea.innerHTML = '';
  
  const message = document.createElement('h3');
  message.textContent = 'Merci d\'avoir participé !';
  questionArea.appendChild(message);
  
  const finalScore = document.createElement('p');
  finalScore.className = 'final-score';
  finalScore.innerHTML = `Votre score final : <strong>${state.currentScore}</strong> points`;
  questionArea.appendChild(finalScore);
  
  clearTimer();
  
  if (payload.leaderboard) {
    renderLeaderboard(payload.leaderboard);
  }
}

joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = playerNameInput.value.trim();
  const code = gameCodeInput.value.trim();
  
  if (!name || !code) {
    showError('Veuillez remplir tous les champs');
    return;
  }
  
  if (code.length !== 4) {
    showError('Le code doit contenir 4 chiffres');
    return;
  }
  
  state.playerName = name;
  state.gameCode = code;
  
  emitToServer('player:join', { name, code });
});

socket.on('player:joined', (data) => {
  joinSection.classList.add('hidden');
  gameSection.classList.remove('hidden');
  playerStatusEl.textContent = `Connecté en tant que ${state.playerName}`;
  showWaitingState('En attente du début de la partie...');
  
  if (data.leaderboard) {
    renderLeaderboard(data.leaderboard);
  }
});

socket.on('player:joinRejected', (data) => {
  showError(data.reason || 'Impossible de rejoindre la partie');
});

socket.on('phase:video', (payload) => {
  showVideoState(payload);
});

socket.on('phase:question', (payload) => {
  showQuestionState(payload);
});

socket.on('phase:review', (payload) => {
  showReviewState(payload);
});

socket.on('phase:finished', (payload) => {
  showFinishedState(payload);
});

socket.on('player:answerRegistered', () => {
  // Answer was successfully recorded
  console.log('Answer registered');
});

socket.on('disconnect', () => {
  clearTimer();
  gameHeading.textContent = 'Connexion perdue';
  showWaitingState('Connexion au serveur perdue. Actualisez la page.');
  playerStatusEl.textContent = 'Déconnecté';
});
