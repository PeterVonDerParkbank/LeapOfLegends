import express from 'express';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Laden der Service Account Credentials
// Server secrets must not use Vite's client-visible VITE_ prefix.
// Keep the old variable working while existing deployments migrate.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountPath) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT to the service account JSON path.');
}
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialisieren der Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.disable('x-powered-by');

// Update CORS configuration
app.use(cors({
    origin: ['https://marsloeller.com','https://www.marsloeller.com'], // Allow requests from Vite server
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '8kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function saveScoreInLeaderboard(score, userId, userName) {
    const leaderboardRef = db.collection('leaderboard').doc('top100');
    const leaderboardDoc = await leaderboardRef.get();
    if (leaderboardDoc.exists) {
        const leaderboardData = leaderboardDoc.data();
        const scores = leaderboardData.scores || [];
        scores.push({ score, playerId: userId, playerName: userName, timestamp: admin.firestore.Timestamp.now() });
        scores.sort((a, b) => b.score - a.score);
        if (scores.length > 100) {
            scores.pop();
        }
        await leaderboardRef.update({ scores });
    } else {
        await leaderboardRef.set({ scores: [{ score, playerId: userId, playerName: userName, timestamp: admin.firestore.Timestamp.now() }] });
    }
}

async function getPersonalBest(userName) {
    const playerRef = db.collection('players').doc(userName);
    const playerDoc = await playerRef.get();
    if (playerDoc.exists) {
        const playerData = playerDoc.data();
        const scores = playerData.scores || [];
        return scores.reduce((best, current) => Math.max(best, current.score), 0);
    } else {
        return 0;
    }
}

// Define saveScore function
async function saveScore(score, userId, userName) {
    const playerRef = db.collection('players').doc(userName);
    const playerDoc = await playerRef.get();
    if (playerDoc.exists) {
        const playerData = playerDoc.data();
        const scores = playerData.scores || [];
        scores.push({ score, timestamp: admin.firestore.Timestamp.now() });
        await playerRef.update({ scores });
    } else {
        await playerRef.set({ playerId: userId, playerName: userName, scores: [{ score, timestamp: admin.firestore.Timestamp.now() }] });
    }
}

// Define getTop100 function
async function getTop100() {
    const leaderboardRef = db.collection('leaderboard').doc('top100');
    const leaderboardDoc = await leaderboardRef.get();
    if (leaderboardDoc.exists) {
        const leaderboardData = leaderboardDoc.data();
        return leaderboardData.scores || [];
    } else {
        return [];
    }
}

// Define getTop10 function
async function getTop10() {
    const leaderboardRef = db.collection('leaderboard').doc('top100');
    const leaderboardDoc = await leaderboardRef.get();
    if (leaderboardDoc.exists) {
        const leaderboardData = leaderboardDoc.data();
        const allScores = leaderboardData.scores || [];
        
        // Create a map to track the number of scores per player
        const playerScoreCount = new Map();
        const result = [];
        let currentIndex = 0;

        // Keep processing scores until we have 10 scores or run out of scores
        while (result.length < 10 && currentIndex < allScores.length) {
            const score = allScores[currentIndex];
            const playerCount = playerScoreCount.get(score.playerName) || 0;

            // Only include the score if the player hasn't reached their limit of 3
            if (playerCount < 1) {
                result.push(score);
                playerScoreCount.set(score.playerName, playerCount + 1);
            }

            currentIndex++;
        }

        return result;
    } else {
        return [];
    }
}

// Define API endpoints
app.get('/api/top10', async (req, res) => {
    try {
        const top10 = await getTop10();
        res.json({ "top10": top10 });
    } catch (error) {
        res.status(500).send('Error fetching top 10: ' + error.message);
    }
});

app.get('/api/top100', async (req, res) => {
    try {
        const top100 = await getTop100();
        res.json({ "top100": top100 });
    } catch (error) {
        res.status(500).send('Error fetching top 100: ' + error.message);
    }
});

app.get('/api/personalbest', async (req, res) => {
    const { userName } = req.query;
    try {
        const personalBest = await getPersonalBest(userName);
        res.json({ "personalBest": personalBest });
    } catch (error) {
        res.status(500).send('Error fetching personal best: ' + error.message);
    }
});

app.post('/api/score', async (req, res) => {
    const { score, userId, userName } = req.body;
    try {
        await saveScore(score, userId, userName);
        await saveScoreInLeaderboard(score, userId, userName);
        res.status(200).send('Score saved successfully');
    } catch (error) {
        res.status(500).send('Error saving score: ' + error.message);
    }
});


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`API is running on http://127.0.0.1:${server.address().port}`);
});
