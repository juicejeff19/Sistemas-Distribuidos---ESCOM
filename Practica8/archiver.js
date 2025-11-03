// archiver.js (Microservicio de Creación/Almacenamiento)
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;
// BD global simulada que es compartida con el servicio de Redirección (punto 2)
global.urlDatabase = {};
let shortCodeCounter = 1000;

app.use(bodyParser.json());

function generateShortCode() {
    const code = shortCodeCounter.toString(36);
    shortCodeCounter++;
    return code;
}

app.post('/api/v1/shorten', (req, res) => {
    const longUrl = req.body.longUrl;
    if (!longUrl) {
        return res.status(400).json({ error: 'Falta longUrl' });
    }

    const shortCode = generateShortCode();
    // Escribir en la "DB"
    global.urlDatabase[shortCode] = { longUrl, clicks: 0 };

    console.log(`[Creación] URL almacenada: ${shortCode}`);
    res.status(201).json({
        short_code: shortCode,
        short_url: `http://localhost:3002/${shortCode}`
    });
});

app.listen(PORT, () => {
    console.log(`✅ [1. Creación] Microservicio en ${PORT}`);
});