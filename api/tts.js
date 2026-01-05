import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        const audioArrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(audioBuffer);
    } catch (error) {
        console.error('Vercel TTS Error:', error);
        res.status(500).json({ error: 'Failed to process TTS' });
    }
}
