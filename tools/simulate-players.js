#!/usr/bin/env node

const { io } = require("socket.io-client");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      // support positional code
      if (!args.code) {
        args.code = part;
      }
      continue;
    }
    const [key, value] = part.split("=");
    const normalizedKey = key.slice(2);
    if (value !== undefined) {
      args[normalizedKey] = value;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[normalizedKey] = next;
      i += 1;
    } else {
      args[normalizedKey] = true;
    }
  }
  return args;
}

function toInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const args = parseArgs(process.argv);

const config = {
  players: toInt(args.players, 20),
  code: args.code || args.quiz || "",
  url: args.url || "http://localhost:3000",
  namePrefix: args.prefix || "Bot",
  minDelay: Math.max(toInt(args.minDelay, 800), 0),
  maxDelay: Math.max(toInt(args.maxDelay, 4000), 500),
  quiet: Boolean(args.quiet),
};

if (!config.code) {
  console.error(
    "Usage: node tools/simulate-players.js --code 1234 [--players 50] [--url http://host:3000]"
  );
  process.exit(1);
}

if (config.minDelay > config.maxDelay) {
  const tmp = config.minDelay;
  config.minDelay = config.maxDelay;
  config.maxDelay = tmp;
}

const bots = [];

function log(...messages) {
  if (config.quiet) {
    return;
  }
  console.log(new Date().toISOString(), ...messages);
}

function createBot(index) {
  const name =
    config.namePrefix +
    "-" +
    String(index + 1).padStart(String(config.players).length, "0");
  const socket = io(config.url, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: false,
  });

  const botState = {
    name,
    socket,
    pendingTimeout: null,
  };
  bots.push(botState);

  socket.on("connect", () => {
    log(`[${name}] connected`);
    socket.emit("player:join", { code: config.code, name });
  });

  socket.on("player:joinRejected", ({ reason }) => {
    log(`[${name}] join rejected: ${reason}`);
    socket.disconnect();
  });

  socket.on("player:joined", () => {
    log(`[${name}] joined quiz`);
  });

  socket.on("phase:question", (payload) => {
    if (botState.pendingTimeout) {
      clearTimeout(botState.pendingTimeout);
      botState.pendingTimeout = null;
    }
    const msLimit = (payload.timeLimitSeconds || 25) * 1000;
    const min = Math.min(config.minDelay, Math.max(msLimit - 500, 0));
    const max = Math.min(config.maxDelay, Math.max(msLimit - 250, min));
    const delay =
      min + Math.floor(Math.random() * Math.max(max - min, 1));
    const answerIndex = Math.floor(
      Math.random() * payload.question.options.length
    );
    botState.pendingTimeout = setTimeout(() => {
      socket.emit("player:answer", {
        questionId: payload.question.id,
        choiceIndex: answerIndex,
      });
      log(
        `[${name}] answered question ${payload.questionIndex + 1} with option ${
          answerIndex + 1
        }`
      );
    }, delay);
  });

  socket.on("phase:review", () => {
    if (botState.pendingTimeout) {
      clearTimeout(botState.pendingTimeout);
      botState.pendingTimeout = null;
    }
  });

  socket.on("game:reset", () => {
    if (botState.pendingTimeout) {
      clearTimeout(botState.pendingTimeout);
      botState.pendingTimeout = null;
    }
    log(`[${name}] game reset by host`);
  });

  socket.on("disconnect", (reason) => {
    if (botState.pendingTimeout) {
      clearTimeout(botState.pendingTimeout);
      botState.pendingTimeout = null;
    }
    log(`[${name}] disconnected (${reason})`);
  });
}

for (let i = 0; i < config.players; i += 1) {
  createBot(i);
}

log(
  `Spawned ${config.players} simulated players. Press Ctrl+C to stop them.`
);
