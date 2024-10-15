import Platform from '../Elements/platform.js';
import MovingPlatform from '../Elements/movingPlatform.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => platform.draw(ctx));
}

export function generatePlatform(platforms, canvas, score) {
    const baseMinPlatformGap = 10; // Minimum vertical gap between platforms
    const baseMaxPlatformGap = 100; // Maximum vertical gap between platforms
    const platformWidth = 100;
    const platformHeight = 10;

    // Increase the gap based on the score
    const gapIncrease = Math.floor(score / 1000) * 10; // Increase gap by 10 for every 100 points
    const minPlatformGap = Math.min(80,Math.floor(baseMinPlatformGap + gapIncrease));
    const maxPlatformGap = Math.min(180,Math.floor(baseMaxPlatformGap + gapIncrease));

    let newX, newY;

    const lastPlatform = platforms[platforms.length - 1];
    newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    newX = Math.random() * (canvas.width - platformWidth);

    const isMovingPlatform = Math.random() < 0.1; // 10% chance of generating a moving platform
    if (isMovingPlatform) {
        platforms.push(new MovingPlatform(newX, newY, platformWidth, platformHeight));
    } else {
        platforms.push(new Platform(newX, newY, platformWidth, platformHeight));
    }
}