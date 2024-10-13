import { generatePlatform } from './platformLogic.js';

export function scrollPlatforms(platforms, player, canvas, targetPlatformY, delta_time_multiplier, maxPlatforms) {
    const targetY = canvas.height - 50; // Target position above the bottom edge
    const distanceToScroll = targetY - targetPlatformY;
    const maxScrollSpeed = 5; // Maximum scroll speed
    const minScrollSpeed = 1; // Minimum scroll speed

    // Calculate dynamic scroll speed based on distance
    const scrollSpeed = Math.max(minScrollSpeed, Math.min(maxScrollSpeed, distanceToScroll / 10) * delta_time_multiplier);
    console.log(distanceToScroll);
    if (targetPlatformY + scrollSpeed < targetY) {
        platforms.forEach(p => {
            p.y += scrollSpeed;
        });
        player.y += scrollSpeed;
        targetPlatformY += scrollSpeed; // Update targetPlatformY to reflect the new position

        // Remove platforms that are out of view
        platforms = platforms.filter(p => p.y < canvas.height);

        // Generate new platform during scrolling if the number of platforms is less than maxPlatforms
        while (platforms.length < maxPlatforms) {
            if (platforms.length === 0) {
                generatePlatform(platforms, canvas);
            } else {
                const lastPlatform = platforms[platforms.length - 1];
                if (lastPlatform.y > 0) {
                    generatePlatform(platforms, canvas);
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