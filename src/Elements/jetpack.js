// src/Elements/jetpack.js
export class Jetpack {
    constructor(x, y, width, height, playerImage, playerImageWithJetpack) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/shoes.png';
        this.playerImageWithJetpack = playerImageWithJetpack;
        this.playerImage = playerImage;
    }

    draw(ctx) {
        if (!this.active) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    activate(player) {
        this.active = true;
        player.dy = -10; // Give an initial boost
        player.gravity = 0; // Disable gravity while jetpack is active
        player.image = this.playerImageWithJetpack;
        setTimeout(() => {
            this.deactivate(player);
        }, 2500); // Deactivate jetpack after 2.5 seconds
    }

    deactivate(player) {
        this.active = false;
        player.jetpackActive = false;
        player.gravity = 0.25;
        player.image = this.playerImage;
        console.log('Jetpack deactivated');
    }
}