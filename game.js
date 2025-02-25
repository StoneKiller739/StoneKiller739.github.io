const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load saved player data or set defaults
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: parseFloat(localStorage.getItem("size")) || 10,
  speed: 2,
  points: parseInt(localStorage.getItem("points")) || 0,
  coins: parseInt(localStorage.getItem("coins")) || 0,
  foodEaten: 0,
  level: parseInt(localStorage.getItem("level")) || 1,
};

let food = new Set();
const foodThreshold = 30;
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
  context.fillText(Points: ${player.points}, 10, 30);
  context.fillText(Level: ${player.level}, 10, 60);
  context.fillText(Coins: ${player.coins}, 10, 90);
}

function drawInstructions() {
  context.fillStyle = "black";
  context.font = "20px Arial";
  context.fillText("Earn 100 points to level up.", canvas.width / 2 - 180, 50);
}

// Generate food **evenly distributed** near the player and **prevent overlap**
function generateFood(count = 50) {
  while (food.size < count) {
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * 150 + 50; // 50-200 pixels away

    let foodX = player.x + Math.cos(angle) * distance;
    let foodY = player.y + Math.sin(angle) * distance;

    // Prevent food overlap by checking distance to existing food
    let isOverlapping = [...food].some(
      (item) => Math.hypot(item.x - foodX, item.y - foodY) < 10
    );

    if (!isOverlapping) {
      food.add({ x: foodX, y: foodY, size: 5 });
    }
  }
}

// Handle food collision
function checkCollision() {
  food.forEach((item) => {
    const dist = Math.hypot(
      (item.x - player.x),
      (item.y - player.y)
    );

    if (dist - player.size - item.size < 1) {
      player.points += 1;
      player.foodEaten += 1;
      player.size += 0.2;

      if (player.foodEaten % 8 === 0) {
        player.coins += 1;
        saveData();
      }

      // Remove old food and spawn new food near player
      food.delete(item);
      spawnFoodNearPlayer();
    }
  });
}

// Spawn a single food near player when one is eaten
function spawnFoodNearPlayer() {
  let newFood;
  let attempts = 0;
  
  do {
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * 150 + 50;
    newFood = {
      x: player.x + Math.cos(angle) * distance,
      y: player.y + Math.sin(angle) * distance,
      size: 5,
    };
    attempts++;
  } while (
    [...food].some((item) => Math.hypot(item.x - newFood.x, item.y - newFood.y) < 10) &&
    attempts < 10
  );

  food.add(newFood);
}

function checkLevel() {
  if (player.points >= player.level * 100) {
    player.level += 1;
    player.speed += 0.5;
    generateFood();
    saveData();

    if (player.level % 3 === 0) {
      player.size = 10;
    }
  }
}

function checkFoodCount() {
  if (food.size < foodThreshold) {
    generateFood(foodThreshold - food.size);
  }
}

function saveData() {
  localStorage.setItem("level", player.level);
  localStorage.setItem("points", player.points);
  localStorage.setItem("coins", player.coins);
  localStorage.setItem("size", player.size);
}

window.onload = () => {
  generateFood(foodThreshold);
  gameLoop();
};
