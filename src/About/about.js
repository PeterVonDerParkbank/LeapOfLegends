import BackButton from '../Buttons/backButton.js';

export default class About {
    constructor(canvas_width, canvas_height, scaleX, scaleY, backButtonWidth, backButtonHeight) {
        const backButtonY = canvas_height - 120;
        this.backButton = new BackButton(
            canvas_width / 2 - scaleX * backButtonWidth / 2,
            backButtonY,
            scaleX * backButtonWidth,
            scaleY * backButtonHeight,
            'Back'
        );

        // Bild laden und Flag setzen
        this.imageLoaded = false;
        this.backgroundImage = new Image();
        this.backgroundImage.src = '/src/assets/images/Background/aboutBackground.webp';
        this.backgroundImage.onload = () => {
            this.imageLoaded = true;
        };
    }


    async draw(ctx, canvas_width, canvas_height) {
        if (!this.imageLoaded) {
            return;
        }    // Warte bis Bild geladen ist
        
        ctx.clearRect(0, 0, canvas_width, canvas_height);
        ctx.drawImage(this.backgroundImage, 0, 0, canvas_width, canvas_height);

        // Überschrift
        ctx.fillStyle = '#539ea9';
        ctx.font = '40px CustomFont';
        ctx.textAlign = 'center';
        ctx.fillText('ABOUT US', canvas_width / 2, 70);

        // Textfarbe und -stil
        ctx.fillStyle = '#2c4245';
        ctx.font = '20px CustomFont';
        ctx.textAlign = 'center';

        // Texte mit Zeilenumbruch
        const maxWidth = canvas_width * 0.9;
        const lineHeight = 25;
        let y = 110;

        const texts = [
            "You've been trapped for what feels like forever, held prisoner in the Cyclops' dark, stony cave.",
            "Heart pounding, you seize your chance and sprint toward the cave's entrance, each step faster than the last, the light of freedom just within reach.",
            "Try to reach the highest platform one leap at a time before the Cyclops catches you!",
            "Brought to you by Olympus Prime.",
            "Follow us on X.",
            "https://x.com/olympusprime"
        ];

        texts.forEach(text => {
            y = this.wrapText(ctx, text, canvas_width / 2, y, maxWidth, lineHeight);
            y += 20;
        });

        this.backButton.draw(ctx);
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, y);
        return y + lineHeight;
    }
}