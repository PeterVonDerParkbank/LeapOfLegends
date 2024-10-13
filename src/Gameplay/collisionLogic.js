export function checkCollision(player, platforms) {
    for (let platform of platforms) {
        if (player.dy > 0 && 
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            player.dy = player.jumpStrength;
            // Start scrolling when the player reaches a platform
            return platform.y;
        }
    }
    return null;
}