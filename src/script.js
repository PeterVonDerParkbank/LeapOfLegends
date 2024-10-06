import Platform from './Elements/platform.js';
import Ground from './Elements/ground.js';
import StartButton from './Buttons/startButton.js';
import GameOverButton from './Buttons/gameOverButton.js';
import Score from './Score/score.js';
import { auth, db, doc, getDoc, setDoc } from './Firebase/firebase.js';



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
    gravity: 0.25,
    jumpStrength: -10,
    speed: 3.3
};

let ground = new Ground(0, canvas.height - 50, canvas.width, 50);
let startButton = new StartButton(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50, 'Start');
let gameOverButton = new GameOverButton(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50, 'Restart');

let platforms = [
    new Platform(100, 300, 100, 10),
];

let scrolling = false;
let targetPlatformY = 0;
let gameStarted = false;
let gameOver = false;
const score = new Score();
const userId = auth.currentUser ? auth.currentUser.uid : null;
const maxPlatforms = 5; // Maximum number of platforms
const playerImage = new Image();
playerImage.src = '/src/assets/images/moo_base.png';

let frames_per_second = 60;
let previousTime = performance.now();
let interval = 1000 / frames_per_second;
let delta_time_multiplier = 1;
let delta_time = 0;


function drawPlayer() {
    if (playerImage.complete) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } else {
        playerImage.onload = () => {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        };
    }
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

function update(currentTime) {
    if (!gameStarted) return;
    delta_time = currentTime - previousTime;
    delta_time_multiplier = delta_time / interval;
    player.dy += player.gravity*delta_time_multiplier;
    player.y += player.dy*delta_time_multiplier;
    
    if (player.y + player.height > canvas.height) {
        gameOver = true;
        drawGameOverScreen();
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
        const scrollSpeed = Math.max(minScrollSpeed, Math.min(maxScrollSpeed, distanceToScroll / 10) * delta_time_multiplier);

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
    // Increment score based on player's vertical position
    platforms.forEach(platform => {
        if (player.dy < 0 && player.y < platform.y && !platform.passed) {
            platform.passed = true;
            score.increment();
        }
    });

    

    checkCollision();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawPlatforms();
    score.draw(ctx);
    previousTime = performance.now();
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
    gameOver = false;
    score.reset();
    player.dy = player.jumpStrength; // Start jumping
    player.y = canvas.height - 100; // Reset player position
    player.x = canvas.width / 2 - 25; // Reset player position
    platforms = [new Platform(100, 500, 100, 10)]; // Reset platforms
    platforms.forEach(platform => platform.passed = false); // Reset passed attribute
    previousTime = performance.now();
    requestAnimationFrame(update);
}

async function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms();
    ground.draw(ctx);
    startButton.draw(ctx);

    // Display high score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${await getHighScore()}`, 10, 60);
}

async function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms();
    ground.draw(ctx);
    gameOverButton.draw(ctx);
    score.draw(ctx);

    // Display high score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${await getHighScore()}`, 10, 60);

    // Save the score to Firestore
    const highScore = Math.max(score.score, await getHighScore());
    await setDoc(doc(db, 'scores', 'highScore'), { score: highScore , creatorId: userId});

    console.log('Game over!');
}

async function getHighScore() {
    const highScoreDoc = await getDoc(doc(db, 'scores', 'highScore'));
    if (highScoreDoc.exists()) {
        return highScoreDoc.data().score;
    } else {
        return 0;
    }
}
function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!gameStarted && !gameOver) {
        if (startButton.isClicked(x, y)) {
            startGame();
        }
    } else if (gameOver) {
        if (gameOverButton.isClicked(x, y)) {
            startGame();
        }
    }
}

function handleTouchStart(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;

    if (!gameStarted && !gameOver) {
        if (startButton.isClicked(x, y)) {
            startGame();
        }
    } else if (gameOver) {
        if (gameOverButton.isClicked(x, y)) {
            startGame();
        }
    }

    // Prevent default behavior to avoid scrolling
    event.preventDefault();
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouchStart);

(async function() {
    await drawStartScreen();
})();