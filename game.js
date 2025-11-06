const { rounds, QUESTION_TIME_LIMIT_SECONDS } = require('./config/gameContent');

const state = {
  code: null,
  hostId: null,
  status: 'lobby', // lobby | video | question | review | finished
  roundIndex: -1,
  questionIndex: -1,
  players: new Map(), // socket.id => { name, score, isConnected }
  questionTimer: null,
  answers: new Map(), // socket.id => { choiceIndex, timeMs }
  questionStartedAt: null,
};

let broadcastCallback = () => {};

function setBroadcastCallback(callback) {
    broadcastCallback = callback;
}

function createGame(hostId) {
    state.code = Math.floor(1000 + Math.random() * 9000).toString();
    state.hostId = hostId;
    state.status = 'lobby';
    state.roundIndex = -1;
    state.questionIndex = -1;
    state.players.clear();
    state.answers.clear();
    if (state.questionTimer) {
        clearTimeout(state.questionTimer);
        state.questionTimer = null;
    }
    return {
        code: state.code,
        rounds: rounds.map(r => ({ inventor: r.inventor, questionCount: r.questions.length })),
    };
}

function addPlayer(socketId, name) {
    if (state.code) {
        const newPlayer = { name, score: 0, isConnected: true };
        state.players.set(socketId, newPlayer);
        return { player: newPlayer, playersList: Array.from(state.players.values()) };
    }
    return null;
}

function removePlayer(socketId) {
    if (state.players.has(socketId)) {
        const player = state.players.get(socketId);
        player.isConnected = false;
        return Array.from(state.players.values());
    }
    return null;
}

function startVideoPhase() {
    state.status = 'video';
    const round = rounds[state.roundIndex];
    broadcastCallback('phase:video', {
        roundIndex: state.roundIndex,
        inventor: round.inventor,
        video: round.video,
    });
}

function startQuestionPhase() {
    state.status = 'question';
    const round = rounds[state.roundIndex];
    const question = round.questions[state.questionIndex];
    state.answers.clear();
    state.questionStartedAt = Date.now();

    broadcastCallback('phase:question', {
        roundIndex: state.roundIndex,
        questionIndex: state.questionIndex,
        inventor: round.inventor,
        question: {
            id: question.id,
            text: question.text,
            options: question.options,
        },
        timeLimitSeconds: QUESTION_TIME_LIMIT_SECONDS,
    });

    state.questionTimer = setTimeout(() => {
        startReviewPhase();
    }, QUESTION_TIME_LIMIT_SECONDS * 1000);
}

function startReviewPhase() {
    if (state.questionTimer) {
        clearTimeout(state.questionTimer);
        state.questionTimer = null;
    }

    state.status = 'review';
    const round = rounds[state.roundIndex];
    const question = round.questions[state.questionIndex];
    const results = [];
    
    for (const [playerId, player] of state.players.entries()) {
        const answer = state.answers.get(playerId);
        const wasCorrect = answer && answer.choiceIndex === question.correctIndex;
        let scoreDelta = 0;
        if (wasCorrect) {
            const timeRemaining = QUESTION_TIME_LIMIT_SECONDS * 1000 - (answer.timeMs || 0);
            const ratio = Math.max(timeRemaining, 0) / (QUESTION_TIME_LIMIT_SECONDS * 1000);
            scoreDelta = Math.round(400 + 600 * ratio);
            player.score += scoreDelta;
        }
        results.push({
            socketId: playerId,
            name: player.name,
            choiceIndex: answer ? answer.choiceIndex : null,
            correct: wasCorrect,
            awarded: scoreDelta,
        });
    }

    const leaderboard = Array.from(state.players.values()).sort((a, b) => b.score - a.score);

    broadcastCallback('phase:review', {
        roundIndex: state.roundIndex,
        questionIndex: state.questionIndex,
        question: {
            id: question.id,
            text: question.text,
            options: question.options,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
        },
        results,
        leaderboard,
    });
}

function advancePhase() {
    if (state.status === 'video') {
        state.questionIndex = 0;
        startQuestionPhase();
    } else if (state.status === 'review') {
        state.questionIndex++;
        const round = rounds[state.roundIndex];
        if (state.questionIndex < round.questions.length) {
            startQuestionPhase();
        } else {
            state.roundIndex++;
            if (state.roundIndex < rounds.length) {
                startVideoPhase();
            } else {
                // End of game
                state.status = 'finished';
                broadcastCallback('phase:finished', {
                    leaderboard: Array.from(state.players.values()).sort((a, b) => b.score - a.score),
                });
            }
        }
    }
}

function handleAnswer(socketId, answer) {
    if (state.status === 'question' && state.players.has(socketId)) {
        const player = state.players.get(socketId);
        if (!state.answers.has(socketId)) {
            state.answers.set(socketId, {
                choiceIndex: answer.choiceIndex,
                timeMs: Date.now() - state.questionStartedAt,
            });
            
            if (state.answers.size === state.players.size) {
                startReviewPhase();
            }
            return true;
        }
    }
    return false;
}

function startGame() {
    state.roundIndex = 0;
    startVideoPhase();
}

function getGameState() {
    return state;
}

function clearHost() {
    // Clear host but keep the game code and players
    state.hostId = null;
}

module.exports = {
    setBroadcastCallback,
    createGame,
    addPlayer,
    removePlayer,
    advancePhase,
    handleAnswer,
    startGame,
    getGameState,
    clearHost,
};
