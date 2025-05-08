import Platform from './platform.js';

export default class BreakingPlatform extends Platform {
    static sharedImage = (() => {
        const img = new Image();
        img.src = '/src/assets/images/Tiles/BreakingTile.webp';
        img.onload = () => { this.imageLoaded = true; };
        return img;
    })();
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
        this.image = BreakingPlatform.sharedImage;
        this.type = 'breaking';
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