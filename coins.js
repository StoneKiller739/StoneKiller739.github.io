let player = { coins: 0, foodEaten: 0 };
let food = [];

// Function to simulate eating food
function eatFood() {
  player.foodEaten += 1;
  if (player.foodEaten % 8 === 0) {
    player.coins += 1;
  }
}

// Function to simulate the game loop
function gameLoop() {
  // Simulate eating a food item
  eatFood();

  // Log the player's coin count and food eaten
  console.log(`Coins: ${player.coins}`);
  console.log(`Food Eaten: ${player.foodEaten}`);
}

// Simulate generating food and running the game loop
function generateFood(count = 50) {
  for (let i = 0; i < count; i++) {
    food.push({ x: Math.random() * 100, y: Math.random() * 100, size: 5 });
  }
}

// Simulate the game
generateFood();
setInterval(gameLoop, 1000);  // Run the game loop every second
