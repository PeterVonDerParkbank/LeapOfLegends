import Platform from './platform.js';

export default class TrapPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
    }

    draw(ctx) {
        if (!this.touched) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    touch() {
        this.touched = true;
    }
}