import PlatformFactory from '../Elements/platformFactory.js';
import { calculateMaxPlatforms } from '../Gameplay/scrollLogic.js';
import { Jetpack } from '../Elements/jetpack.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => {
        platform.draw(ctx);
        if (platform.jetpack) {
            platform.jetpack.draw(ctx);
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

export function generatePlatform(platforms, player ,canvas, score) {
    const baseMinPlatformGap = 25; // Minimum vertical gap between platforms
    const baseMaxPlatformGap = 75; // Maximum vertical gap between platforms
    const platformWidth = 75;
    const platformHeight = 17;

    // Increase the gap based on the score
    const gapIncrease = Math.floor(score / 1500) * 8; // Increase gap by 10 for every 100 points
    const minPlatformGap = Math.min(80,Math.floor(baseMinPlatformGap + gapIncrease));
    const maxPlatformGap = Math.min(180,Math.floor(baseMaxPlatformGap + gapIncrease));

    let newX, newY;
    let platformType;
    const lastPlatform = platforms[platforms.length - 1];
    newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    newX = Math.random() * (canvas.width - platformWidth);

    const determinePlatformType = Math.random();
    const maxPlatforms = calculateMaxPlatforms(score);
    const maxTrapPlatforms = Math.floor(maxPlatforms / 3);

    const movingChance = Math.min(0.15, 0.05 + (score / 10000)); // Increases with score
    const breakingChance = Math.min(0.15, 0.05 + (score / 8000));
    const jumppadChance = Math.min(0.05, 0.15 - (score / 8000));

    if (determinePlatformType < movingChance) {
        platformType = 'moving';
    } else if (determinePlatformType < movingChance + breakingChance) {
        platformType = 'breaking';
    } else if (determinePlatformType < movingChance + breakingChance + jumppadChance) {
        platformType = 'jumppad';
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
    
    if (Math.random() < 0.02 && player.jetpackActive === false && platformType === 'normal') {
        const jetpack = new Jetpack(newX+platformWidth / 2 -15 , newY - 30, 30, 30, player.startImage, player.imageWithJetpack);
        newPlatform.jetpack = jetpack;
    }
    platforms.push(newPlatform);

    
}