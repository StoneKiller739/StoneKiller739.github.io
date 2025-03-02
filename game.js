<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stone.io</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            font-family: Arial, sans-serif;
            color: white;
            text-align: center;
        }
        #mainMenu, #leaderboard {
            background: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.2);
        }
        input {
            width: 260px;
            padding: 12px;
            font-size: 18px;
            text-align: center;
            border: none;
            border-radius: 5px;
            background: #ffffff;
            color: #333;
            outline: none;
            margin-top: 10px;
        }
        button {
            margin-top: 15px;
            padding: 12px 25px;
            font-size: 18px;
            background-color: #00aaff;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background-color: #0088cc;
        }
        #leaderboard {
            position: absolute;
            bottom: 15px;
            left: 15px;
            width: 320px;
        }
        #leaderboard ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        #leaderboard li {
            padding: 8px;
            border-bottom: 1px solid #555;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div id="mainMenu">
        <h1>Stone.io</h1>
        <p>Enter your username to start</p>
        <input type="text" id="playerName" placeholder="Username" onkeypress="handleKeyPress(event)">
        <button onclick="startGame()">Start Game</button>
    </div>
    
    <div id="leaderboard">
        <h2>Leaderboard</h2>
        <ul id="leaderboardList"></ul>
    </div>
    
    <canvas id="gameCanvas"></canvas>

    <script>
        const worker = new Worker('scoreWorker.js');
        document.addEventListener("DOMContentLoaded", loadLeaderboard);

        function loadLeaderboard() {
            worker.postMessage({ action: 'load' });
        }
        
        function handleKeyPress(event) {
            if (event.key === "Enter") {
                startGame();
            }
        }
        
        function startGame() {
            let name = document.getElementById('playerName').value.trim();
            if (name === "") {
                alert("Please enter a username!");
                return;
            }
            player.name = name;
            document.getElementById('mainMenu').style.display = 'none';
            gameLoop();
        }
        
        worker.onmessage = function(event) {
            if (event.data.action === 'update') {
                updateLeaderboard(event.data.players);
            }
        };
        
        function updateLeaderboard(players) {
            let leaderboardList = document.getElementById("leaderboardList");
            leaderboardList.innerHTML = "";
            players.forEach(player => {
                let li = document.createElement("li");
                li.textContent = `${player.name} - ${player.points} pts`;
                leaderboardList.appendChild(li);
            });
        }

        const canvas = document.getElementById("gameCanvas");
        const context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: parseFloat(localStorage.getItem("size")) || 10,
            speed: 2,
            points: parseInt(localStorage.getItem("points")) || 0,
            coins: parseInt(localStorage.getItem("coins")) || 0,
            foodEaten: 0,
            level: parseInt(localStorage.getItem("level")) || 1,
            name: ''
        };

        let food = new Set();
        const foodThreshold = 20;
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
            if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
            if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
            if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
            if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;
        }

        function drawPlayer() {
            context.beginPath();
            context.arc(canvas.width / 2, canvas.height / 2, player.size, 0, Math.PI * 2);
            context.fillStyle = playerSkin.color;
            context.fill();
            context.closePath();
            context.fillStyle = "white";
            context.font = "16px Arial";
            context.textAlign = "center";
            context.fillText(player.name, canvas.width / 2, canvas.height / 2 - player.size - 10);
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
            context.fillText(`Points: ${player.points}`, 10, canvas.height - 40);
            context.fillText(`Level: ${player.level}`, 10, canvas.height - 20);
            context.fillText(`Coins: ${player.coins}`, 10, canvas.height - 60);
        }

        function drawInstructions() {
            context.fillStyle = "black";
            context.font = "20px Arial";
            context.fillText("Earn 100 points to level up.", canvas.width / 2 - 180, 50);
        }

        function generateFood(count = 50) {
            while (food.size < count) {
                spawnFoodNearPlayer();
            }
        }

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
                attempts < 10 &&
                [...food].some((item) => Math.hypot(item.x - newFood.x, item.y - newFood.y) < 10)
            );

            if (attempts < 10) food.add(newFood);
        }

        function checkCollision() {
            food.forEach((item) => {
                const dist = Math.hypot(item.x - player.x, item.y - player.y);
                if (dist - player.size - item.size < 1) {
                    player.points += 1;
                    player.foodEaten += 1;
                    player.size += 0.2;

                    if (player.foodEaten % 8 === 0) {
                        player.coins += 1;
                        saveData();
                    }

                    food.delete(item);
                    spawnFoodNearPlayer();
                }
            });
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

        // Define the saveData function
        function saveData()

