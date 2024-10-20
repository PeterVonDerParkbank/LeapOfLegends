// src/Elements/jetpack.js
export class Jetpack {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/jetpack.png'; // Path to your jetpack image
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    activate(player) {
        this.active = true;
        player.dy = -10; // Give an initial boost
        player.gravity = 0; // Disable gravity while jetpack is active
        setTimeout(() => {
            this.deactivate(player);
        }, 2500); // Deactivate jetpack after 2.5 seconds
    }

    deactivate(player) {
        this.active = false;
        player.jetpackActive = false;
        player.gravity = 0.25;
        console.log('Jetpack deactivated');
    }
}