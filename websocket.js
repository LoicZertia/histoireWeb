const crypto = require('crypto');
const clients = new Map();

function parseWebSocketFrame(buffer) {
    const firstByte = buffer.readUInt8(0);
    const opCode = firstByte & 0x0f;

    if (opCode === 0x8) { // Close frame
        return null;
    }
    if (opCode !== 0x1) { // Text frame
        return;
    }

    const secondByte = buffer.readUInt8(1);
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLength = secondByte & 0x7f;
    let maskOffset = 2;

    if (payloadLength === 126) {
        payloadLength = buffer.readUInt16BE(2);
        maskOffset = 4;
    } else if (payloadLength === 127) {
        payloadLength = buffer.readBigUInt64BE(2);
        maskOffset = 10;
    }

    let payload;
    if (isMasked) {
        const mask = buffer.slice(maskOffset, maskOffset + 4);
        const payloadBuffer = buffer.slice(maskOffset + 4);
        payload = Buffer.alloc(payloadLength);
        for (let i = 0; i < payloadLength; i++) {
            payload[i] = payloadBuffer[i] ^ mask[i % 4];
        }
    } else {
        payload = buffer.slice(maskOffset);
    }

    return payload.toString('utf8');
}

function sendWebSocketMessage(socket, event, data) {
    if (!socket || socket.destroyed || !socket.writable) {
        return;
    }
    
    try {
        const message = JSON.stringify({ event, data });
        const payload = Buffer.from(message, 'utf8');
        const payloadLength = payload.length;

        let header;
        if (payloadLength < 126) {
            header = Buffer.alloc(2);
            header.writeUInt8(0x81, 0); // FIN + Text Frame
            header.writeUInt8(payloadLength, 1);
        } else if (payloadLength < 65536) {
            header = Buffer.alloc(4);
            header.writeUInt8(0x81, 0); // FIN + Text Frame
            header.writeUInt8(126, 1);
            header.writeUInt16BE(payloadLength, 2);
        } else {
            header = Buffer.alloc(10);
            header.writeUInt8(0x81, 0); // FIN + Text Frame
            header.writeUInt8(127, 1);
            header.writeBigUInt64BE(BigInt(payloadLength), 2);
        }

        socket.write(Buffer.concat([header, payload]));
    } catch (error) {
        console.error('Error sending WebSocket message:', error.code || error.message);
    }
}

function broadcast(event, data, except = []) {
    for (const [clientId, clientSocket] of clients.entries()) {
        if (!except.includes(clientId)) {
            sendWebSocketMessage(clientSocket, event, data);
        }
    }
}

function createWebSocketServer(server) {
    server.on('upgrade', (req, socket, head) => {
        const key = req.headers['sec-websocket-key'];
        const hash = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
        const id = crypto.randomBytes(16).toString('hex');

        socket.write(
            'HTTP/1.1 101 Switching Protocols\r\n' +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            `Sec-WebSocket-Accept: ${hash}\r\n` +
            '\r\n'
        );

        clients.set(id, socket);
        socket.id = id;

        // Add error handler FIRST to catch any errors before other handlers
        socket.on('error', (error) => {
            console.error('WebSocket error:', error.code || error.message);
            try {
                clients.delete(socket.id);
                server.emit('websocket-close', socket.id);
            } catch (e) {
                // Ignore cleanup errors
            }
        });

        socket.on('data', (buffer) => {
            try {
                const message = parseWebSocketFrame(buffer);
                if (message) {
                    try {
                        const { event, data } = JSON.parse(message);
                        server.emit('websocket-message', { socket, event, data });
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                }
            } catch (error) {
                console.error('Error processing WebSocket data:', error);
            }
        });

        socket.on('close', () => {
            try {
                clients.delete(socket.id);
                server.emit('websocket-close', socket.id);
            } catch (error) {
                // Ignore cleanup errors
            }
        });
    });
}

module.exports = {
    createWebSocketServer,
    sendWebSocketMessage,
    broadcast,
    clients,
};
