import Platform from './platform.js';

export default class BreakingPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/Tiles/BreakingTile.png';
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.type = 'breaking';
    }

    draw(ctx) {
        if (!this.touched && this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    touch() {
        this.touched = true;
    }
}