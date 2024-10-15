import Platform from './platform.js';

export default class MovingPlatform extends Platform {
    constructor(x, y, width, height, speed = 2) {
        super(x, y, width, height);
        this.speed = speed;
        this.direction = 1; // 1 for right, -1 for left
    }

    update(canvas) {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.direction *= -1; // Change direction
        }
    }

    draw(ctx) {
        this.update(ctx.canvas);
        super.draw(ctx);
    }
}