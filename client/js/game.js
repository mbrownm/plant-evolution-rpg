class PlantRPG {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.socket = io();
        this.player = {
            name: '',
            plants: [],
            friends: []
        };
        this.gameState = 'menu';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupSocketEvents();
        this.gameLoop();
        
        // Get player name
        this.player.name = prompt('Enter your plant collector name:') || 'Anonymous Gardener';
        document.getElementById('player-name').textContent = this.player.name;
        
        this.socket.emit('player-join', { name: this.player.name });
    }
    
    setupEventListeners() {
        document.getElementById('explore-btn').addEventListener('click', () => {
            this.explorePlants();
        });
        
        document.getElementById('care-btn').addEventListener('click', () => {
            this.carePlants();
        });
        
        document.getElementById('trade-btn').addEventListener('click', () => {
            this.openTrading();
        });
    }
    
    setupSocketEvents() {
        this.socket.on('friends-update', (friends) => {
            this.updateFriendsList(friends);
        });
        
        this.socket.on('plant-discovered', (plant) => {
            this.addPlant(plant);
        });
        
        this.socket.on('trade-request', (data) => {
            this.handleTradeRequest(data);
        });
    }
    
    explorePlants() {
        // Simple plant discovery mechanic
        const discoveries = [
            { name: '🌱 Tiny Sprout', rarity: 'common', stage: 0 },
            { name: '🌿 Green Herb', rarity: 'common', stage: 1 },
            { name: '🌺 Pink Bloom', rarity: 'uncommon', stage: 2 },
            { name: '🌳 Oak Sapling', rarity: 'rare', stage: 1 },
            { name: '🌵 Desert Spike', rarity: 'rare', stage: 2 },
            { name: '🌸 Cherry Blossom', rarity: 'epic', stage: 3 }
        ];
        
        const chance = Math.random();
        let found = null;
        
        if (chance < 0.6) { // 60% chance common
            found = discoveries.filter(p => p.rarity === 'common')[Math.floor(Math.random() * 2)];
        } else if (chance < 0.85) { // 25% chance uncommon
            found = discoveries.find(p => p.rarity === 'uncommon');
        } else if (chance < 0.95) { // 10% chance rare
            found = discoveries.filter(p => p.rarity === 'rare')[Math.floor(Math.random() * 2)];
        } else { // 5% chance epic
            found = discoveries.find(p => p.rarity === 'epic');
        }
        
        if (found) {
            found.id = Date.now();
            found.health = 100;
            found.lastCared = Date.now();
            this.addPlant(found);
            this.socket.emit('plant-found', found);
        }
    }
    
    addPlant(plant) {
        this.player.plants.push(plant);
        this.updatePlantsList();
        document.getElementById('plant-count').textContent = `Plants: ${this.player.plants.length}`;
    }
    
    updatePlantsList() {
        const plantList = document.getElementById('plant-list');
        plantList.innerHTML = '';
        
        this.player.plants.forEach(plant => {
            const plantDiv = document.createElement('div');
            plantDiv.className = 'plant-item';
            plantDiv.innerHTML = `
                <span>${plant.name}</span>
                <span class="${plant.rarity}">${plant.rarity}</span>
            `;
            plantList.appendChild(plantDiv);
        });
    }
    
    carePlants() {
        this.player.plants.forEach(plant => {
            plant.health = Math.min(100, plant.health + 10);
            plant.lastCared = Date.now();
        });
        alert('🌱 All plants have been cared for! +10 health');
        this.updatePlantsList();
    }
    
    updateFriendsList(friends) {
        const friendsList = document.getElementById('friends-list');
        friendsList.innerHTML = '';
        
        friends.forEach(friend => {
            const friendDiv = document.createElement('div');
            friendDiv.className = 'friend-online';
            friendDiv.textContent = `🟢 ${friend.name}`;
            friendsList.appendChild(friendDiv);
        });
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#e8f5e8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw garden background
        this.drawGarden();
        
        // Draw plants if any
        this.drawPlants();
    }
    
    drawGarden() {
        // Simple garden grid
        this.ctx.strokeStyle = '#c8e6c9';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }
    
    drawPlants() {
        this.player.plants.forEach((plant, index) => {
            const x = 100 + (index % 6) * 100;
            const y = 100 + Math.floor(index / 6) * 100;
            
            // Draw plant pot
            this.ctx.fillStyle = '#8d6e63';
            this.ctx.fillRect(x - 20, y + 10, 40, 20);
            
            // Draw plant emoji (simple for now)
            this.ctx.font = '24px Arial';
            this.ctx.fillText(plant.name.split(' ')[0], x - 12, y);
        });
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new PlantRPG();
});