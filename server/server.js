const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Store connected players
const players = new Map();

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    socket.on('player-join', (data) => {
        players.set(socket.id, {
            id: socket.id,
            name: data.name,
            plants: [],
            joinTime: Date.now()
        });
        
        // Send current online friends to all players
        const friendsList = Array.from(players.values()).map(p => ({
            id: p.id,
            name: p.name
        }));
        
        io.emit('friends-update', friendsList);
        console.log(`${data.name} joined the garden!`);
    });
    
    socket.on('plant-found', (plant) => {
        const player = players.get(socket.id);
        if (player) {
            player.plants.push(plant);
            
            // Broadcast to other players that someone found a plant
            socket.broadcast.emit('player-found-plant', {
                playerName: player.name,
                plantName: plant.name
            });
        }
    });
    
    socket.on('trade-request', (data) => {
        const targetSocket = data.targetPlayerId;
        socket.to(targetSocket).emit('trade-request', {
            from: players.get(socket.id),
            plant: data.plant
        });
    });
    
    socket.on('disconnect', () => {
        players.delete(socket.id);
        
        // Update friends list for remaining players
        const friendsList = Array.from(players.values()).map(p => ({
            id: p.id,
            name: p.name
        }));
        
        io.emit('friends-update', friendsList);
        console.log('Player disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌱 Plant RPG Server running on port ${PORT}`);
});