import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const sessions = new Map();

// Serve static frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/api/session', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { name, expiry: Date.now() + 31536000000 });
    res.cookie('sessionId', sessionId, { sameSite: 'none', secure: true, maxAge: 31536000000 });
    res.json({ success: true, name });
});

app.get('/api/session', async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) return res.json({ authenticated: false });
    const session = sessions.get(sessionId);
    if (session && session.expiry > Date.now()) {
        return res.json({ authenticated: true, name: session.name });
    }
    res.json({ authenticated: false });
});

app.post('/api/logout', async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) sessions.delete(sessionId);
    res.clearCookie('sessionId');
    res.json({ success: true });
});

app.post('/api/ask', async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });
    const session = sessions.get(sessionId);
    if (!session || session.expiry < Date.now()) {
        return res.status(401).json({ error: 'Session expired' });
    }
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided' });
    try {
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, name: session.name })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI server unavailable' });
    }
});

// Frontend fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log('NEBULA running on port ' + PORT);
});
