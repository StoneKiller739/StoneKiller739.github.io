const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelUpMessage = document.getElementById('levelUpMessage');
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

// Game world dimensions
const worldWidth = 2000;
const worldHeight = 2000;

// Player setup
let player = {
    x: worldWidth / 2,
    y: worldHeight / 2,
    size: 20,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    level: 1
};

// Food setup
let food = [];
function addFood(x, y) {
    food.push({
        x: x,
        y: y,
        size: 5,
        color: 'green'
    });
}
function generateFood(count) {
    for (let i = 0; i < count; i++) {
        addFood(Math.random() * worldWidth, Math.random() * worldHeight);
    }
}
generateFood(100);

// Handle key down event
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': // Move up
            player.dy = -player.speed;
            break;
        case 'a': // Move left
            player.dx = -player.speed;
            break;
        case 's': // Move down
            player.dy = player.speed;
            break;
        case 'd': // Move right
            player.dx = player.speed;
            break;
    }
});

// Handle key up event
document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
        case 's':
            player.dy = 0;
            break;
        case 'a':
        case 'd':
            player.dx = 0;
            break;
    }
});

// Move player and adjust viewport
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Generate food if player moves into a new area
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > worldWidth) player.x = worldWidth;
    if (player.y > worldHeight) player.y = worldHeight;
}

// Check for collisions with food
function checkCollisions() {
    food = food.filter(item => {
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size + item.size) {
            player.size += item.size * 0.1; // Player grows when eating food
            return false; // Remove food from array
        }
        return true;
    });

    // Add new food items if the count is low
    if (food.length < 100) {
        generateFood(10);
    }
}

// Check if player has reached the required size to level up
function checkLevelUp() {
    const levelUpSize = 20 + player.level * 10; // Increase size requirement for each level
    if (player.size >= levelUpSize && player.level < 50) {
        player.level++;
        player.size = 20; // Reset player size
        food = []; // Clear existing food
        generateFood(100 + player.level * 10); // Generate more food for higher levels
        showLevelUpMessage(player.level);
        startConfetti();
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw food relative to player
    food.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x - player.x + canvas.width / 2, item.y - player.y + canvas.height / 2, item.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw player in the center of the canvas
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, player.size, 0, Math.PI * 2);
    ctx.fill();
}

// Show level up message
function showLevelUpMessage(level) {
    levelUpMessage.textContent = `Congratulations! You've reached Level ${level}!`;
    levelUpMessage.style.display = 'block';
    setTimeout(() => {
        levelUpMessage.style.display = 'none';
    }, 4000);
}

// Game loop
function gameLoop() {
    movePlayer();
    checkCollisions();
    checkLevelUp();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();








