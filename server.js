const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const game = require('./game');
const ws = require('./websocket');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function serveFile(filePath, res) {
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

function getLocalIPv4Addresses() {
    const interfaces = os.networkInterfaces();
    const results = [];
    for (const name of Object.keys(interfaces)) {
        for (const details of interfaces[name] || []) {
            if (details.family === 'IPv4' && !details.internal) {
                results.push(details.address);
            }
        }
    }
    return Array.from(new Set(results));
}

const server = http.createServer((req, res) => {
    // Add error handler to each request socket (only if not already added)
    if (!req.socket._hasErrorHandler) {
        req.socket.on('error', (err) => {
            console.error('HTTP socket error:', err.code || err.message);
        });
        req.socket._hasErrorHandler = true;
    }
    
    if (req.url === '/api/server-info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            addresses: getLocalIPv4Addresses(),
            port: PORT
        }));
        return;
    }

    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    if (req.url === '/player') {
        filePath = path.join(__dirname, 'public', 'player.html');
    }

    serveFile(filePath, res);
});

ws.createWebSocketServer(server);
game.setBroadcastCallback(ws.broadcast);

server.on('websocket-message', ({ socket, event, data }) => {
    const gameState = game.getGameState();

    if (event === 'host:createGame') {
        // If there's an existing host, close its connection to force cleanup
        if (gameState.hostId && gameState.hostId !== socket.id) {
            const oldHostSocket = ws.clients.get(gameState.hostId);
            if (oldHostSocket) {
                console.log(`🔄 Closing old host connection: ${gameState.hostId}`);
                oldHostSocket.destroy();
                ws.clients.delete(gameState.hostId);
            }
        }
        
        const { code, rounds } = game.createGame(socket.id);
        console.log(`✅ Game created with code: ${code} for host: ${socket.id}`);
        ws.sendWebSocketMessage(socket, 'host:gameCreated', { code, rounds });
    } else if (event === 'host:startGame') {
        if (socket.id === gameState.hostId) {
            game.startGame();
        }
    } else if (event === 'host:nextPhase') {
        if (socket.id === gameState.hostId) {
            game.advancePhase();
        }
    } else if (event === 'host:resetGame') {
        if (socket.id === gameState.hostId) {
            const { code, rounds } = game.createGame(socket.id);
            ws.broadcast('game:reset');
            ws.sendWebSocketMessage(socket, 'host:gameCreated', { code, rounds });
        }
    } else if (event === 'player:join') {
        const { code, name } = data;
        if (code === gameState.code) {
            const { player, playersList } = game.addPlayer(socket.id, name);
            ws.sendWebSocketMessage(socket, 'player:joined', { name: player.name, leaderboard: [] });
            const hostSocket = ws.clients.get(gameState.hostId);
            if (hostSocket) {
                ws.sendWebSocketMessage(hostSocket, 'players:list', playersList);
            }
        } else {
            ws.sendWebSocketMessage(socket, 'player:joinRejected', { reason: 'Invalid game code' });
        }
    } else if (event === 'player:answer') {
        if (game.handleAnswer(socket.id, data)) {
            ws.sendWebSocketMessage(socket, 'player:answerRegistered', {});
        }
    }
});

server.on('websocket-close', (socketId) => {
    const gameState = game.getGameState();
    console.log(`WebSocket closed: ${socketId}, current host: ${gameState.hostId}`);
    if (socketId === gameState.hostId) {
        // Clear the host but keep the game state
        game.clearHost();
        ws.broadcast('host:disconnected');
    } else {
        const playersList = game.removePlayer(socketId);
        if (playersList) {
            const hostSocket = ws.clients.get(gameState.hostId);
            if (hostSocket) {
                ws.sendWebSocketMessage(hostSocket, 'players:list', playersList);
            }
        }
    }
});

// Global error handler to prevent crashes
server.on('clientError', (err, socket) => {
    console.error('Client error:', err.code || err.message);
    if (socket && socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
