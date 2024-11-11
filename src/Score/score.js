export default class Score {
    constructor() {
        this.score = 0;
    }
    increment() {
        this.score += 10;
    }
    
    reset() {
        this.score = 0;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#f04f52';
        ctx.font = '20px CustomFont';
        ctx.fillText(`${this.score}`, 20, 20);
    }
}