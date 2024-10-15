export function checkCollision(player, platforms) {
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        if (player.dy > 0 && 
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            player.dy = player.jumpStrength;
            if (platform instanceof BreakingPlatform) {
                platform.touch();
                platforms.splice(i, 1); // Remove the platform after touching it
            }
            return platform.y;
        }
    }
    return null;
}