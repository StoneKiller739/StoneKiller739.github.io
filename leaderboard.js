let players = JSON.parse(localStorage.getItem("leaderboard")) || [];
            let player = { name: name, points: 0 };
            players.push(player);
            localStorage.setItem("leaderboard", JSON.stringify(players));
            
            window.location.href = "index.html";
        }
        
        function updateLeaderboard() {
            let leaderboardList = document.getElementById("leaderboardList");
            leaderboardList.innerHTML = "";
            
            let players = JSON.parse(localStorage.getItem("leaderboard")) || [];
            players.forEach(player => {
                let li = document.createElement("li");
                li.textContent = `${player.name} - ${player.points} pts`;
                leaderboardList.appendChild(li);
            });
        }
