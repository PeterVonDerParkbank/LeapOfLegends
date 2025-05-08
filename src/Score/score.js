export default class Score {
    constructor() {
        this.score = 0;
    }
    increment(platform) {
        //implement different scores for different platforms
        //
        if (platform.type === 'moving') {
            this.score += 7;
        } else if (platform.type === 'breaking') {
            this.score += 11;
        } else if (platform.type === 'jumppad') {
            this.score += 3;
        } else {
            this.score += 8;
        }
    }
    
    reset() {
        this.score = 0;
    }
    
    draw(ctx,canvas,player) {
        ctx.save();
        ctx.fillStyle = '#f04f52';
        ctx.font = '20px CustomFont';
        ctx.textAlign = 'left';    
        ctx.textBaseline = 'top';
        ctx.fillText(`${this.score}`, 30, 5);
        
        ctx.restore();
        // Draw coin counter
        //ctx.textAlign = 'right';
        //ctx.fillText(`${player.coins}`, canvas.width - 30, 5);
        //ctx.restore();
    }
}