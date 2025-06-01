import BackButton from '../Buttons/backButton.js';

export default class Options {
    constructor(canvas_width, canvas_height, scaleX, scaleY, backButtonWidth, backButtonHeight, soundManager) {
        this.soundManager = soundManager;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.ctx = null; // Speichern des Context
        const backButtonY = canvas_height - 120;
        this.backButton = new BackButton(
            canvas_width / 2 - scaleX * backButtonWidth / 2,
            backButtonY,
            scaleX * backButtonWidth,
            scaleY * backButtonHeight,
            'Back'
        );

        // Slider positions and dimensions
        this.sliderWidth = 200;
        this.sliderHeight = 20;
        this.musicSliderX = canvas_width / 2 - this.sliderWidth / 2;
        this.musicSliderY = 150;
        this.effectsSliderX = canvas_width / 2 - this.sliderWidth / 2;
        this.effectsSliderY = 250;

        // Load background image
        this.imageLoaded = false;
        this.backgroundImage = new Image();
        this.backgroundImage.src = '/src/assets/images/Background/background_short.webp';
        this.backgroundImage.onload = () => {
            this.imageLoaded = true;
        };

        // Track if sliders are being dragged
        this.activeTouchId = null;
        this.activeSlider = null;
    }

    handleTouchStart(touch, rect) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if touch is within music slider bounds
        if (this.isInSlider(x, y, this.musicSliderX, this.musicSliderY)) {
            this.activeTouchId = touch.identifier;
            this.activeSlider = 'music';
            this.updateMusicVolume(x);
            return true;
        }
        // Check if touch is within effects slider bounds
        else if (this.isInSlider(x, y, this.effectsSliderX, this.effectsSliderY)) {
            this.activeTouchId = touch.identifier;
            this.activeSlider = 'effects';
            this.updateEffectsVolume(x);
            return true;
        }
        return false;
    }

    handleTouchMove(touch, rect) {
        if (touch.identifier !== this.activeTouchId) return;

        const x = touch.clientX - rect.left;
        
        if (this.activeSlider === 'music') {
            this.updateMusicVolume(x);
        } else if (this.activeSlider === 'effects') {
            this.updateEffectsVolume(x);
        }
    }

    handleTouchEnd(touch) {
        if (touch.identifier === this.activeTouchId) {
            this.activeTouchId = null;
            this.activeSlider = null;
        }
    }

    isInSlider(x, y, sliderX, sliderY) {
        const touchArea = 40; // Größerer Bereich für Touch-Interaktion
        return x >= sliderX && x <= sliderX + this.sliderWidth &&
               y >= sliderY - touchArea/2 && y <= sliderY + this.sliderHeight + touchArea/2;
    }

    updateMusicVolume(x) {
        let percentage = (x - this.musicSliderX) / this.sliderWidth;
        percentage = Math.max(0, Math.min(1, percentage));
        this.soundManager.setMusicVolume(percentage);
        if (this.ctx) {
            this.draw(this.ctx, this.canvas_width, this.canvas_height);
        }
    }

    updateEffectsVolume(x) {
        let percentage = (x - this.effectsSliderX) / this.sliderWidth;
        percentage = Math.max(0, Math.min(1, percentage));
        this.soundManager.setEffectsVolume(percentage);
        if (this.ctx) {
            this.draw(this.ctx, this.canvas_width, this.canvas_height);
        }
    }

    draw(ctx, canvas_width, canvas_height) {
        this.ctx = ctx; // Speichern des Context für spätere Updates
        if (!this.imageLoaded) return;

        ctx.clearRect(0, 0, canvas_width, canvas_height);
        ctx.drawImage(this.backgroundImage, 0, 0, canvas_width, canvas_height);

        // Draw title
        ctx.fillStyle = '#539ea9';
        ctx.font = '40px CustomFont';
        ctx.textAlign = 'center';
        ctx.fillText('OPTIONS', canvas_width / 2, 70);

        // Draw slider labels
        ctx.fillStyle = '#2c4245';
        ctx.font = '25px CustomFont';
        ctx.fillText('Music Volume', canvas_width / 2, this.musicSliderY - 20);
        ctx.fillText('Effects Volume', canvas_width / 2, this.effectsSliderY - 20);

        // Draw sliders
        this.drawSlider(ctx, this.musicSliderX, this.musicSliderY, this.soundManager.getMusicVolume());
        this.drawSlider(ctx, this.effectsSliderX, this.effectsSliderY, this.soundManager.getEffectsVolume());

        // Draw volume percentages
        ctx.fillStyle = '#2c4245';
        ctx.font = '20px CustomFont';
        ctx.fillText(`${Math.round(this.soundManager.getMusicVolume() * 100)}%`, 
            this.musicSliderX + this.sliderWidth + 40, this.musicSliderY + 15);
        ctx.fillText(`${Math.round(this.soundManager.getEffectsVolume() * 100)}%`, 
            this.effectsSliderX + this.sliderWidth + 40, this.effectsSliderY + 15);

        this.backButton.draw(ctx);
    }

    drawSlider(ctx, x, y, value) {
        // Draw slider background
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x, y, this.sliderWidth, this.sliderHeight);

        // Draw filled portion
        ctx.fillStyle = '#539ea9';
        ctx.fillRect(x, y, this.sliderWidth * value, this.sliderHeight);

        // Draw slider border
        ctx.strokeStyle = '#2c4245';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.sliderWidth, this.sliderHeight);

        // Draw slider handle
        const handleX = x + (this.sliderWidth * value);
        ctx.fillStyle = '#2c4245';
        ctx.beginPath();
        ctx.arc(handleX, y + this.sliderHeight / 2, 10, 0, Math.PI * 2);
        ctx.fill();
    }
} 