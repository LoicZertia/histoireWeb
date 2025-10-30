## Quiz Hist Web

Real-time quiz inspired by Kahoot for a 10 minute talk on the history of the web. Four inventors are showcased with short videos followed by two questions each. The host projects the control screen, the audience answers from their phones after joining with a room code or the QR code.

### 1. Installation

```bash
npm install
```

### 2. Start the server

```bash
npm run dev
```

The Socket.IO server listens on `http://localhost:3000`.

### 3. Run a session

- **Host**: open `http://localhost:3000/` on the computer connected to the projector, then click "Nouvelle salle" (or reload) to generate a fresh join code.
- **Players**: open `http://<host-ip>:3000/player` on their phone and enter the 4 digit code displayed on the host screen.
- The QR code automatically uses the detected LAN IP and port. Extra URLs appear under the QR so you can double-check which address is reachable. The QR image is served by `https://api.qrserver.com`, so keep an Internet connection to display it.
- The host dashboard now keeps only essential blocks on screen: large stage area (video/questions), controls strip, a compact top 5 leaderboard, and a player list that shows the first 12 names then `+N` if needed.
- On the player view, the score pill updates live, the question layout mirrors Kahoot timing, and the correction step highlights the chosen answer.
- Once everyone is connected, the host launches the round. Each block flows **video -> question 1 -> correction -> question 2 -> correction**. Use the "Phase suivante" button to progress.

### 4. Content overview

- 4 inventors: Vannevar Bush, Ray Tomlinson, Tim Berners-Lee, Vitalik Buterin.
- 8 questions (2 per inventor), 25 seconds per question, score depends on speed (400 to 1000 points).
- Live leaderboard and automatic podium at the end.

Video files live in `public/assets/videos/*.mp4`. Update the paths in `config/gameContent.js` if you swap the assets.

### 5. Project structure

- `server.js`: Express + Socket.IO server, game state machine, scoring, timers.
- `config/gameContent.js`: round configuration (videos, questions, explanations).
- `public/index.html`: host interface (lobby, video controls, scoreboard, corrections).
- `public/player.html`: player interface (join flow, answers, leaderboard).
- `public/js/host.js` & `public/js/player.js`: real-time front-end controllers.
- `public/css/style.css`: shared responsive styles.

### 6. Before the presentation

1. Start the server on the presentation laptop and test locally.
2. Display the host interface on the projector and run a quick trial with a few phones.
3. Use "Reinitialiser" to clear old connections before the real session.
4. Restart `npm run dev` if you need a brand-new join code.

The app handles 60+ simultaneous players (state kept in memory on the server). No persistent storage: restarting the process resets the game.


### 7. Simulate many players

A load-test helper lives in `tools/simulate-players.js`. It spawns fake Socket.IO clients that join a room and answer at random within a configurable delay.

```bash
node tools/simulate-players.js --code 1234 --players 70 --url http://<host-ip>:3000
```

Options:
- `--players` (default 20): number of simulated phones.
- `--min-delay` / `--max-delay` (ms): window before each bot answers.
- `--prefix`: change the bot name prefix (default `Bot`).
- `--quiet`: silence per-bot logs.

Start the server and obtain the join code first, then run the command from another terminal. Stop the simulation with `Ctrl+C` when finished.
