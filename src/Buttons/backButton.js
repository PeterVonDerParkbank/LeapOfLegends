export default class BackButton {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.image = new Image();
        this.image.src = 'src/assets/images/leaderBoardScreen/backButton.png';
        this.image.loaded = false;
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            console.log('Starting to load image');
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            console.log('Image drawn');

        }
    }

    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }
}