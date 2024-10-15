import PlatformFactory from '../Elements/platformFactory.js';
import { calculateMaxPlatforms } from '../Gameplay/scrollLogic.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => platform.draw(ctx));
}
export let trapPlatformCount = 0;

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
        trapPlatformCount++;
    } else {
        platformType = 'normal';
    }
    
    platforms.push(PlatformFactory.createPlatform(platformType, newX, newY, platformWidth, platformHeight));

}