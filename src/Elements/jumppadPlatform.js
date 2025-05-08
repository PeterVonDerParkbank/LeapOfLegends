import Platform from './platform.js';

export default class JumpPadPlatform extends Platform {
    static sharedImage = (() => {
        const img = new Image();
        img.src = '/src/assets/images/Tiles/JumpPadTile.webp';
        img.onload = () => { this.imageLoaded = true; };
        return img;
    })();
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
        this.image = JumpPadPlatform.sharedImage
        this.type = 'jumppad';
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