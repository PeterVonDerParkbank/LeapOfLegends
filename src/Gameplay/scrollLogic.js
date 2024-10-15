import { generatePlatform,trapPlatformCount } from './platformLogic.js';
import TrapPlatform from '../Elements/trapPlatform.js';

export function calculateMaxPlatforms(score)  {
    const initialMaxPlatforms = 15;
    const minPlatforms = 3;
    const scoreThreshold = 1000;
    const maxPlatforms = Math.max(minPlatforms, initialMaxPlatforms - Math.floor(score / scoreThreshold));
    return maxPlatforms;
}

export function scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, score) {
    const targetY = canvas.height - 50; // Target position above the bottom edge
    const distanceToScroll = targetY - targetPlatformY;
    const maxScrollSpeed = 5; // Maximum scroll speed
    const minScrollSpeed = 1; // Minimum scroll speed

    // Calculate dynamic scroll speed based on distance
    const scrollSpeed = Math.max(minScrollSpeed, Math.min(maxScrollSpeed, distanceToScroll / 10) * delta_time_multiplier);
    const maxPlatforms = calculateMaxPlatforms(score);
    if (targetPlatformY + scrollSpeed < targetY) {

        platforms.forEach(p => {
            p.y += scrollSpeed;
        });

        player.y += scrollSpeed;
        targetPlatformY += scrollSpeed; // Update targetPlatformY to reflect the new position

        // Remove platforms that are out of view
        platforms = platforms.filter(p => {
            if (p.y >= canvas.height) {
                if (p instanceof TrapPlatform) {
                    trapPlatformCount--; // Decrement the trap platform count
                }
                return false; // Remove the platform
            }
            return true; // Keep the platform
        });
        // Generate new platform during scrolling if the number of platforms is less than maxPlatforms
        if (platforms.length < maxPlatforms) {
            if (platforms.length === 0) {
                generatePlatform(platforms, canvas, score);
            } else {
                const lastPlatform = platforms[platforms.length - 1];
                if (lastPlatform.y > 0) {
                    generatePlatform(platforms, canvas, score);
                }
            }
        }
    } else {
        const remainingDistance = targetY - targetPlatformY;
        platforms.forEach(p => {
            p.y += remainingDistance;
        });
        player.y += remainingDistance;
        return { platforms, targetPlatformY, scrolling: false }; // Scrolling finished
    }
    return { platforms, targetPlatformY ,scrolling: true }; // Scrolling continues
}