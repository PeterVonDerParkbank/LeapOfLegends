// server.js
import express from 'express';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


// Laden der Service Account Credentials
const serviceAccount = JSON.parse(readFileSync(process.env.VITE_FIREBASE_SERVICE_ACCOUNT, 'utf8'));

// Initialisieren der Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

//Definieren einer safe-Score-Funktion
// Score soll in Collection "Players" gespeichert werden
// Pro User soll ein Dokument erstellt werden
//Dokument hat folgende Felder: playerId: string, playerName: string, scores: Array; Items in array: score: number, timestamp: Timestamp 
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

//Definieren einer safe-Score-in-leaderboard-Funktion
// Score soll im Leader Board gespeichert werden
// Leaderboard soll anschließend sortiert werden, nach den TopScores
// Wenn Score schlechter als Top100 ist, soll er nicht gespeichert werden
// Struktur von Leaderboard: Document mit ID "top100", Felder: scores: Array; Items in Array: score: number, playerName: string, playerId: string, timestamp: Timestamp
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

//  Definieren einer getPersonalBest-Function
//  Die Funktion soll den besten Score eines Users zurückgeben
//  Wenn der User nicht existiert, soll 0 zurückgegeben werden
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

//Definieren einer getTop100-Function
//Die Funktion soll die Top 100 Scores aus dem Leaderboard zurückgeben
//Wenn weniger als 100 Scores vorhanden sind, sollen alle Scores zurückgegeben werden
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

//Definieren einer getTop10 Function aus der Top 100
//Die Funktion soll die Top 10 Scores aus dem Leaderboard zurückgeben
//Wenn weniger als 10 Scores vorhanden sind, sollen alle Scores zurückgegeben werden
async function getTop10() {
    const leaderboardRef = db.collection('leaderboard').doc('top100');
    const leaderboardDoc = await leaderboardRef.get();
    if (leaderboardDoc.exists) {
        const leaderboardData = leaderboardDoc.data();
        return leaderboardData.scores.slice(0, 10) || [];
    } else {
        return [];
    }
}

//API-Endpunkt für getTop10
app.get('/api/top10', async (req, res) => {
    try {
        const top10 = await getTop10();
        res.json({ "top10": top10 });
    } catch (error) {
        res.status(500).send('Error fetching top 10: ' + error.message);
    }
});

//API-Endpunkt für getTop100
app.get('/api/top100', async (req, res) => {
    try {
        const top100 = await getTop100();
        res.json({ "top100": top100 });
    } catch (error) {
        res.status(500).send('Error fetching top 100: ' + error.message);
    }
});

//API-Endpunkt für getPersonalBest
app.get('/api/personalbest', async (req, res) => {
    const { userName } = req.query;
    console.log(userName);
    try {
        const personalBest = await getPersonalBest(userName);
        res.json({ "personalBest": personalBest });
    } catch (error) {
        res.status(500).send('Error fetching personal best: ' + error.message);
    }
});

// API-ENDPUNKT FÜR SAVE SCORE AND SAVE SCORE IN LEADERBOARD IF TOP 100
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});