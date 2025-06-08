export default class UpdateNotification {
    constructor(canvas, scaleX, scaleY) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        
        // Animation properties
        this.isVisible = false;
        this.currentY = -100;
        this.targetY = 20;
        this.animationSpeed = 5;
        
        // Content
        this.updateVersion = "1.0.1";
        this.updateDate = new Date("2025-06-08").getTime(); // Update this with your actual update date
        this.updateNotes = [
            "New features and improvements!",
            "• Added new platforms",
            "• Improved performance",
            "• Bug fixes"
        ];

        // Style properties
        this.width = this.canvas.width * 0.9;
        this.height = 120;
        this.x = (this.canvas.width - this.width) / 2;
        this.padding = 15;
        
        // Close button
        this.closeButtonSize = 30;
        this.closeButtonX = this.x + this.width - this.closeButtonSize - 10;
        this.closeButtonY = this.currentY + 10;
    }

    shouldShow() {
        const lastPlayTimestamp = localStorage.getItem('lastPlayTimestamp');
        const hasSeenUpdate = localStorage.getItem('hasSeenUpdate_' + this.updateVersion);
        
        // Show if user hasn't seen this version's update and either:
        // 1. Has never played before, or
        // 2. Last played before the update
        return !hasSeenUpdate && (!lastPlayTimestamp || parseInt(lastPlayTimestamp) < this.updateDate);
    }

    markAsSeen() {
        localStorage.setItem('hasSeenUpdate_' + this.updateVersion, 'true');
        this.hide();
    }

    show() {
        this.isVisible = true;
    }

    hide() {
        this.isVisible = false;
    }

    isClickOnCloseButton(x, y) {
        return x >= this.closeButtonX &&
               x <= this.closeButtonX + this.closeButtonSize &&
               y >= this.closeButtonY &&
               y <= this.closeButtonY + this.closeButtonSize;
    }

    update() {
        if (!this.isVisible) {
            this.currentY = Math.min(this.currentY + this.animationSpeed, -100);
            return;
        }

        // Animate sliding down
        if (this.currentY < this.targetY) {
            this.currentY = Math.min(this.currentY + this.animationSpeed, this.targetY);
        }

        // Update close button position
        this.closeButtonY = this.currentY + 10;
    }

    draw() {
        if (this.currentY <= -100) return;

        this.ctx.save();

        // Draw notification background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(this.x, this.currentY, this.width, this.height, 10);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw content
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Update ' + this.updateVersion, this.x + this.padding, this.currentY + 30);

        // Draw update notes
        this.ctx.font = '14px Arial';
        this.updateNotes.forEach((note, index) => {
            this.ctx.fillText(note, this.x + this.padding, this.currentY + 55 + (index * 20));
        });

        // Draw close button
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.closeButtonX, this.closeButtonY);
        this.ctx.lineTo(this.closeButtonX + this.closeButtonSize, this.closeButtonY + this.closeButtonSize);
        this.ctx.moveTo(this.closeButtonX + this.closeButtonSize, this.closeButtonY);
        this.ctx.lineTo(this.closeButtonX, this.closeButtonY + this.closeButtonSize);
        this.ctx.stroke();

        this.ctx.restore();
    }
} 