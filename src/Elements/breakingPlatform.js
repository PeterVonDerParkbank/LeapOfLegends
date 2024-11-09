import Platform from './platform.js';

export default class BreakingPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/Tiles/BreakingTile.png';
    }

    draw(ctx) {
        if (!this.touched) {
            if (this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            } else {
                this.image.onload = () => {
                    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                };
            }
        }
    }

    touch() {
        this.touched = true;
    }
}