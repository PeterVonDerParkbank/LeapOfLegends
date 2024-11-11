import BackButton from '../Buttons/backButton.js';

export default class Leaderboard {
    constructor(canvas_width, canvas_height,scaleX,scaleY, backButtonWidth, backButtonHeight) {
        this.scores = [];
        const backButtonY = canvas_height - 120;
        this.backButton = new BackButton(canvas_width / 2 - scaleX*backButtonWidth / 2, backButtonY, scaleX*backButtonWidth, scaleY*backButtonHeight, 'Back');
        console.log(this.backButton);
    }

    async fetchScores() {

        const response = await fetch('https://marsloeller.com/api/top10');
        const data = await response.json();
        this.scores = data.top10;
    }

    async draw(ctx, canvas_width, canvas_height) {
        await this.fetchScores();
        ctx.clearRect(0, 0, canvas_width, canvas_height);
        
        //load background image for leaderboard
        const backgroundImage = new Image();
        backgroundImage.src = 'src/assets/images/leaderBoardScreen/leaderBoardBackground_short.png';

        backgroundImage.onload = () => {

            ctx.drawImage(backgroundImage, 0, 0, canvas_width, canvas_height);
            // 1. Draw the title
            ctx.fillStyle = '#539ea9'; // Match the blue-green color from the design
            ctx.font = '40px CustomFont';
            ctx.textAlign = 'center';
            ctx.fontWeight = 'bold';
            ctx.fillText('LEADER BOARD', canvas_width / 2, 70);
        
            // 2. Define styling for leaderboard entries
            const entryHeight = 32; // Height of each leaderboard entry
            const entryStartY = 0.148*canvas_height; // Y position to start the first entry
            const entryPadding = 12; // Padding between entries
            const rankBoxWidth = 40; // Width of the rank number box
            const grayBackgroundColor = '#E0E0E0'; // Gray background for each entry
            const borderColor = '#2c4245';
        
            this.scores.slice(0, 10).forEach((score, index) => {
                const entryY = entryStartY + index * (entryHeight + entryPadding);
                const entryX = canvas_width / 2 - 150;
                
                // Draw border around each entry
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1; // Thin border
                ctx.strokeRect(entryX, entryY, rankBoxWidth + 250, entryHeight); // Border around both boxes

                // Draw gray background for name and score box
                ctx.fillStyle = grayBackgroundColor;
                ctx.fillRect(entryX + rankBoxWidth, entryY, 250, entryHeight);
        
                // Draw rank box on the left
                if (index === 0) {
                    ctx.fillStyle = '#D9534F'; // Red color for the first rank
                } else {
                    ctx.fillStyle = '#2c4245'; // Dark green color for other ranks
                }
                ctx.fillRect(entryX, entryY, rankBoxWidth, entryHeight);
        
                // Draw rank number
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '20px CustomFont';
                ctx.textAlign = 'center';
                ctx.fillText(index + 1, entryX + rankBoxWidth / 2, entryY + entryHeight / 2 + 7);
        
                // Draw player name and score
                ctx.fillStyle = '#000000'; // Text color for player info
                ctx.textAlign = 'left';
                ctx.fillText(`${score.playerName} - ${score.score}`, entryX + rankBoxWidth + 10, entryY + entryHeight / 2 + 7);
            });
            //Ensure the back button is drawn on top of the background
            this.backButton.draw(ctx);
        };
    }
}