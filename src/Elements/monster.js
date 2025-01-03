export default class Monster {
    constructor(x, y, width, height, platform) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.platform = platform;
        this.isDead = false;
        this.image = new Image();
        this.image.src = '/src/assets/images/Characters/Monster.png';
        this.deathTime = 0;
    }

    draw(ctx) {
        if (!this.isDead) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update(delta_time_multiplier) {
        if (!this.isDead) {
            // Stay on platform
            this.y = this.platform.y - this.height;
        }
    }

    checkCollision(player) {
        if (this.isDead) return false;

        // Check if player is above monster (jump-kill)
        const playerBottom = player.y + player.height;
        const monsterTop = this.y;
        const verticalOverlap = playerBottom - monsterTop;
        const killZoneHeight = 10; // Tolerance zone in pixels
        
        if (player.dy > 0 && // Player is falling
            verticalOverlap >= 0 && 
            verticalOverlap <= killZoneHeight && // Only count as kill if mostly above
            player.y < monsterTop && // Player must be above monster
            player.x < this.x + this.width &&
            player.x + player.width > this.x) {
            this.isDead = true;
            player.dy = player.jumpStrength; // Bounce off monster
            return 'killed';
        }

        // Regular collision (player dies)
        if (player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y &&
            player.jetpackActive === false) {
            return 'hit';
        }

        return false;
    }
}