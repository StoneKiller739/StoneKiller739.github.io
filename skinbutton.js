// Example of a drop-down menu for skin selection
let selectSkinMenu = document.getElementById('selectSkinMenu');
skinUrls.forEach((url, index) => {
    let option = document.createElement('option');
    option.value = index;
    option.textContent = `Skin ${index + 1}`;
    selectSkinMenu.appendChild(option);
});

// Update player skin based on selection
selectSkinMenu.addEventListener('change', function() {
    let selectedIndex = selectSkinMenu.value;
    playerSkin.src = skinUrls[selectedIndex];
});
let playerSkin = new Image();

// Function to draw the player
function drawPlayer(context, player) {
    context.drawImage(playerSkin, player.x, player.y, player.width, player.height);
}

// Initial skin load
playerSkin.src =    'https://imgur.com/a/bxM4kJD',
'https://imgur.com/a/aWSscl3',
'https://imgur.com/a/YBy1aTt',
'https://imgur.com/a/KG9HF7o'
'https://imgur.com/a/Oom1ELt'
'https://imgur.com/a/pkP0bCe'[7]; // Load the first skin by default
