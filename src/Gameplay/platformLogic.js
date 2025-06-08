import PlatformFactory from '../Elements/platformFactory.js';
import MonsterFactory from '../Elements/monsterFactory.js';
import { calculateMaxPlatforms } from '../Gameplay/scrollLogic.js';
import { Jetpack } from '../Elements/jetpack.js';
import { Coin } from '../Elements/coin.js';
import TrapPlatform from '../Elements/trapPlatform.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => {
        platform.draw(ctx);
    });
    platforms.forEach(platform => {
        if (platform.jetpack) {
            platform.jetpack.draw(ctx);
        }
        if (platform.monster) {
            platform.monster.draw(ctx);
        }
        if (platform.coin) {
            platform.coin.draw(ctx);
        }
    });
}
let trapPlatformCount = 0;

export function getTrapPlatformCount() {
    return trapPlatformCount;
}

export function incrementTrapPlatformCount() {
    trapPlatformCount++;
}

export function decrementTrapPlatformCount() {
    trapPlatformCount--;
}

// Calculate maximum jump height using physics formulas
function calculateMaxJumpHeight(jumpStrength, gravity) {
    // Using the formula: h = v0^2 / (2g) where v0 is initial velocity and g is gravity
    // Negative jumpStrength means upward velocity
    return Math.abs((jumpStrength * jumpStrength) / (2 * gravity));
}

export function generatePlatform(platforms, player, canvas, score) {
    const baseMinPlatformGap = 25;
    const baseMaxPlatformGap = 75;
    const platformWidth = 75;
    const platformHeight = 17;

    // Calculate max jump height
    const maxJumpHeight = calculateMaxJumpHeight(player.jumpStrength, player.gravity);
    
    // Increase the gap based on the score, but ensure it doesn't exceed max jump height
    const gapIncrease = Math.floor(score / 1500) * 8;
    const minPlatformGap = Math.min(80, Math.floor(baseMinPlatformGap + gapIncrease));
    const maxPlatformGap = Math.min(Math.floor(maxJumpHeight * 0.85), Math.min(180, Math.floor(baseMaxPlatformGap + gapIncrease)));

    let newX, newY;
    let platformType;
    const lastPlatform = platforms[platforms.length - 1];
    
    // Get all platforms within potential jump range
    const reachablePlatforms = platforms.filter(p => {
        const verticalDist = lastPlatform.y - p.y;
        return verticalDist > 0 && verticalDist <= maxJumpHeight;
    });

    // Check if there are any safe platforms (non-trap) within reach
    const hasReachableSafePlatform = reachablePlatforms.some(p => !(p instanceof TrapPlatform));

    newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    newX = Math.random() * (canvas.width - platformWidth);

    // Check if new platform is overlapping a monster in platform.monster
    const buffer = 5;
    const isOverlapping = platforms.some(platform => {
        if (!platform.monster) return false;
        return newY < (platform.monster.y + platform.monster.height + buffer) &&
            (newY + platformHeight + buffer) > platform.monster.y &&
            newX < (platform.monster.x + platform.monster.width + buffer) &&
            (newX + platformWidth + buffer) > platform.monster.x;
    });

    if (isOverlapping) {
        newY = newY - 60 - buffer;
    }

    const determinePlatformType = Math.random();
    const maxPlatforms = calculateMaxPlatforms(score);
    const maxTrapPlatforms = Math.floor(maxPlatforms / 3);

    const movingChance = Math.min(0.4, 0.06 + (score / 50000));
    const breakingChance = Math.min(0.2, 0.06 + (score / 100000));
    const jumppadChance = Math.max(0.02, 0.15 - (score / 50000));
    let trapChance = Math.min(0.02, 0.05 + (score / 100000));

    // If there's no reachable safe platform, force this one to be safe
    if (!hasReachableSafePlatform) {
        trapChance = 0;
    }

    if (determinePlatformType < movingChance) {
        platformType = 'moving';
    } else if (determinePlatformType < movingChance + breakingChance) {
        platformType = 'breaking';
    } else if (determinePlatformType < movingChance + breakingChance + jumppadChance) {
        platformType = 'jumppad';
    } else if (determinePlatformType < movingChance + breakingChance + jumppadChance + trapChance && trapPlatformCount < maxTrapPlatforms) {
        platformType = 'trap';
        incrementTrapPlatformCount();
    } else {
        platformType = 'normal';
    }
    
    const newPlatform = PlatformFactory.createPlatform(platformType, newX, newY, platformWidth, platformHeight);
    if (platformType === 'moving') {
        const baseSpeed = 2;
        const maxSpeedIncrease = 4;
        const speedIncrease = Math.min(maxSpeedIncrease, Math.floor(score / 4000));
        newPlatform.speed = baseSpeed + speedIncrease;
    }
    
    if (Math.random() < 0.01 && player.jetpackActive === false && platformType === 'normal' && score > 500) {
        const jetpack = new Jetpack(newX+platformWidth / 2 -15 , newY - 30, 30, 30, player.startImage, player.imageWithJetpack);
        newPlatform.jetpack = jetpack;
    } else if (Math.random() > 1 && platformType === 'normal') {
        const coin = new Coin(
            newX + platformWidth / 2 - 15, 
            newY - 30, 
            30, 
            30
        );
        newPlatform.coin = coin;
    }

    const shouldSpawnMonster = Math.random() < 0.04 && // 4% chance
                            score > 500 && // Only spawn monsters after 500 points
                            !newPlatform.jetpack &&
                            platformType === 'normal' &&
                            player.jetpackActive === false
    
    if (shouldSpawnMonster) {
        newPlatform.monster = MonsterFactory.createMonster(newPlatform, canvas, platforms);
    }
    platforms.push(newPlatform);

    
}