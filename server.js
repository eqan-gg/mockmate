import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.post('/api/tts', async (req, res) => {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured on the server' });
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
                'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            return res.status(response.status).json(errorData);
        }

        // Proxy the audio stream directly to the client
        const audioArrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (error) {
        console.error('Server TTS Error:', error);
        res.status(500).json({ error: 'Failed to process TTS' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
