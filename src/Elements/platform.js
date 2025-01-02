class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.passed = false;
        this.monster = null;
        this.image = Platform.prototype.image || new Image();
        this.image.src = '/src/assets/images/Tiles/StandardTile.png';
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

export default Platform;