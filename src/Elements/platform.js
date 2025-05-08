class Platform {

    static sharedImage = (() => {
        const img = new Image();
        img.src = '/src/assets/images/Tiles/StandardTile.webp';
        img.onload = () => { this.imageLoaded = true; };
        return img;
    })();
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.passed = false;
        this.monster = null;
        this.image = Platform.sharedImage
        this.type = 'normal';
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

export default Platform;