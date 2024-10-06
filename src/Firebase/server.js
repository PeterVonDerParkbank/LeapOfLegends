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

// Definieren der getHighScore-Funktion
async function getHighScore() {
  const highScoreDoc = await db.collection('scores').doc('highScore').get();
  if (highScoreDoc.exists) {
    return highScoreDoc.data().score;

  } else {
    return 0;
  }
}

// Definieren der saveHighScore-Funktion
async function saveHighScore(score, userId) {
    const currentHighScore = await getHighScore();
    const highScore = Math.max(score, currentHighScore);
    await db.collection('scores').doc('highScore').set({ score: highScore, creatorId: userId });
  }

// API-Endpunkt für getHighScore
app.get('/api/highscore', async (req, res) => {
  try {
    const highScore = await getHighScore();
    res.json({ "highScore": highScore });
  } catch (error) {
    res.status(500).send('Error fetching high score: ' + error.message);
  }
});

// API-Endpunkt für saveHighScore
app.post('/api/highscore', async (req, res) => {
    const { score, userId } = req.body;
    try {
      await saveHighScore(score, userId);
      res.status(200).send('High score saved successfully');
    } catch (error) {
      res.status(500).send('Error saving high score: ' + error.message);
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});