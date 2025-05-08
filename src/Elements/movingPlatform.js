import Platform from './platform.js';

export default class MovingPlatform extends Platform {
    static sharedImage = (() => {
        const img = new Image();
        img.src = '/src/assets/images/Tiles/MovingTile.webp';
        img.onload = () => { this.imageLoaded = true; };
        return img;
    })();
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speed = 2; // Default speed
        this.direction = 1;
        this.image = MovingPlatform.sharedImage
        this.type = 'moving';
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