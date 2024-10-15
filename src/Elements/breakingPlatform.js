import Platform from './platform.js';

export default class BreakingPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
    }

    draw(ctx) {
        if (!this.touched) {
            ctx.fillStyle = 'brown';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    touch() {
        this.touched = true;
    }
}