export default class BackButton {
    static sharedImage = (() => {
        const img = new Image();
        img.src = 'src/assets/images/leaderBoardScreen/backButton.webp';
        img.onload = () => { this.imageLoaded = true; };
        return img;
    })();
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.image = BackButton.sharedImage
        this.image.loaded = false;
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        }
    }

    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }
}