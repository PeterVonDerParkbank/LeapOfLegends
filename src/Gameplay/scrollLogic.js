// src/Gameplay/scrollLogic.js
import { generatePlatform, decrementTrapPlatformCount } from './platformLogic.js';
import TrapPlatform from '../Elements/trapPlatform.js';

export function calculateMaxPlatforms(score) {
    const initialMaxPlatforms = 25;
    const minPlatforms = 5;
    const scoreThreshold = 1500;
    const maxPlatforms = Math.max(minPlatforms, initialMaxPlatforms - Math.floor(score / scoreThreshold));
    return maxPlatforms;
}

export function scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, score) {
    let targetY;
    const maxScrollSpeed = 11.5;
    const minScrollSpeed = 2;

    // Determine target Y based on state
    if (player.isSomersaulting || player.jetpackActive) {
        targetY = canvas.height * 0.5; // Special states need player higher up
        const distanceToScroll = targetY - player.y;
        const scrollSpeed = Math.max(
            minScrollSpeed,
            Math.min(maxScrollSpeed, Math.abs(distanceToScroll) / 5)
        ) * delta_time_multiplier * (player.isSomersaulting ? 1.75 : 1.5);

        if (player.y < targetY) {
            // Apply scrolling during special states
            platforms.forEach(platform => {
                platform.y += scrollSpeed;
                if (platform.jetpack) platform.jetpack.y = platform.y - 30;
                if (platform.monster) platform.monster.y += scrollSpeed;
                if (platform.coin) platform.coin.y += scrollSpeed;
            });
            player.y += scrollSpeed;
        }
    } else {
        // Normal gameplay - use targetPlatformY from collision
        targetY = canvas.height - 100;
        const distanceToScroll = targetY - targetPlatformY;
        const scrollSpeed = Math.max(
            minScrollSpeed,
            Math.min(maxScrollSpeed, Math.abs(distanceToScroll) / 5)
        ) * delta_time_multiplier;

        if (targetPlatformY < targetY) {
            // Apply scrolling during normal gameplay
            platforms.forEach(platform => {
                platform.y += scrollSpeed;
                if (platform.jetpack) platform.jetpack.y = platform.y - 30;
                if (platform.monster) platform.monster.y += scrollSpeed;
                if (platform.coin) platform.coin.y += scrollSpeed;
            });
            player.y += scrollSpeed;
            targetPlatformY += scrollSpeed;
        }
    }

    // Remove off-screen platforms
    platforms = platforms.filter(p => {
        if (p.y >= canvas.height) {
            if (p instanceof TrapPlatform) decrementTrapPlatformCount();
            if (p.monster) p.monster = null;
            return false;
        }
        return true;
    });

    // Generate new platforms if needed
    const maxPlatforms = calculateMaxPlatforms(score);
    if (platforms.length < maxPlatforms) {
        const lastPlatform = platforms[platforms.length - 1];
        if (!lastPlatform || lastPlatform.y > 0) {
            generatePlatform(platforms, player, canvas, score);
        }
    }

    return { platforms, targetPlatformY, scrolling: true };
}