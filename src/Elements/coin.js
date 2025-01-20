export class Coin {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collected = false;
        this.image = new Image();
        this.image.src = 'src/assets/images/Collectables/coin_olympus.png';
    }

    draw(ctx) {
        if (!this.collected) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}