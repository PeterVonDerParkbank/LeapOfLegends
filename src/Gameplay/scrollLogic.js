// src/Gameplay/scrollLogic.js
import { generatePlatform, decrementTrapPlatformCount } from './platformLogic.js';
import TrapPlatform from '../Elements/trapPlatform.js';

export function calculateMaxPlatforms(score) {
    const initialMaxPlatforms = 15;
    const minPlatforms = 3;
    const scoreThreshold = 1000;
    const maxPlatforms = Math.max(minPlatforms, initialMaxPlatforms - Math.floor(score / scoreThreshold));
    return maxPlatforms;
}

export function scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, score) {
    const targetY = canvas.height - 100; // Target position above the bottom edge
    const distanceToScroll = targetY - targetPlatformY;
    const maxScrollSpeed = 11.5; // Increased maximum scroll speed
    const minScrollSpeed = 2; // Increased minimum scroll speed
    // Calculate dynamic scroll speed based on distance to scroll
    const scrollSpeed = Math.max(minScrollSpeed, Math.min(maxScrollSpeed, Math.abs(distanceToScroll) / 5) * delta_time_multiplier);
    const maxPlatforms = calculateMaxPlatforms(score);

    const dynamicThreshold = canvas.height - 100; // Dynamic threshold for scrolling

    if (targetPlatformY + scrollSpeed < targetY || player.jetpackActive) {
        platforms.forEach(platform => {
            platform.y += scrollSpeed;
            if (platform.jetpack) {
                platform.jetpack.y = platform.y - 30;
            }
        });

        player.y += scrollSpeed;
        targetPlatformY += scrollSpeed; // Update targetPlatformY to reflect the new position

        // Remove platforms that are out of view
        platforms = platforms.filter(p => {
            if (p.y >= canvas.height) {
                if (p instanceof TrapPlatform) {
                    decrementTrapPlatformCount();
                }
                return false;
            }
            return true;
        });

        // Generate new platform during scrolling if the number of platforms is less than maxPlatforms
        if (platforms.length < maxPlatforms) {
            if (platforms.length === 0) {
                generatePlatform(platforms, canvas, player, score);
            } else {
                const lastPlatform = platforms[platforms.length - 1];
                if (lastPlatform.y > 0) {
                    generatePlatform(platforms, player, canvas, score);
                }
            }
        }
    } else {
        if (targetPlatformY > dynamicThreshold) {
            console.log(targetPlatformY);
            targetPlatformY = dynamicThreshold; // Ensure targetPlatformY does not exceed the maximum value
        };
        const remainingDistance = targetY - targetPlatformY;
        platforms.forEach(p => {
            p.y += remainingDistance;
        });
        player.y += remainingDistance;
        player.jetpackActive = false; // Deactivate jetpack
        return { platforms, targetPlatformY, scrolling: false }; // Scrolling finished
    }
    return { platforms, targetPlatformY, scrolling: true }; // Scrolling continues
}