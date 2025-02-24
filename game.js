const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initialize the player
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 2,
  points: 0,
  coins: loadCoins(),
  foodEaten: 0,
  clan: null,
  level: 1,
};

let food = [];
const foodThreshold = 50;
let playerSkin = { color: "blue" };

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  checkLevel();
  checkFoodCount();
  drawPlayer();
  drawFood();
  checkCollision();
  drawLeaderboard();
  drawInstructions();
  requestAnimationFrame(gameLoop);
}

function updatePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;
}

function drawPlayer() {
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, player.size, 0, Math.PI * 2);
  context.fillStyle = playerSkin.color;
  context.fill();
  context.closePath();
}

function drawFood() {
  food.forEach((item) => {
    context.beginPath();
    context.arc(
      item.x - player.x + canvas.width / 2,
      item.y - player.y + canvas.height / 2,
      item.size,
      0,
      Math.PI * 2
    );
    context.fillStyle = "green";
    context.fill();
    context.closePath();
  });
}

function drawLeaderboard() {
  context.fillStyle = "black";
  context.font = "20px Arial";
  context.fillText(`Points: ${player.points}`, 10, 30);
  context.fillText(`Level: ${player.level}`, 10, 60);
  context.fillText(`Coins: ${player.coins}`, 10, 90);
}

function drawInstructions() {
  context.fillStyle = "black";
  context.font = "20px Arial";
  context.fillText("Earn 100 points to level up.", canvas.width / 2 - 180, 50);
}

function generateFood(count = 50) {
  for (let i = 0; i < count; i++) {
    food.push({
      x: Math.random() * canvas.width * 2 - canvas.width,
      y: Math.random() * canvas.height * 2 - canvas.height,
      size: 5,
    });
  }
}

function checkCollision() {
  food.forEach((item, index) => {
    const dist = Math.hypot(
      canvas.width / 2 - (item.x - player.x + canvas.width / 2),
      canvas.height / 2 - (item.y - player.y + canvas.height / 2)
    );
    if (dist - player.size - item.size < 1) {
      food.splice(index, 1);
      player.points += 1;
      player.foodEaten += 1;
      player.size += 0.2; // Player grows with each food eaten
      if (player.foodEaten % 8 === 0) {
        player.coins += 1;
        saveCoins(player.coins);
      }
    }
  });
}

function checkLevel() {
  if (player.points >= player.level * 100) {
    player.level += 1;
    player.speed += 0.5;
    generateFood();
    if (player.level % 3 === 0) {
      player.size = 10; // Reset size every level 3
    }
  }
}

function checkFoodCount() {
  if (food.length < foodThreshold) {
    generateFood(400);
  }
}

function saveCoins(coins) {
  localStorage.setItem("coins", coins);
}

function loadCoins() {
  const savedCoins = localStorage.getItem("coins");
  return savedCoins ? parseInt(savedCoins) : 0;
}

window.onload = () => {
  generateFood();
  gameLoop();
};
