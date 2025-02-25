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
  velocity: { x: 0, y: 0 },
  points: parseInt(localStorage.getItem("points")) || 0,
  coins: parseInt(localStorage.getItem("coins")) || 0,
  foodEaten: 0,
  level: parseInt(localStorage.getItem("level")) || 1,
  skin: localStorage.getItem("skin") || "blue",
};

let food = [];
const foodThreshold = 30;

const skins = {
  default: { color: "blue", price: 0 },
  level30: { color: "red", price: 0 },
  level100: { color: getRandomColor(), price: 0 },
  coin30: { color: "purple", price: 30 },
  coin100: { color: "orange", price: 100 },
  coin1000: { color: "gold", price: 1000 },
};

// Controls
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Game loop
function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  checkLevel();
  checkFoodCount();
  drawPlayer();
  drawFood();
  drawLeaderboard();
  drawInstructions();
  requestAnimationFrame(gameLoop);
}

// Smooth movement with acceleration & friction
function updatePlayer() {
  let accel = 0.5;
  let friction = 0.9;

  if (keys["w"]) player.velocity.y -= accel;
  if (keys["s"]) player.velocity.y += accel;
  if (keys["a"]) player.velocity.x -= accel;
  if (keys["d"]) player.velocity.x += accel;

  player.velocity.x *= friction;
  player.velocity.y *= friction;

  player.x += player.velocity.x;
  player.y += player.velocity.y;
}

// Draw player with skin
function drawPlayer() {
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, player.size, 0, Math.PI * 2);
  context.fillStyle = player.skin;
  context.fill();
  context.closePath();
}

// Draw food
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

// Draw leaderboard
function drawLeaderboard() {
  context.fillStyle = "black";
  context.font = "20px Arial";
  context.fillText(`Points: ${player.points}`, 10, 30);
  context.fillText(`Level: ${player.level}`, 10, 60);
  context.fillText(`Coins: ${player.coins}`, 10, 90);
}

// Display instructions
function drawInstructions() {
  context.fillStyle = "black";
  context.font = "20px Arial";
  context.fillText("Earn 100 points to level up.", canvas.width / 2 - 180, 50);
}

// Generate food with unique positions
function generateFood(count = 50) {
  while (food.length < count) {
    let angle = Math.random() * Math.PI * 2;
    let distance = Math.random() * 150 + 50;

    let foodX = player.x + Math.cos(angle) * distance;
    let foodY = player.y + Math.sin(angle) * distance;

    // Ensure no overlap
    let isOverlapping = food.some(
      (item) => Math.hypot(item.x - foodX, item.y - foodY) < 10
    );

    if (!isOverlapping) {
      food.push({ x: foodX, y: foodY, size: 5 });
    }
  }
}

// Handle food collision
function checkCollision() {
  for (let i = food.length - 1; i >= 0; i--) {
    const item = food[i];
    const dist = Math.hypot(item.x - player.x, item.y - player.y);

    if (dist < player.size + item.size) {
      player.points++;
      player.foodEaten++;
      player.size += 0.2;

      if (player.foodEaten % 8 === 0) {
        player.coins++;
        saveData();
      }

      // Remove food and spawn new one
      food.splice(i, 1);
      spawnFoodNearPlayer();
    }
  }
}

// Spawn food when one is eaten
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
    food.some((item) => Math.hypot(item.x - newFood.x, item.y - newFood.y) < 10) &&
    attempts < 10
  );

  food.push(newFood);
}

// Check level and update skin
function checkLevel() {
  if (player.points >= player.level * 100) {
    player.level++;
    player.speed += 0.5;
    generateFood();
    saveData();

    if (player.level % 3 === 0) {
      player.size = 10;
    }

    // Change skin based on level
    if (player.level >= 100) player.skin = getRandomColor();
    else if (player.level >= 30) player.skin = "red";
    else player.skin = "blue";
  }
}

// Check food count
function checkFoodCount() {
  if (food.length < foodThreshold) {
    generateFood(foodThreshold - food.length);
  }
}

// Save progress
function saveData() {
  localStorage.setItem("level", player.level);
  localStorage.setItem("points", player.points);
  localStorage.setItem("coins", player.coins);
  localStorage.setItem("size", player.size);
  localStorage.setItem("skin", player.skin);
}

// Get a random non-blue/non-red color
function getRandomColor() {
  let colors = ["green", "yellow", "pink", "cyan", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Add shop button
document.body.innerHTML += `<button id="shopButton" style="position: absolute; top: 10px; right: 10px;">Shop</button>`;
document.getElementById("shopButton").addEventListener("click", openShop);

// Shop system
function openShop() {
  let choices = Object.entries(skins)
    .filter(([key, skin]) => skin.price > 0)
    .map(([key, skin]) => `${skin.color} (${skin.price} coins)`)
    .join("\n");

  let choice = prompt(`Choose a skin to buy:\n${choices}`);

  let selectedSkin = Object.values(skins).find((s) => s.color === choice);
  if (selectedSkin && player.coins >= selectedSkin.price) {
    player.coins -= selectedSkin.price;
    player.skin = selectedSkin.color;
    saveData();
    alert(`You bought the ${selectedSkin.color} skin!`);
  } else {
    alert("Not enough coins!");
  }
}

// Start game
window.onload = () => {
  generateFood(foodThreshold);
  gameLoop();
};
