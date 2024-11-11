import Platform from './platform.js';

export default class MovingPlatform extends Platform {
    constructor(x, y, width, height, speed = 1.5) {
        super(x, y, width, height);
        this.speed = speed;
        this.direction = 1; // 1 for right, -1 for left
        this.image = new Image();
        this.image.src = '/src/assets/images/Tiles/MovingTile.png';
    }

    update(canvas) {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.direction *= -1; // Change direction
        }
    }

    draw(ctx) {
        this.update(ctx.canvas);
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            this.image.onload = () => {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            };
        }
    }
}