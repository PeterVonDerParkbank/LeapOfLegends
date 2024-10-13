import Platform from './Elements/platform.js';
import Ground from './Elements/ground.js';
import Leaderboard from './Leaderboard/leaderboard.js';
import StartButton from './Buttons/startButton.js';
import GameOverButton from './Buttons/gameOverButton.js';
import LeaderboardButton from './Buttons/leaderboardButton.js';
import AllowOrientationButton from './Buttons/allowOrientation.js';
import BackButton from './Buttons/backButton.js';
import Score from './Score/score.js';
import { drawPlatforms, generatePlatform } from './Gameplay/platformLogic.js';
import { scrollPlatforms } from './Gameplay/scrollLogic.js';
import { checkCollision } from './Gameplay/collisionLogic.js';

const initData = Telegram.WebApp.initDataUnsafe;
const userInfo = initData.user;
let allowedOrientation = false;
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
        // Fallback für Browser, die keine Berechtigungen benötigen
        window.addEventListener('deviceorientation', handleOrientation);
        return true;
    }
}
const allowOrientationButton = new AllowOrientationButton(100, 300, 200, 100, 'Click to enable\n device orientation');
allowOrientationButton.element.addEventListener('click', () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    allowedOrientation = true;
                    window.addEventListener('deviceorientation', handleOrientation);
                    allowOrientationButton.hide();
                    showStartScreen();
                } else {
                    console.error('Permission to access device orientation was denied');
                }
            })
            .catch(console.error);
    } else {
        // Fallback für Browser, die keine Berechtigungen benötigen
        allowedOrientation = true;
        window.addEventListener('deviceorientation', handleOrientation);
        allowOrientationButton.style.display = 'none'; // Verstecke den Button
        showStartScreen(); // Zeige den Start-Screen
    }
});
const leaderboard = new Leaderboard();
const leaderboardButton = new LeaderboardButton(100, 400, 200, 50, 'Leaderboard');

const backButton = new BackButton(10, 10, 100, 50, 'Zurück');

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

let playerName = 'Peterpunsh99';
let playerId = '1'
//let playerName = 'T.E.D'
if (userInfo) {
    playerName = userInfo.first_name + " " + userInfo.last_name;
    playerId = userInfo.id;
}

let ground = new Ground(0, canvas.height - 50, canvas.width, 50);
let startButton = new StartButton(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50, 'Start');
let gameOverButton = new GameOverButton(canvas.width / 2 - 50, canvas.height / 2 - 25, 100, 50, 'Restart');

let platforms = [
    new Platform(100, 300, 100, 10),
    new Platform(200, 500, 100, 10)
];

let scrolling = false;
let targetPlatformY = 0;
let collisionY = null;
let gameStarted = false;
let gameOver = false;
let showingLeaderboard = false;
const score = new Score();


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

function update(currentTime) {
    console.log('update');
    if (!gameStarted) {
        return
    };
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
        console.log('Player moved to the right edge');
    } else if (player.x > canvas.width) {
        player.x = -player.width;
        console.log('Player moved to the left edge');
    }

    // Smooth scrolling
    if (scrolling) {
        console.log('Scrolling platforms'); // Debugging log
        const result = scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, maxPlatforms);
        platforms = result.platforms;
        scrolling = result.scrolling;
        targetPlatformY = result.targetPlatformY; // Update targetPlatformY with the new value
        console.log(`Scrolling result: targetPlatformY: ${targetPlatformY}, scrolling: ${scrolling}`); // Debugging log
    }
    // Increment score based on player's vertical position
    platforms.forEach(platform => {
        if (player.dy < 0 && player.y < platform.y && !platform.passed) {
            platform.passed = true;
            score.increment();
            console.log('Score incremented'); // Debugging log
        }
    });

    collisionY = checkCollision(player, platforms);
    if (collisionY !== null) {
        scrolling = true;
        targetPlatformY = collisionY;
        console.log(`Collision detected at Y: ${collisionY}, scrolling: ${scrolling}`); // Debugging log
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms(platforms, ctx);
    score.draw(ctx);
    previousTime = performance.now();
    requestAnimationFrame(update);
}

function handleOrientation(event) {
    if (!gameStarted) {
        return
    };

    const tiltLR = event.gamma; // Left to right tilt in degrees

    if (tiltLR < -5) {
        // Neigung nach links
        player.x -= player.speed;
    } else if (tiltLR > 5) {
        // Neigung nach rechts
        player.x += player.speed;
    }
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
    targetPlatformY = platforms[0].y; // Initialize targetPlatformY
    scrolling = false; // Initialize scrolling
    requestAnimationFrame(update);
}

async function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms(platforms, ctx);
    ground.draw(ctx);
    startButton.draw(ctx);
    leaderboardButton.draw(ctx);

    // Display high score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`PB: ${await getPersonalBest(playerName)}`, 10, 60);
}

async function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawPlatforms(platforms, ctx);
    ground.draw(ctx);
    gameOverButton.draw(ctx);
    leaderboardButton.draw(ctx);
    score.draw(ctx);

    // Display personal best
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`PB: ${await getPersonalBest(playerName)}`, 10, 60);

    // Save the score to Firestore
    saveScore(score.score, playerId, playerName);
}

async function drawAllowOrientationScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allowOrientationButton.display();
}

async function getPersonalBest(playerName) {
    //call endpoint api/personalbest with query parameter userName
    const response = await fetch(`https://marsloeller.com/api/personalbest?userName=${playerName}`);
    if (response.ok) {
        const data = await response.json();
        return data.personalBest;
    } else {
        console.error('Error fetching personal best');
    }
}

async function saveScore(score, userId, userName) {
    const response = await fetch('https://marsloeller.com/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score, userId, userName })
    });

    if (response.ok) {
    } else {
        console.error('Error saving score');
    }
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!gameStarted && !gameOver && !showingLeaderboard) {
        if (startButton.isClicked(x, y)) {
            startGame();
        } else if (leaderboardButton.isClicked(x, y)) {
            showLeaderboard();
        }
    } else if (gameOver) {
        if (gameOverButton.isClicked(x, y)) {
            startGame();
        } else if (leaderboardButton.isClicked(x, y)) {
            showLeaderboard();
        }
    } else if (showingLeaderboard) {
        if (backButton.isClicked(x, y)) {
            showStartScreen();
        }
    }
}

function showLeaderboard() {
    gameOver = false;
    gameStarted = false;
    showingLeaderboard = true;
    leaderboard.draw(ctx, canvas.width, canvas.height);
}

function showStartScreen() {
    showingLeaderboard = false;
    drawStartScreen();
}

function handleTouchStart(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;

    if (!allowedOrientation) {
    } else if (!gameStarted && !gameOver && !showingLeaderboard) {
        if (startButton.isClicked(x, y)) {
            startGame();
        } else if (leaderboardButton.isClicked(x, y)) {
            showLeaderboard();
        }
    } else if (gameOver) {
        if (gameOverButton.isClicked(x, y)) {
            startGame();
        } else if (leaderboardButton.isClicked(x, y)) {
            showLeaderboard();
        }
    } else if (showingLeaderboard) {
        if (backButton.isClicked(x, y)) {
            showStartScreen();
        }
    }

    // Prevent default behavior to avoid scrolling
    event.preventDefault();
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleTouchStart);
window.addEventListener('deviceorientation', handleOrientation);
(async function() {
    allowedOrientation = await checkOrientationPermission();
    if (allowedOrientation) {
        showStartScreen();
    } else {
        await drawAllowOrientationScreen();
    }
})();