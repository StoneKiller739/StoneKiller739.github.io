const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const skins = [
  { name: 'Default', color: 'blue' },
  { name: 'Red', color: 'red' },
  { name: 'Green', color: 'green' },
];

let playerSkin = loadSkin() || skins[0];

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 2,
  points: 0,
  coins: loadCoins(),
  foodEaten: 0,
  clan: null,
  level: loadLevel(),
};

let food = [];
const foodThreshold = 10;
const keys = {};
let offsetX = 0, offsetY = 0;

const clans = [
  { name: 'Red Clan', color: 'red', players: [] },
  { name: 'Blue Clan', color: 'blue', players: [] },
  { name: 'Green Clan', color: 'green', players: [] },
];

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

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
  if (keys['w']) player.y -= player.speed;
  if (keys['s']) player.y += player.speed;
  if (keys['a']) player.x -= player.speed;
  if (keys['d']) player.x += player.speed;
}

function drawPlayer() {
  context.beginPath();
  context.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  context.fillStyle = playerSkin.color;
  context.fill();
  context.closePath();
}

function drawFood() {
  food.forEach((item) => {
    context.beginPath();
    context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
    context.fillStyle = 'green';
    context.fill();
    context.closePath();
  });
}

function drawLeaderboard() {
  context.fillStyle = 'black';
  context.font = '20px Arial';
  context.fillText(`Points: ${player.points}`, 10, 30);
  context.fillText(`Level: ${player.level}`, 10, 60);
  context.fillText(`Coins: ${player.coins}`, 10, 90);
}

function drawInstructions() {
  context.fillStyle = 'black';
  context.font = '20px Arial';
  context.fillText('Earn 100 points to get a higher level.', canvas.width / 2 - 180, 50);
}

function joinClan(clanName) {
  const clan = clans.find(c => c.name === clanName);
  if (clan) {
    player.clan = clan;
    clan.players.push(player);
  }
}

function generateFood(count = 50) {
  for (let i = 0; i < count; i++) {
    food.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 5 });
  }
}

function checkCollision() {
  food.forEach((item, index) => {
    const dist = Math.hypot(player.x - item.x, player.y - item.y);
    if (dist < player.size + item.size) {
      food.splice(index, 1);
      player.size += 0.5;
      player.points += 1;
      player.foodEaten += 2;

      if (player.foodEaten >= 8) {
        player.coins += 1;
        saveCoins(player.coins);
        player.foodEaten = 0;
      }

      if (player.clan) player.clan.points += 1;
    }
  });
}

function checkLevel() {
  if (player.points >= player.level * 100) {
    player.level += 1;
    player.speed += 0.5;
    saveLevel(player.level);
    generateFood();
  }
  if (player.level % 3 === 0) player.size = 10;
}

function checkFoodCount() {
  if (food.length < foodThreshold) generateFood(50);
}

function saveCoins(coins) {
  localStorage.setItem('coins', coins);
}

function loadCoins() {
  return parseInt(localStorage.getItem('coins')) || 0;
}

function saveLevel(level) {
  localStorage.setItem('level', level);
}

function loadLevel() {
  return parseInt(localStorage.getItem('level')) || 1;
}

function saveSkin(skin) {
  localStorage.setItem('skin', JSON.stringify(skin));
}

function loadSkin() {
  return JSON.parse(localStorage.getItem('skin')) || null;
}

generateFood();
gameLoop();
