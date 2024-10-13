import Platform from '../Elements/platform.js';

export function drawPlatforms(platforms, ctx) {
    platforms.forEach(platform => platform.draw(ctx));
}

export function generatePlatform(platforms, canvas) {
    const minPlatformGap = 80; // Minimum vertical gap between platforms
    const maxPlatformGap = 180; // Maximum vertical gap between platforms
    const platformWidth = 100;
    const platformHeight = 10;

    const lastPlatform = platforms[platforms.length - 1];
    const newY = lastPlatform.y - (Math.random() * (maxPlatformGap - minPlatformGap) + minPlatformGap);
    const newX = Math.random() * (canvas.width - platformWidth);

    platforms.push(new Platform(newX, newY, platformWidth, platformHeight));
}