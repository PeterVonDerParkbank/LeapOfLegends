import Platform from '../Elements/platform.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => platform.draw(ctx));
}

export function generatePlatform(platforms, canvas) {
    const minPlatformGap = 80; // Minimum vertical gap between platforms
    const maxPlatformGap = 180; // Maximum vertical gap between platforms
    const platformWidth = 100;
    const platformHeight = 10;

    let newX, newY;

    const lastPlatform = platforms[platforms.length - 1];
    newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    newX = Math.random() * (canvas.width - platformWidth);
 
    platforms.push(new Platform(newX, newY, platformWidth, platformHeight));
}