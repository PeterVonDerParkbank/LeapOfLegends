export default class Score {
    constructor() {
        this.score = 0;
    }
    increment(points) {
        this.score += points;
    }
    
    reset() {
        this.score = 0;
    }
    
    draw(ctx) {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
}