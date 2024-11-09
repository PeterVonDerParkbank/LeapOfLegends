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
    const baseMinPlatformGap = 10; // Minimum vertical gap between platforms
    const baseMaxPlatformGap = 100; // Maximum vertical gap between platforms
    const platformWidth = 75;
    const platformHeight = 17;

    // Increase the gap based on the score
    const gapIncrease = Math.floor(score / 1000) * 10; // Increase gap by 10 for every 100 points
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
    if (determinePlatformType < 0.1) {
        platformType = 'moving';
    } else if (determinePlatformType < 0.2) {
        platformType = 'breaking';
    } else if (determinePlatformType < 0.25 && trapPlatformCount < maxTrapPlatforms) {
        platformType = 'trap';
        incrementTrapPlatformCount();
    } else {
        platformType = 'normal';
    }
    
    const newPlatform = PlatformFactory.createPlatform(platformType, newX, newY, platformWidth, platformHeight);
    if (Math.random() < 0.03 && player.jetpackActive === false && platformType === 'normal') {
        const jetpack = new Jetpack(newX+platformWidth / 2 -15, newY - 50, 30, 50);
        newPlatform.jetpack = jetpack;
    }
    platforms.push(newPlatform);

    
}