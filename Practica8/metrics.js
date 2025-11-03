// metrics.js (Microservicio de Métricas)
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3003;
// La BD global.urlDatabase es compartida (simulando acceso a la misma BD)

app.use(bodyParser.json());

// API interna llamada por el servicio de Redirección (simulando una cola de mensajes)
app.post('/api/v1/track', (req, res) => {
    const shortCode = req.body.shortCode;

    if (global.urlDatabase[shortCode]) {
        // Actualizar el contador en la "DB"
        global.urlDatabase[shortCode].clicks++;
        console.log(`[Métricas] Clic registrado para ${shortCode}. Total: ${global.urlDatabase[shortCode].clicks}`);
        return res.status(200).send('Tracked');
    }
    return res.status(404).send('Code not found');
});

// API pública para obtener estadísticas
app.get('/api/v1/stats/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const data = global.urlDatabase[shortCode];

    if (data) {
        return res.status(200).json({
            short_code: shortCode,
            clicks: data.clicks,
            original_url: data.longUrl
        });
    }
    return res.status(404).json({ error: 'Estadísticas no encontradas' });
});

app.listen(PORT, () => {
    console.log(`✅ [3. Métricas] Microservicio en ${PORT}`);
});