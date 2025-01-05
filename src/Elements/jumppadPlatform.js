import Platform from './platform.js';

export default class JumpPadPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.touched = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/Tiles/JumpPadTile.png';
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