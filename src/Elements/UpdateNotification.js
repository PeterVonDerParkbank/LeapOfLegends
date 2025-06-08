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
            "• Added this notification banner",
            "• Improved platform generation, so that impossible jumps should no longer happen",
            "• Top10 only shows 1 score per player",
            "• Increased moving platform spawn rate for higher scores",
        ];

        // Style constants
        this.lineHeight = 20;
        this.titleHeight = 35;
        this.padding = 15;
        this.maxWidth = 325; // Maximum width for text lines

        this.updateLayout();
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        // Wenn das erste Wort schon zu lang ist, teile es
        if (this.ctx.measureText(currentLine).width > maxWidth) {
            let chars = currentLine.split('');
            currentLine = chars[0];
            for (let i = 1; i < chars.length; i++) {
                if (this.ctx.measureText(currentLine + chars[i]).width <= maxWidth) {
                    currentLine += chars[i];
                } else {
                    lines.push(currentLine);
                    currentLine = chars[i];
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = '';
        }

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + (currentLine ? " " : "") + word).width;
            
            if (width <= maxWidth) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                // Wenn das aktuelle Wort selbst zu lang ist
                if (this.ctx.measureText(word).width > maxWidth) {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    let chars = word.split('');
                    currentLine = chars[0];
                    for (let j = 1; j < chars.length; j++) {
                        if (this.ctx.measureText(currentLine + chars[j]).width <= maxWidth) {
                            currentLine += chars[j];
                        } else {
                            lines.push(currentLine);
                            currentLine = chars[j];
                        }
                    }
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }

    calculateContentHeight() {
        this.ctx.font = '14px CustomFont';
        let totalHeight = this.titleHeight; // Start with space for title

        // Calculate height needed for all wrapped text
        this.wrappedNotes = [];
        this.updateNotes.forEach(note => {
            const wrappedLines = this.wrapText(note, this.maxWidth);
            this.wrappedNotes.push(wrappedLines);
            totalHeight += wrappedLines.length * this.lineHeight;
        });

        return totalHeight + this.padding * 2; // Add padding top and bottom
    }

    updateLayout() {
        // Set context for text measurements
        this.ctx.font = '14px CustomFont';
        
        // Style properties - recalculate on demand
        this.width = Math.min(this.canvas.width * 0.9, 400);
        this.height = this.calculateContentHeight();
        this.x = (this.canvas.width - this.width) / 2;
        
        // Close button - kleiner und mit mehr Padding vom Rand
        this.closeButtonSize = 20;
        this.closeButtonX = this.x + this.width - this.closeButtonSize - 15;
        this.closeButtonY = this.currentY + 15;
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
        this.updateLayout(); // Ensure correct positioning when showing
    }

    hide() {
        this.isVisible = false;
    }

    isClickOnCloseButton(x, y) {
        const padding = 10; // Größerer Click-Bereich für bessere Touch-Interaktion
        return x >= this.closeButtonX - padding &&
               x <= this.closeButtonX + this.closeButtonSize + padding &&
               y >= this.closeButtonY - padding &&
               y <= this.closeButtonY + this.closeButtonSize + padding;
    }

    update() {
        // Update layout on each frame to ensure correct positioning
        this.updateLayout();

        if (!this.isVisible) {
            this.currentY = Math.min(this.currentY + this.animationSpeed, -100);
            return;
        }

        // Animate sliding down
        if (this.currentY < this.targetY) {
            this.currentY = Math.min(this.currentY + this.animationSpeed, this.targetY);
        }

        // Update close button position
        this.closeButtonY = this.currentY + 15;
    }

    draw() {
        if (this.currentY <= -100) return;

        this.ctx.save();

        // Draw notification background - Angepasst an das Farbschema
        this.ctx.fillStyle = '#E0E0E0'; // Hellgrauer Hintergrund wie im Leaderboard
        this.ctx.strokeStyle = '#2c4245'; // Dunklere Umrandung wie im Leaderboard
        this.ctx.lineWidth = 1; // Dünnere Linie
        this.ctx.beginPath();
        this.ctx.roundRect(this.x, this.currentY, this.width, this.height, 10);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw title
        this.ctx.fillStyle = '#539ea9'; // Türkis wie die Überschriften
        this.ctx.font = '18px CustomFont'; // CustomFont wie im Rest des Spiels
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Update ' + this.updateVersion, this.x + this.padding, this.currentY + 30);

        // Draw update notes with wrapping
        this.ctx.fillStyle = '#2c4245'; // Dunkleres Grün für den Text
        this.ctx.font = '14px CustomFont';
        let currentY = this.currentY + this.titleHeight + this.padding;

        this.wrappedNotes.forEach(noteLines => {
            noteLines.forEach(line => {
                this.ctx.fillText(line, this.x + this.padding, currentY);
                currentY += this.lineHeight;
            });
        });

        // Draw close button - kleiner und dezenter
        this.ctx.strokeStyle = '#2c4245'; // Dunkleres Grün für das X
        this.ctx.lineWidth = 1.5; // Etwas dünner
        this.ctx.beginPath();
        this.ctx.moveTo(this.closeButtonX, this.closeButtonY);
        this.ctx.lineTo(this.closeButtonX + this.closeButtonSize, this.closeButtonY + this.closeButtonSize);
        this.ctx.moveTo(this.closeButtonX + this.closeButtonSize, this.closeButtonY);
        this.ctx.lineTo(this.closeButtonX, this.closeButtonY + this.closeButtonSize);
        this.ctx.stroke();

        this.ctx.restore();
    }
} 