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
        if (player.direction === 'left') {
            player.image = this.playerImageWithJetpack;
        } else {
            //flip image horizontally
            const offscreenCanvas = document.createElement('canvas');
            const offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCanvas.width = player.width;
            offscreenCanvas.height = player.height;

            offscreenCtx.translate(player.width, 0);
            offscreenCtx.scale(-1, 1);
            offscreenCtx.drawImage(this.playerImageWithJetpack, 0, 0, player.width, player.height);

            player.image = offscreenCanvas;
        }
        setTimeout(() => {
            this.deactivate(player);
        }, 2500); // Deactivate jetpack after 2.5 seconds
    }

    deactivate(player) {
        this.active = false;
        player.jetpackActive = false;
        player.gravity = 0.25;

        if (player.direction === 'left') {
            console.log
            player.image = this.playerImage;
        } else {
            //flip image horizontally
            const offscreenCanvas = document.createElement('canvas');
            const offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCanvas.width = player.width;
            offscreenCanvas.height = player.height;

            offscreenCtx.translate(player.width, 0);
            offscreenCtx.scale(-1, 1);
            offscreenCtx.drawImage(this.playerImage, 0, 0, player.width, player.height);

            player.image = offscreenCanvas;
        }
        console.log('Jetpack deactivated');
    }
}