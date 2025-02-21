const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: canvas.width / 2, y: canvas.height / 2, size: 10, speed: 2, points: 0, clan: null, level: 1 };
let food = [];
let clans = [
  { name: 'Red Clan', color: 'red', players: [] },
  { name: 'Blue Clan', color: 'blue', players: [] },
  { name: 'Green Clan', color: 'green', players: [] },
];

let offsetX = 0;
let offsetY = 0;
const foodThreshold = 10;  // Minimum amount of food on the map

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update player position
  updatePlayer();

  // Check for level progression
  checkLevel();

  // Check and replenish food if needed
  checkFoodCount();

  // Draw player
  drawPlayer();

  // Draw food
  drawFood();

  // Check for collisions
  checkCollision();

  // Draw leaderboard
  drawLeaderboard();

  // Draw instructions
  drawInstructions();

  requestAnimationFrame(gameLoop);
}

function updatePlayer() {
  if (keys['w']) offsetY += player.speed;
  if (keys['s']) offsetY -= player.speed;
  if (keys['a']) offsetX += player.speed;
  if (keys['d']) offsetX -= player.speed;
}

function drawPlayer() {
  context.beginPath();
  context.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  context.fillStyle = player.clan ? player.clan.color : 'blue';
  context.fill();
  context.closePath();
}

function drawFood() {
  food.forEach((item) => {
    context.beginPath();
    context.arc(item.x + offsetX, item.y + offsetY, item.size, 0, Math.PI * 2);
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
}

function drawInstructions() {
  context.fillStyle = 'black';
  context.font = '20px Arial';
  context.fillText('Earn 100 points to get a higher level.', canvas.width / 2 - 180, 50);
}

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function joinClan(clanName) {
  const clan = clans.find(c => c.name === clanName);
  if (clan) {
    player.clan = clan;
    clan.players.push(player);
  }
}

function generateFood() {
  for (let i = 0; i < 50; i++) {
    food.push({ x: Math.random() * canvas.width * 2 - canvas.width, y: Math.random() * canvas.height * 2 - canvas.height, size: 5 });
  }
}

function checkCollision() {
  food.forEach((item, index) => {
    const dist = Math.hypot((player.x - (item.x + offsetX)), (player.y - (item.y + offsetY)));
    if (dist - player.size - item.size < 1) {
      food.splice(index, 1);
      player.size += 1;
      player.points += 1;
      if (player.clan) player.clan.points += 1;
    }
  });
}

function checkLevel() {
  // Level up every 100 points
  if (player.points >= player.level * 100) {
    player.level += 1;
    player.speed += 0.5;
    generateFood();
  }
}

function checkFoodCount() {
  if (food.length < foodThreshold) {
    generateFood();
  }
}

generateFood();
gameLoop();
