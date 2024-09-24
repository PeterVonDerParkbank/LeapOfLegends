import Platform from './js/platform.js';
import Ground from './js/ground.js';
import StartButton from './js/startButton.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50, // Start on the ground
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.1,
    jumpStrength: -7,
    speed: 3
};

let ground = new Ground(0, canvas.height - 50, canvas.width, 50);
let startButton = new StartButton(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50, 'Start');

let platforms = [
    new Platform(100, 500, 100, 10),
];

let scrolling = false;
let targetPlatformY = 0;
let gameStarted = false;
let gameOver = false;
const maxPlatforms = 5; // Maximum number of platforms

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => platform.draw(ctx));
}

function checkCollision() {
    platforms.forEach(platform => {
        if (player.dy > 0 && 
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            player.dy = player.jumpStrength;

            // Start scrolling when the player reaches a platform
            scrolling = true;
            targetPlatformY = platform.y;
        }
    });
}

function generatePlatform() {
    const minPlatformGap = 80; // Minimum vertical gap between platforms
    const maxPlatformGap = 180; // Maximum vertical gap between platforms
    const platformWidth = 100;
    const platformHeight = 10;

    const lastPlatform = platforms[platforms.length - 1];
    const newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    const newX = Math.random() * (canvas.width - platformWidth);

    platforms.push(new Platform(newX, newY, platformWidth, platformHeight));
}

function update() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height > canvas.height) {
        gameOver = true;
        setTimeout(() => {
            alert("Game Over!");
        }, 333);
        return;
    }

    // Check for left and right boundaries
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }

    // Smooth scrolling
    if (scrolling) {
        const targetY = canvas.height - 50; // Target position above the bottom edge
        const distanceToScroll = targetY - targetPlatformY;
        const maxScrollSpeed = 5; // Maximum scroll speed
        const minScrollSpeed = 1; // Minimum scroll speed

        // Calculate dynamic scroll speed based on distance
        const scrollSpeed = Math.max(minScrollSpeed, Math.min(maxScrollSpeed, distanceToScroll / 10));

        if (targetPlatformY + scrollSpeed < targetY) {
            platforms.forEach(p => {
                p.y += scrollSpeed;
            });
            player.y += scrollSpeed;
            targetPlatformY += scrollSpeed; // Update targetPlatformY to reflect the new position

            // Remove platforms that are out of view
            platforms = platforms.filter(p => p.y < canvas.height);

            // Generate new platform during scrolling if the number of platforms is less than maxPlatforms
            if (platforms.length < maxPlatforms) {
                const lastPlatform = platforms[platforms.length - 1];
                if (lastPlatform.y > 0) {
                    generatePlatform();
                }
            }
        } else {
            const remainingDistance = targetY - targetPlatformY;
            platforms.forEach(p => {
                p.y += remainingDistance;
            });
            player.y += remainingDistance;
            scrolling = false;
        }
    }

    drawPlayer();
    drawPlatforms();
    checkCollision();
    requestAnimationFrame(update);
}

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(event) {
    if (!gameStarted) return;

    const touchX = event.touches[0].clientX;
    const canvasRect = canvas.getBoundingClientRect();
    const relativeX = touchX - canvasRect.left;

    if (relativeX < player.x + player.width / 2) {
        player.x -= player.speed;
    } else {
        player.x += player.speed;
    }

    // Prevent default behavior to avoid scrolling
    event.preventDefault();
}

function startGame() {
    gameStarted = true;
    player.dy = player.jumpStrength; // Start jumping
    update();
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms();
    ground.draw(ctx);
    startButton.draw(ctx);

    canvas.addEventListener('click', function onClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (startButton.isClicked(x, y)) {
            canvas.removeEventListener('click', onClick);
            startGame();
        }
    });
}

drawStartScreen();