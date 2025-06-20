import Platform from './Elements/platform.js';
import Leaderboard from './Leaderboard/leaderboard.js';
import About from './About/about.js';
import Options from './Options/options.js';
import AllowOrientationButton from './Buttons/allowOrientation.js';
import Score from './Score/score.js';
import SoundManager from './Sound/soundManager.js';
import UpdateNotification from './Elements/UpdateNotification.js';
import { drawPlatforms } from './Gameplay/platformLogic.js';
import { scrollPlatforms } from './Gameplay/scrollLogic.js';
import { checkCollision } from './Gameplay/collisionLogic.js';

// Global Variables
const initData = Telegram.WebApp.initDataUnsafe;
const userInfo = initData.user;
let allowedOrientation = false;
let gameStarted = false;
let gameOver = false;
let musicStarted = false;
let showingLeaderboard = false;
let showingAbout = false;
let showingOptions = false;
let touchedTrap = false;
let playerImage;
let playerImageWithJetpack;
let playerJumpImages;
let overlayImage;
let backgroundImage;
let background_short;
let allowOrientation_asthetics;
let gameOverOverlayImage;
let scores;
let personalbest;
let playerName = 'Peterpunsh99';
let playerId = '1';
let platforms = [];
let scrolling = false;
let collisionY = null;
let targetPlatformY = null;
const score = new Score();
const soundManager = new SoundManager();
soundManager.unlockAudio();
soundManager.addSound("jump", "/src/assets/sounds/jump.mp3");
soundManager.addSound("bgm",'/src/assets/sounds/bgm_1.mp3')
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
    speed: 8.0,
    coins: 0,
    jetpackActive: false,
    startImage: null,
    image: null,
    imageWithJetpack: null,
    jumpImages: null,
    somersaultImages: null,
    somersaultStartTime: null,
    isSomersaulting: false
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
    },
    {
        x: scaleX * 200,
        y: scaleY * 1972,
        width: scaleX * 200,
        height: scaleY * 50,
        action: showAboutScreen
    },
    {
        x: scaleX * 480,
        y: scaleY * 1972,
        width: scaleX * 250,
        height: scaleY * 50,
        action: showOptions
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
const allowOrientationButton = new AllowOrientationButton(canvas.width/2 - 100, 380, 200, 100, 'Click to enable\n device orientation');
const about = new About(canvas.width, canvas.height, scaleX, scaleY, backButtonWidth, backButtonHeight);
const options = new Options(canvas.width, canvas.height, scaleX, scaleY, backButtonWidth, backButtonHeight, soundManager);

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

// Add after other global variables
let updateNotification;

// Initialize Game
async function init() {
    try {
        await ensureFontLoaded();
        playerImage = await preloadPlayerImage('/src/assets/images/Characters/Lamb.webp');
        playerImageWithJetpack = await preloadPlayerImage('/src/assets/images/Characters/Lamb_with_jetpack_head.webp');
        playerJumpImages = [
            await preloadPlayerImage('/src/assets/images/Characters/JumpAnimation/Jump_1.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumpAnimation/Jump_2.webp')
        ];
        player.startImage = playerImage;
        player.image = playerImage; 
        player.imageWithJetpack = playerImageWithJetpack;
        player.jumpImages = playerJumpImages;
        player.somersaultImages = [
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame01.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame02.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame03.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame04.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame05.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame06.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame07.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame08.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame09.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame10.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame11.webp'),
            await preloadPlayerImage('/src/assets/images/Characters/JumppadAnimation/Frame12.webp')
        ];
        overlayImage = await preloadPlayerImage('/src/assets/images/startScreen/Overlay.webp');
        backgroundImage = await preloadPlayerImage('/src/assets/images/Background/background.webp');
        background_short = await preloadPlayerImage('/src/assets/images/Background/background_short.webp')
        allowOrientation_asthetics = await preloadPlayerImage('/src/assets/images/Background/allowOrientation_asthetic_v2.webp')
        gameOverOverlayImage = await preloadPlayerImage('/src/assets/images/GameOver/GameOver_Overlay_Lamb.webp');


        const platformImage = await preloadPlayerImage('/src/assets/images/Tiles/StandardTile.png');
        Platform.prototype.image = platformImage; // Setze das vorab geladene Bild in der Plattform-Klasse
        allowedOrientation = await checkOrientationPermission();
        if (allowedOrientation) {
            startScreenImages =  await preloadImages([
                '/src/assets/images/startScreen/StartScreen1.webp',
                '/src/assets/images/startScreen/StartScreen2.webp',
                '/src/assets/images/startScreen/StartScreen3.webp'
            ]);
            showStartScreen();
        } else {
            drawAllowOrientationScreen();
        }

        // Initialize update notification
        updateNotification = new UpdateNotification(canvas, scaleX, scaleY);
        if (updateNotification.shouldShow()) {
            updateNotification.show();
        }

        // Add touch event listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    } catch (error) {
        console.error('Error loading player image:', error);
    }
}

// Draw Player
function drawPlayer() {
    let image;
    if (player.isSomersaulting) {
        const elapsedTime = performance.now() - player.somersaultStartTime;
        const frame = Math.floor((elapsedTime / 50) % player.somersaultImages.length);
        image = player.somersaultImages[frame];
        ctx.drawImage(image, player.x, player.y, player.width, player.height);
    } else if (player.isJumping) {
        const frame = Math.floor((performance.now() / 100) % player.jumpImages.length);
        image = player.jumpImages[frame];
        if (player.direction === 'left') {
            ctx.drawImage(image, player.x, player.y, player.width, player.height);
        } else {
            // Spiegeln des Bildes horizontal
            ctx.save();
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(image, 0, 0, player.width, player.height);
            ctx.restore();
        }
    } else {
        image = player.image;
        ctx.drawImage(image, player.x, player.y, player.width, player.height);
    }
}

function animateDirectionChange(newDirection) {
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = player.width;
    offscreenCanvas.height = player.height;

    offscreenCtx.translate(player.width, 0);
    offscreenCtx.scale(-1, 1);
    offscreenCtx.drawImage(player.image, 0, 0, player.width, player.height);

    player.image = offscreenCanvas;
    player.direction = newDirection;

};

//Draw Start Screen
let startScreenFrame = 0;
let startScreenImages = [];
let startLoop = 0;
let frameDuration = [10, 2.5, 2.5]; // Duration for each frame in ticks (assuming 60 FPS, 120 ticks = 2 seconds)



async function animateStartScreen() {
    if (gameStarted || gameOver || showingLeaderboard || showingAbout || showingOptions) {
        // Hier kein neuer Loop mehr starten
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw start screen images, cycling through them. The animation should be smooth and the images should be displayed in a loop, while the first image is displayed again after the last image and for several seconds.
    ctx.drawImage(startScreenImages[startScreenFrame], 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    
    // Draw update notification if it exists
    if (updateNotification) {
        updateNotification.update();
        updateNotification.draw();
    }
    
    startLoop++;
    if (startLoop > frameDuration[startScreenFrame]) {
        startLoop = 0;
        startScreenFrame = (startScreenFrame + 1) % startScreenImages.length;
        if (startScreenFrame === 2) {
            frameDuration[0] = 240;
        }
    }
    requestAnimationFrame(animateStartScreen);
}

// Update Game State
function update(currentTime) {
    if (!gameStarted || gameOver) return;
    delta_time = currentTime - previousTime;
    delta_time_multiplier = delta_time / interval;
    player.dy += player.gravity * delta_time_multiplier;
    player.y += player.dy * delta_time_multiplier;
    if (player.y + player.height > canvas.height) {
        gameOver = true;
    }
    const monsters = platforms
        .filter(p => p.monster)
        .map(p => p.monster);
    
    monsters.forEach(monster => {
        if (monster) {
            const collision = monster.checkCollision(player);
            if (collision === 'hit') {
                gameOver = true;
            } else if (collision === 'killed') {
                score.increment(monster.platform);
                monster.isDead = true;
                scrolling = true;
            }
        }
    });

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

    const collisionResult = checkCollision(player, platforms, soundManager);
    if (collisionResult.platformY !== null) {
        targetPlatformY = collisionResult.platformY;
    }
    touchedTrap = collisionResult.touchedTrap;

    if (scrolling || player.jetpackActive || targetPlatformY !== null) {
        try {
            const result = scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, score.score);
            platforms = result.platforms;
            targetPlatformY = result.targetPlatformY;
            scrolling = result.scrolling;
        } catch (error) {
            console.log(error);
        }
    }

    platforms.forEach(platform => {
        if (player.dy < 0 && player.y < platform.y && !platform.passed) {
            platform.passed = true;
            score.increment(platform);
        }
    });

    // Check for jetpack collection
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
    score.draw(ctx,canvas,player);
    previousTime = performance.now();
    requestAnimationFrame(update);
}

// Handle Device Orientation
function handleOrientation(event) {
    if (!gameStarted) return;

    const tiltLR = event.gamma;

    // Define a maximum tilt angle for maximum speed
    const maxTilt = 45; // You can adjust this value as needed
    const maxSpeed = player.speed; // Maximum speed of the player

    // Calculate the speed based on the tilt angle
    let speed = (tiltLR / maxTilt) * maxSpeed;

    // Clamp the speed to the maximum speed
    speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed));

    // Update the player's position
    player.x += speed;

    if (speed > 0 && player.direction !== 'right') {
        animateDirectionChange('right');
    } else if (speed < 0 && player.direction !== 'left') {
        animateDirectionChange('left');
    }
}

// Start Game
function startGame() {
    gameStarted = true;
    gameOver = false;
    touchedTrap = false;
    score.reset(); // Start with 10000 points
    player.dy = player.jumpStrength;
    player.y = canvas.height - 150;
    player.x = canvas.width / 2 - 25;
    player.jetpackActive = false;
    player.direction = 'left';
    player.image = player.startImage;
    targetPlatformY = null;
    platforms = [new Platform(canvas.width/2 -50, canvas.height - 150 , 75, 17), new Platform(canvas.width/2 - 50, canvas.height - 250, 75, 17), new Platform(canvas.width/2 - 50, canvas.height - 350, 75, 17), new Platform(canvas.width/2 - 50, canvas.height - 450, 75, 17)];
    platforms.forEach(platform => platform.passed = false);
    previousTime = performance.now();
    scrolling = false;
    if (!musicStarted) {
        setTimeout(() => {
            soundManager.playMusic("bgm");
        }, 100); // 50 ms Pause
        musicStarted = true;
    }
    requestAnimationFrame(update);
}


// Draw Game Over Screen
async function drawGameOverScreen() {
    ctx.restore();
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
    if (scores.length > 0) {
        ctx.fillText(`${scores[0].score}`, canvas.width / 2, scaleY * 1435);
    } else {
        ctx.fillText(`${score.score}`, canvas.width / 2, scaleY * 1435);
    }
    //Draw the name
    ctx.fillText(`${playerName}`, canvas.width / 2, scaleY * 1595);
    await saveScore(score.score, playerId, playerName);
}

// Draw Allow Orientation Screen
async function drawAllowOrientationScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background_short, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2c4245';
    ctx.font = '40px CustomFont';
    ctx.textAlign = 'center';
    ctx.fontWeight = 'bold';
    ctx.fillText('WELCOME TO', canvas.width / 2, 70);
    ctx.fillText('LEAP OF LEGENDS',canvas.width / 2, 110)

    ctx.font = '25px CustomFont'
    ctx.fillText('Please enable device orientation', canvas.width / 2, 170)
    ctx.fillText('to play the game', canvas.width / 2, 210)
    ctx.drawImage(playerImage,canvas.width /2 - 25, 250, 50,50)
    allowOrientationButton.display();
    ctx.drawImage(allowOrientation_asthetics,canvas.width/2 - 100, 380, 200, 100)
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
    try {
        const response = await fetch('https://marsloeller.com/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score, userId, userName })
        });
        
        // Store the timestamp of when the user played
        localStorage.setItem('lastPlayTimestamp', Date.now().toString());
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Show Leaderboard
function showLeaderboard() {
    gameOver = false;
    gameStarted = false;
    showingLeaderboard = true;
    leaderboard.draw(ctx, canvas.width, canvas.height);
}

function showAboutScreen() {
    gameOver = false;
    gameStarted = false;
    showingAbout = true;
    about.draw(ctx, canvas.width, canvas.height);
}

function showOptions() {
    gameOver = false;
    gameStarted = false;
    showingLeaderboard = false;
    showingAbout = false;
    showingOptions = true;
    options.draw(ctx, canvas.width, canvas.height);
}

// Show Start Screen
function showStartScreen() {
    showingLeaderboard = false;
    gameStarted = false;
    gameOver = false;
    showingAbout = false;
    showingOptions = false;
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
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (event.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.touches[0].clientY - rect.top) * (canvas.height / rect.height);

    // Check if click is on update notification close button (check in all screens)
    if (updateNotification && updateNotification.isClickOnCloseButton(x, y)) {
        updateNotification.markAsSeen();
        return;
    }

    if (!allowedOrientation) {
        if (allowOrientationButton.isClicked(x, y)) {
            checkOrientationPermission();
        }
        return;
    }

    if (!gameStarted && !gameOver && !showingLeaderboard && !showingAbout && !showingOptions) {
        buttons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (showingLeaderboard) {
        if (leaderboard && typeof leaderboard.handleTouchStart === 'function') {
            const handled = leaderboard.handleTouchStart(event, rect);
            if (handled) {
                event.preventDefault();
                return;
            }
        }
        MenuButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (showingAbout) {
        if (about && typeof about.handleTouchStart === 'function') {
            const handled = about.handleTouchStart(event, rect);
            if (handled) {
                event.preventDefault();
                return;
            }
        }
        MenuButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (showingOptions) {
        if (options && typeof options.handleTouchStart === 'function') {
            const handled = options.handleTouchStart(event.touches[0], rect);
            if (handled) {
                event.preventDefault();
                return;
            }
        }
        MenuButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    } else if (gameOver) {
        GameOverButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
            }
        });
    }
}

// Add touch move and end handlers for the sliders
canvas.addEventListener('touchmove', function(event) {
    if (showingOptions) {
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        options.handleTouchMove(touch, rect);
        event.preventDefault();
    }
});

canvas.addEventListener('touchend', function(event) {
    if (showingOptions) {
        const touch = event.changedTouches[0];
        options.handleTouchEnd(touch);
    }
});

// Keep only touch event listeners
canvas.addEventListener('touchstart', handleTouchStart);

// Add back the orientation button listener
allowOrientationButton.addClickListener(async () => {
    allowedOrientation = await checkOrientationPermission();
    if (allowedOrientation) {
        allowOrientationButton.hide();
        init();
    }
});

// Add these handlers after handleTouchStart
function handleTouchMove(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();

    if (showingOptions && options && typeof options.handleTouchMove === 'function') {
        options.handleTouchMove(event.touches[0], rect);
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    if (showingOptions && options && typeof options.handleTouchEnd === 'function') {
        // Wenn es changedTouches gibt, nehmen wir den ersten, sonst null
        const touch = event.changedTouches ? event.changedTouches[0] : null;
        options.handleTouchEnd(touch || { identifier: null });
    }
}

// Start Initialization
init();