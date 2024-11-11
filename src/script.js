import Platform from './Elements/platform.js';
import Leaderboard from './Leaderboard/leaderboard.js';
import AllowOrientationButton from './Buttons/allowOrientation.js';
import Score from './Score/score.js';
import { drawPlatforms } from './Gameplay/platformLogic.js';
import { scrollPlatforms } from './Gameplay/scrollLogic.js';
import { checkCollision } from './Gameplay/collisionLogic.js';

// Global Variables
const initData = Telegram.WebApp.initDataUnsafe;
const userInfo = initData.user;
let allowedOrientation = false;
let gameStarted = false;
let gameOver = false;
let showingLeaderboard = false;
let touchedTrap = false;
let playerImage;
let overlayImage;
let backgroundImage;
let gameOverOverlayImage;
let scores;
let personalbest;
let playerName = 'Peterpunsh99';
let playerId = '1';
let platforms = [];
let scrolling = false;
let targetPlatformY = 0;
let collisionY = null;
const score = new Score();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Function to resize the canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Optionally redraw the background image or other elements here
}

// Initial resize
resizeCanvas();

// Add event listener to resize the canvas when the window size changes
window.addEventListener('resize', resizeCanvas);

let frames_per_second = 60;
let previousTime = performance.now();
let interval = 1000 / frames_per_second;
let delta_time_multiplier = 1;
let delta_time = 0;

// Player Object
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.25,
    jumpStrength: -10,
    speed: 3.3,
    jetpackActive: false
};

// Initialize Game Elements
const scaleX = canvas.width / 1242;
const scaleY = canvas.height / 2208;
const backButtonWidth = 430;
const backButtonHeight = 200;
const buttons = [
    {
        x: scaleX * 400,
        y: scaleY * 1710,
        width: scaleX * 430,
        height: scaleY * 200,
        action: startGame
    },
    {
        x: scaleX * 800,
        y: scaleY * 1972,
        width: scaleX * 200,
        height: scaleY * 50,
        action: showLeaderboard
    }
];
const MenuButtons = [
    {
        x: canvas.width / 2 - scaleX* backButtonWidth / 2,
        y: canvas.height - 120,
        width: scaleX * backButtonWidth,
        height: scaleY * backButtonHeight,
        action: showStartScreen
    }
];
const GameOverButtons = [
    {
        x: scaleX * 400,
        y: scaleY * 1690,
        width: scaleX * backButtonWidth,
        height: scaleY * backButtonHeight,
        action: startGame
    },
    {
        x: scaleX * 640,
        y: scaleY * 1960,
        width: scaleX * 200,
        height: scaleY * 50,
        action: showLeaderboard
    },
    {
        x: scaleX * 400,
        y: scaleY * 1960,
        width: scaleX * 200,
        height: scaleY * 50,
        action: showStartScreen
    }
];

const leaderboard = new Leaderboard(canvas.width, canvas.height, scaleX, scaleY, backButtonWidth, backButtonHeight);
const allowOrientationButton = new AllowOrientationButton(100, 300, 200, 100, 'Click to enable\n device orientation');

// Initialize Player Info
if (userInfo) {
    playerName = `${userInfo.first_name} ${userInfo.last_name}`;
    playerId = userInfo.id;
}

// Preload Player Image
async function preloadPlayerImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

//Preload Images
async function preloadImages(sources) {
    const promises = sources.map(src => preloadPlayerImage(src));
    return Promise.all(promises);
}

// Check Orientation Permission
async function checkOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceOrientationEvent.requestPermission();
            if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
                return true;
            } else {
                console.error('Permission to access device orientation was denied');
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
        return true;
    }
}

// Ensure Font is Loaded Before Use
async function ensureFontLoaded() {
    await document.fonts.load('1em CustomFont');
    console.log('CustomFont loaded');
}

// Initialize Game
async function init() {
    try {
        await ensureFontLoaded();
        playerImage = await preloadPlayerImage('/src/assets/images/Characters/Lamb.png');
        const platformImage = await preloadPlayerImage('/src/assets/images/Tiles/StandardTile.png');
        Platform.prototype.image = platformImage; // Setze das vorab geladene Bild in der Plattform-Klasse
        allowedOrientation = await checkOrientationPermission();
        if (allowedOrientation) {
            startScreenImages =  await preloadImages([
                '/src/assets/images/startScreen/StartScreen1.png',
                '/src/assets/images/startScreen/StartScreen2.png',
                '/src/assets/images/startScreen/StartScreen3.png'
            ]);
            overlayImage = await preloadPlayerImage('/src/assets/images/startScreen/Overlay.png');
            backgroundImage = await preloadPlayerImage('/src/assets/images/Background/background.png');
            gameOverOverlayImage = await preloadPlayerImage('/src/assets/images/GameOver/GameOver_Overlay_Lamb.png');
            showStartScreen();
        } else {
            drawAllowOrientationScreen();
        }
    } catch (error) {
        console.error('Error loading player image:', error);
    }
}

// Draw Player
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

//Draw Start Screen
let startScreenFrame = 0;
let startScreenImages = [];
let startLoop = 0;
let frameDuration = [10, 2.5, 2.5]; // Duration for each frame in ticks (assuming 60 FPS, 120 ticks = 2 seconds)



async function animateStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw start screen images, cycling through them. The animation should be smooth and the images should be displayed in a loop, while the first image is displayed again after the last image and for several seconds.
    ctx.drawImage(startScreenImages[startScreenFrame], 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    startLoop++;
    if (startLoop > frameDuration[startScreenFrame]) {
        startLoop = 0;
        startScreenFrame = (startScreenFrame + 1) % startScreenImages.length;
        if (startScreenFrame === 2) {
            frameDuration[0] = 240;
        }
    }

    if (!gameStarted && !gameOver && !showingLeaderboard) {
        requestAnimationFrame(animateStartScreen);
    }
}

// Update Game State
function update(currentTime) {
    if (!gameStarted) return;

    delta_time = currentTime - previousTime;
    delta_time_multiplier = delta_time / interval;
    player.dy += player.gravity * delta_time_multiplier;
    player.y += player.dy * delta_time_multiplier;

    if (player.y + player.height > canvas.height) {
        gameOver = true;
    }

    if (gameOver || touchedTrap) {
        gameOver = true;
        drawGameOverScreen();
        return;
    }

    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }

    if (scrolling || player.jetpackActive) {
        try {
            const result = scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, score.score);
            platforms = result.platforms;
            scrolling = result.scrolling;
            targetPlatformY = result.targetPlatformY;
        } catch (error) {
            console.log(error);
        }
    }

    platforms.forEach(platform => {
        if (player.dy < 0 && player.y < platform.y && !platform.passed) {
            platform.passed = true;
            score.increment();
        }
    });

    const collisionResult = checkCollision(player, platforms);
    collisionY = collisionResult.platformY;
    touchedTrap = collisionResult.touchedTrap;
    if (collisionY !== null) {
        scrolling = true;
        targetPlatformY = collisionY;
    }

    platforms.forEach(platform => {
        if (platform.jetpack && !platform.jetpack.active &&
            player.x < platform.jetpack.x + platform.jetpack.width &&
            player.x + player.width > platform.jetpack.x &&
            player.y < platform.jetpack.y + platform.jetpack.height &&
            player.y + player.height > platform.jetpack.y &&
            player.jetpackActive === false) {
            player.jetpackActive = true;
            platform.jetpack.activate(player);
        }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawPlatforms(platforms, ctx);
    drawPlayer();
    score.draw(ctx);
    previousTime = performance.now();
    requestAnimationFrame(update);
}

// Handle Device Orientation
function handleOrientation(event) {
    if (!gameStarted) return;

    const tiltLR = event.gamma;

    if (tiltLR < -5) {
        player.x -= player.speed;
    } else if (tiltLR > 5) {
        player.x += player.speed;
    }
}

// Start Game
function startGame() {
    gameStarted = true;
    gameOver = false;
    touchedTrap = false;
    score.reset();
    player.dy = player.jumpStrength;
    player.y = canvas.height - 150;
    player.x = canvas.width / 2 - 25;
    player.jetpackActive = false;
    platforms = [new Platform(canvas.width/2 -50, canvas.height - 150 , 75, 17)];
    platforms.forEach(platform => platform.passed = false);
    previousTime = performance.now();
    targetPlatformY = platforms[0].y;
    scrolling = false;
    requestAnimationFrame(update);
}


// Draw Game Over Screen
async function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(gameOverOverlayImage, 0, 0, canvas.width, canvas.height);
    personalbest = await getPersonalBest(playerName);
    scores = await fetchScores();
    //Draw The Score
    ctx.fillStyle = '#539ea9'; // Match the blue-green color from the design
    ctx.font = '25px CustomFont';
    ctx.textAlign = 'center';
    ctx.fontWeight = 'bold';
    ctx.fillText(`${score.score}`, canvas.width / 2, scaleY * 1110);
    //Draw The Personal Best
    ctx.fillText(`${personalbest}`, canvas.width / 2, scaleY * 1275);
    //Draw the best Score
    ctx.fillText(`${scores[0].score}`, canvas.width / 2, scaleY * 1435);
    //Draw the name
    ctx.fillText(`${playerName}`, canvas.width / 2, scaleY * 1595);


    saveScore(score.score, playerId, playerName);
}

// Draw Allow Orientation Screen
async function drawAllowOrientationScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allowOrientationButton.display();
}

// Get Personal Best
async function getPersonalBest(playerName) {
    const response = await fetch(`https://marsloeller.com/api/personalbest?userName=${playerName}`);
    if (response.ok) {
        const data = await response.json();
        return data.personalBest;
    } else {
        console.error('Error fetching personal best');
    }
}

// Save Score
async function saveScore(score, userId, userName) {
    const response = await fetch('https://marsloeller.com/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score, userId, userName })
    });

    if (!response.ok) {
        console.error('Error saving score');
    }
}

// Show Leaderboard
function showLeaderboard() {
    gameOver = false;
    gameStarted = false;
    showingLeaderboard = true;
    leaderboard.draw(ctx, canvas.width, canvas.height);
}

// Show Start Screen
function showStartScreen() {
    showingLeaderboard = false;
    gameStarted = false;
    gameOver = false;
    animateStartScreen();
}

async function fetchScores() {
    const response = await fetch('https://marsloeller.com/api/top10');
    const data = await response.json();
    scores = data.top10;
    return scores;
}

// Handle Touch Start
function handleTouchStart(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    if (!allowedOrientation) {
        return;
    }
    if (!gameStarted && !gameOver && !showingLeaderboard) {
        buttons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (gameOver) {
        GameOverButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (showingLeaderboard) {
        MenuButtons.forEach(button => {
            console.log('Checking Menubutton');
            if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                console.log('Button clicked');
                button.action();
            }
        });
    }
    event.preventDefault();
}

// Event Listeners
canvas.addEventListener('touchstart', handleTouchStart);
allowOrientationButton.addClickListener(async () => {
    allowedOrientation = await checkOrientationPermission();
    if (allowedOrientation) {
        allowOrientationButton.hide();
        startScreenImages =  await preloadImages([
            '/src/assets/images/startScreen/StartScreen1.png',
            '/src/assets/images/startScreen/StartScreen2.png',
            '/src/assets/images/startScreen/StartScreen3.png'
        ]);
        backgroundImage = await preloadPlayerImage('/src/assets/images/Background/background.png');
        overlayImage = await preloadPlayerImage('/src/assets/images/startScreen/Overlay.png');
        showStartScreen();
    }
});

// Start Initialization
init();