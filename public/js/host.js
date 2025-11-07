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
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

// Close WebSocket before page unload to prevent zombie connections
window.addEventListener('beforeunload', () => {
  if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
    ws.close();
  }
});

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  socket.emit('connect');
  // Create game immediately when WebSocket connects
  emitToServer("host:createGame");
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

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
  socket.emit('disconnect');
  // Afficher un message à l'utilisateur
  showConnectionLost();
};

function showConnectionLost() {
  const existingWarning = document.querySelector('.connection-warning');
  if (!existingWarning) {
    const warning = document.createElement('div');
    warning.className = 'connection-warning';
    warning.innerHTML = `
      <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
                  background: #e74c3c; color: white; padding: 15px 30px; 
                  border-radius: 8px; z-index: 10000; font-size: 18px; font-weight: bold;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        ⚠️ Connexion perdue - Rechargez la page
      </div>
    `;
    document.body.appendChild(warning);
  }
}

function emitToServer(eventName, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: eventName, data: data }));
    }
}

const MAX_VISIBLE_PLAYERS = 12;
const MAX_SCOREBOARD_ENTRIES = 5;

const joinCodeEl = document.getElementById("join-code");
const joinQrEl = document.getElementById("join-qr");
const joinLinkEl = document.getElementById("join-link-text");
const networkAddressesEl = document.getElementById("network-addresses");

const startGameBtn = document.getElementById("start-game");
const nextPhaseBtn = document.getElementById("next-phase");
const resetGameBtn = document.getElementById("reset-game");
const createGameBtn = document.getElementById("create-game");

const phaseTitleEl = document.getElementById("phase-title");
const stageBodyEl = document.getElementById("stage-body");
const timerDisplayEl = document.getElementById("timer-display");
const roundProgressEl = document.getElementById("round-progress");
const videoPreloadStatusEl = document.getElementById("video-preload-status");

const playerListEl = document.getElementById("player-list");
const playerCountEl = document.getElementById("player-count");
const scoreboardListEl = document.getElementById("scoreboard-list");
const scoreboardOverlayEl = document.querySelector(".scoreboard-overlay");

const loadingOverlay = document.getElementById("loading-overlay");
const progressFill = document.getElementById("progress-fill");
const loadingStatus = document.getElementById("loading-status");

const playerItemTemplate = document.getElementById("player-list-item");
const scoreboardItemTemplate = document.getElementById(
  "scoreboard-item-template"
);

const state = {
  rounds: [],
  joinCode: null,
  joinUrlBase: `${window.location.origin.replace(/\/$/, "")}/player`,
  serverAddresses: [],
  currentPhase: "lobby",
  roundIndex: -1,
  questionIndex: -1,
  timerInterval: null,
  timerRemaining: 0,
  lastLeaderboard: [],
  videosLoaded: false,
};

function updateOverlayVisibility(entries) {
  if (!scoreboardOverlayEl) {
    return;
  }
  const hasScores = Array.isArray(entries) && entries.length > 0;
  const shouldShow =
    hasScores &&
    document.body.classList.contains("is-playing") &&
    !document.body.classList.contains("is-finished");
  scoreboardOverlayEl.classList.toggle("has-scores", shouldShow);
}

function setPlayingMode(isPlaying, isFinished = false) {
  document.body.classList.toggle("is-playing", isPlaying);
  document.body.classList.toggle("is-finished", isFinished);
  if (!isPlaying && scoreboardOverlayEl) {
    scoreboardOverlayEl.classList.remove("has-scores");
  }
  if (isFinished && scoreboardOverlayEl) {
    scoreboardOverlayEl.classList.remove("has-scores");
  }
  updateOverlayVisibility(state.lastLeaderboard);
}

function renderAddressList() {
  if (!networkAddressesEl) {
    return;
  }
  networkAddressesEl.innerHTML = "";
  if (!state.serverAddresses.length) {
    return;
  }
  state.serverAddresses.forEach((url) => {
    const li = document.createElement("li");
    li.textContent = url;
    networkAddressesEl.appendChild(li);
  });
}

function updateJoinLinkDisplay() {
  const baseUrl = state.joinUrlBase;
  if (!baseUrl) {
    return;
  }
  // Don't include code in URL - players will type it manually
  const fullUrl = baseUrl;
  if (joinLinkEl) {
    joinLinkEl.textContent = fullUrl;
  }
  if (joinQrEl) {
    joinQrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      fullUrl
    )}`;
  }
}

async function loadServerInfo() {
  // Always use the current page URL for QR code
  const protocol = window.location.protocol.replace(':', '');
  const host = window.location.host; // includes port if present
  state.joinUrlBase = `${protocol}://${host}/player`;
  
  try {
    const response = await fetch("/api/server-info", { cache: "no-store" });
    if (!response.ok) {
      updateJoinLinkDisplay();
      renderAddressList();
      return;
    }
    const data = await response.json();
    const port =
      typeof data.port === "number" && data.port > 0
        ? data.port
        : window.location.port
        ? parseInt(window.location.port, 10)
        : undefined;
    const portSuffix =
      port && port !== 80 && port !== 443 ? `:${port}` : "";

    const lanUrls = Array.isArray(data.addresses)
      ? data.addresses
          .filter((addr) => typeof addr === "string" && addr.length)
          .map((addr) => `${protocol}://${addr}${portSuffix}/player`)
      : [];

    const uniqueUrls = Array.from(
      new Set([state.joinUrlBase, ...lanUrls].filter(Boolean))
    );
    if (uniqueUrls.length) {
      state.serverAddresses = uniqueUrls;
    }
  } catch (error) {
    // Ignore network errors and keep defaults.
  }
  renderAddressList();
  updateJoinLinkDisplay();
}

function clearTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  timerDisplayEl.classList.add("hidden");
  state.timerRemaining = 0;
}

function startTimer(seconds, elapsedMs = 0) {
  clearTimer();
  const elapsedSeconds = Math.floor((elapsedMs || 0) / 1000);
  state.timerRemaining = Math.max(seconds - elapsedSeconds, 0);
  timerDisplayEl.textContent = state.timerRemaining.toString();
  timerDisplayEl.classList.remove("hidden");
  if (state.timerRemaining <= 0) {
    timerDisplayEl.textContent = "0";
    return;
  }
  state.timerInterval = setInterval(() => {
    state.timerRemaining -= 1;
    if (state.timerRemaining <= 0) {
      clearTimer();
      timerDisplayEl.textContent = "0";
      timerDisplayEl.classList.remove("hidden");
      return;
    }
    timerDisplayEl.textContent = state.timerRemaining.toString();
  }, 1000);
}

function setRoundProgress(text) {
  if (!roundProgressEl) {
    return;
  }
  roundProgressEl.textContent = text || "";
}

function setStageContent(contentNode, { full = false } = {}) {
  stageBodyEl.innerHTML = "";
  stageBodyEl.classList.toggle("full", full);
  stageBodyEl.appendChild(contentNode);
}

function renderPlayerList(players) {
  playerListEl.innerHTML = "";
  const totalPlayers = players.length;
  playerCountEl.textContent = totalPlayers.toString();

  players.slice(0, MAX_VISIBLE_PLAYERS).forEach((player) => {
    const fragment = playerItemTemplate.content.cloneNode(true);
    const item = fragment.querySelector("li");
    item.classList.toggle("offline", !player.isConnected);
    item.querySelector(".name").textContent = player.name;
    item.querySelector(".score").textContent = `${player.score} pts`;
    playerListEl.appendChild(fragment);
  });

  if (totalPlayers > MAX_VISIBLE_PLAYERS) {
    const extra = document.createElement("li");
    extra.className = "player-list-item more";
    extra.textContent = `+${totalPlayers - MAX_VISIBLE_PLAYERS} joueurs`;
    playerListEl.appendChild(extra);
  }

  startGameBtn.disabled =
    totalPlayers === 0 || state.currentPhase !== "lobby";
}

function renderLeaderboard(entries) {
  const hasScores = Array.isArray(entries) && entries.length > 0;
  state.lastLeaderboard = hasScores ? entries.slice() : [];
  updateOverlayVisibility(state.lastLeaderboard);

  scoreboardListEl.innerHTML = "";
  if (!hasScores) {
    const fallback = document.createElement("li");
    fallback.className = "scoreboard-item";
    fallback.textContent = "En attente des premieres reponses.";
    scoreboardListEl.appendChild(fallback);
    return;
  }

  state.lastLeaderboard.slice(0, MAX_SCOREBOARD_ENTRIES).forEach((entry, index) => {
    const fragment = scoreboardItemTemplate.content.cloneNode(true);
    fragment.querySelector(".rank").textContent = `${index + 1}`;
    fragment.querySelector(".name").textContent = entry.name;
    fragment.querySelector(".points").textContent = `${entry.score} pts`;
    scoreboardListEl.appendChild(fragment);
  });
}

function setLobbyStage() {
  state.currentPhase = "lobby";
  state.roundIndex = -1;
  state.questionIndex = -1;
  setPlayingMode(false);
  if (scoreboardOverlayEl) {
    scoreboardOverlayEl.classList.remove("has-scores");
  }
  phaseTitleEl.textContent = "Salle d'attente";
  setRoundProgress("");
  clearTimer();
  nextPhaseBtn.disabled = true;
  startGameBtn.disabled = playerListEl.children.length === 0;

  const placeholder = document.createElement("div");
  placeholder.className = "stage-placeholder";
  placeholder.innerHTML =
    '<p>Projetez cette fenetre et demandez aux joueurs de scanner le QR code ou de saisir le code.</p><p>Cliquez sur "Lancer" quand tout le monde est pret.</p>';
  setStageContent(placeholder);
  renderLeaderboard([]);
}

function showVideoStage(payload) {
  setPlayingMode(true);
  state.currentPhase = "video";
  state.roundIndex = payload.roundIndex;
  state.questionIndex = -1;
  phaseTitleEl.textContent = `Vidéo : ${payload.inventor}`;
  const totalRounds = state.rounds.length || "?";
  setRoundProgress(`Manche ${payload.roundIndex + 1}/${totalRounds} - Vidéo`);
  clearTimer();
  nextPhaseBtn.disabled = false;
  nextPhaseBtn.textContent = "Passer au quiz ➔";
  startGameBtn.disabled = true;

  const container = document.createElement("div");
  container.className = "stage-video-manual";
  
  const icon = document.createElement("div");
  icon.className = "video-icon";
  icon.innerHTML = "🎬";
  
  const title = document.createElement("h2");
  title.textContent = `Visionnez la vidéo : ${payload.inventor}`;
  
  const instruction = document.createElement("p");
  instruction.className = "video-instruction";
  instruction.innerHTML = `Ouvrez le fichier <strong>${payload.video.src.split('/').pop()}</strong> sur votre ordinateur<br>et lancez la vidéo manuellement.`;
  
  const summary = document.createElement("p");
  summary.className = "video-summary";
  summary.textContent = payload.video.summary;
  
  const continueBtn = document.createElement("button");
  continueBtn.className = "primary big-btn";
  continueBtn.textContent = "Passer aux questions ➔";
  continueBtn.addEventListener("click", () => {
    emitToServer("host:nextPhase");
  });

  container.append(icon, title, instruction, summary, continueBtn);
  setStageContent(container, { full: true });
}

function showQuestionStage(payload) {
  setPlayingMode(true);
  state.currentPhase = "question";
  state.questionIndex = payload.questionIndex;
  const round = state.rounds[payload.roundIndex];
  const totalRounds = state.rounds.length || "?";
  const totalQuestions = round ? round.questionCount : payload.questionIndex + 1;

  phaseTitleEl.textContent = `Question ${payload.questionIndex + 1}`;
  setRoundProgress(
    `Manche ${payload.roundIndex + 1}/${totalRounds} - Question ${
      payload.questionIndex + 1
    }/${totalQuestions}`
  );

  startTimer(payload.timeLimitSeconds, payload.elapsedMs || 0);
  nextPhaseBtn.disabled = false;
  nextPhaseBtn.textContent = "Afficher correction";

  const wrapper = document.createElement("div");
  wrapper.className = "stage-question";
  const title = document.createElement("h3");
  title.textContent = payload.question.text;
  wrapper.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "answer-grid";
  payload.question.options.forEach((option) => {
    const pill = document.createElement("div");
    pill.className = "answer-pill";
    pill.textContent = option;
    grid.appendChild(pill);
  });

  wrapper.appendChild(grid);
  setStageContent(wrapper);
}

function showReviewStage(payload) {
  setPlayingMode(true);
  state.currentPhase = "review";
  clearTimer();
  nextPhaseBtn.disabled = false;
  nextPhaseBtn.textContent = "Suivant";

  const round = state.rounds[payload.roundIndex];
  const totalRounds = state.rounds.length || "?";
  const totalQuestions = round ? round.questionCount : payload.questionIndex + 1;

  phaseTitleEl.textContent = "Correction";
  setRoundProgress(
    `Manche ${payload.roundIndex + 1}/${totalRounds} - Question ${
      payload.questionIndex + 1
    }/${totalQuestions}`
  );

  const wrapper = document.createElement("div");
  wrapper.className = "stage-review";
  const title = document.createElement("h3");
  title.textContent = payload.question.text;
  wrapper.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "answer-grid";
  payload.question.options.forEach((option, index) => {
    const pill = document.createElement("div");
    pill.className = "answer-pill";
    pill.textContent = option;
    if (index === payload.question.correctIndex) {
      pill.classList.add("correct");
    }
    const selections = payload.results.filter(
      (result) => result.choiceIndex === index
    );
    if (selections.length) {
      pill.classList.add("selected");
      const badge = document.createElement("span");
      badge.className = "answer-count";
      badge.textContent = selections.length + " joueurs";
      pill.appendChild(badge);
      if (selections.some((result) => !result.correct)) {
        pill.classList.add("wrong");
      }
    }
    grid.appendChild(pill);
  });
  wrapper.appendChild(grid);

  if (payload.question.explanation) {
    const explanation = document.createElement("p");
    explanation.className = "explanation";
    explanation.textContent = payload.question.explanation;
    wrapper.appendChild(explanation);
  }

  const stats = document.createElement("p");
  const correctCount = payload.results.filter((result) => result.correct).length;
  stats.textContent = `Bonnes reponses : ${correctCount} / ${payload.results.length}`;
  wrapper.appendChild(stats);

  setStageContent(wrapper);
  renderLeaderboard(payload.leaderboard);
}

function showFinishedStage(payload) {
  setPlayingMode(true, true);
  if (scoreboardOverlayEl) {
    scoreboardOverlayEl.classList.remove("has-scores");
  }

  state.currentPhase = "finished";
  clearTimer();
  nextPhaseBtn.disabled = true;
  startGameBtn.disabled = true;
  phaseTitleEl.textContent = "Fin du quiz";
  setRoundProgress("");

  const wrapper = document.createElement("div");
  wrapper.className = "stage-review";

  const title = document.createElement("h3");
  title.textContent = "Merci d'avoir joue !";
  wrapper.appendChild(title);

  if (payload.leaderboard && payload.leaderboard.length) {
    const podium = document.createElement("ol");
    podium.className = "scoreboard-list";
    payload.leaderboard.slice(0, 3).forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "scoreboard-item";
      item.innerHTML = `<span class="rank">${index + 1}</span><span class="name">${
        entry.name
      }</span><span class="points">${entry.score} pts</span>`;
      podium.appendChild(item);
    });
    wrapper.appendChild(podium);
  } else {
    const message = document.createElement("p");
    message.textContent = "Aucun score disponible.";
    wrapper.appendChild(message);
  }

  setStageContent(wrapper);
  renderLeaderboard(payload.leaderboard || []);
}

// Preload videos function - DISABLED (videos played manually outside app)
async function preloadVideos() {
  // No video preloading needed - videos are played manually
  state.videosLoaded = true;
  
  // Hide loading overlay immediately
  setTimeout(() => {
    loadingOverlay.classList.add('loaded');
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 500);
  }, 300);
}

// Start preloading when page loads
preloadVideos();

loadServerInfo();

createGameBtn.addEventListener("click", () => {
  // Reload the page to create a fresh game session
  window.location.reload();
});

startGameBtn.addEventListener("click", () => {
  if (!state.videosLoaded) {
    alert("Veuillez attendre la fin du chargement des vidéos.");
    return;
  }
  emitToServer("host:startGame");
});

nextPhaseBtn.addEventListener("click", () => {
  emitToServer("host:nextPhase");
});

resetGameBtn.addEventListener("click", () => {
  if (!window.confirm("Reinitialiser la salle et deconnecter les joueurs ?")) {
    return;
  }
  emitToServer("host:resetGame");
});

socket.on("connect", () => {
  emitToServer("host:createGame");
});

socket.on("host:gameCreated", (data) => {
  const { code, rounds } = data;
  state.joinCode = code;
  state.rounds = rounds || [];
  joinCodeEl.textContent = code;
  updateJoinLinkDisplay();
  setLobbyStage();
});

socket.on("host:gameReset", () => {
  setLobbyStage();
});

socket.on("players:list", (players) => {
  renderPlayerList(players);
});

socket.on("leaderboard:update", (entries) => {
  renderLeaderboard(entries);
});

socket.on("phase:video", (payload) => {
  showVideoStage(payload);
});

socket.on("phase:question", (payload) => {
  showQuestionStage(payload);
});

socket.on("phase:review", (payload) => {
  showReviewStage(payload);
});

socket.on("phase:finished", (payload) => {
  showFinishedStage(payload);
});

socket.on("game:reset", () => {
  setLobbyStage();
});

socket.on("host:error", ({ message }) => {
  window.alert(message);
});

socket.on("disconnect", () => {
  clearTimer();
  nextPhaseBtn.disabled = true;
  startGameBtn.disabled = true;
  setPlayingMode(false);
  if (scoreboardOverlayEl) {
    scoreboardOverlayEl.classList.remove("has-scores");
  }
  phaseTitleEl.textContent = "Connexion perdue. Actualisez la page pour recreer la salle.";
  setRoundProgress("");
  const placeholder = document.createElement("div");
  placeholder.className = "stage-placeholder";
  placeholder.innerHTML =
    "<p>Connexion perdue avec le serveur.</p><p>Actualisez cette page pour rouvrir une salle.</p>";
  setStageContent(placeholder);
  renderLeaderboard([]);
});
