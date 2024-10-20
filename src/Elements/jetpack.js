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
        player.gravity = -0.1; // Reduce gravity to simulate jetpack lift
        player.dy = -5; // Give an initial boost
        setTimeout(() => {
            this.deactivate(player);
        }, 1500); // Deactivate jetpack after 2.5 seconds
    }

    deactivate(player) {
        this.active = false;
        player.jetpackActive = false;
        console.log('Jetpack deactivated');
        player.gravity = 0.25; // Reset gravity to normal
    }
}