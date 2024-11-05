import BackButton from '../Buttons/backButton.js';

export default class Leaderboard {
    constructor() {
        this.scores = [];
        this.backButton = new BackButton(10, 10, 100, 50, 'Zurück');
    }

    async fetchScores() {

        const response = await fetch('https://marsloeller.com/api/top10');
        const data = await response.json();
        this.scores = data.top10;
    }

    async draw(ctx, canvas_width, canvas_height) {
        await this.fetchScores();
        ctx.clearRect(0, 0, canvas_width, canvas_height);
        ctx.fillStyle = 'black';
        ctx.font = '20px CustomFont';
        ctx.fillText('Leaderboard', canvas_width / 2 - 50, 50);

        this.scores.forEach((score, index) => {
            ctx.fillText(`${index + 1}. ${score.playerName} - ${score.score}`, canvas_width / 2 - 50, 100 + index * 30);
        });

        this.backButton.draw(ctx);
    }
}