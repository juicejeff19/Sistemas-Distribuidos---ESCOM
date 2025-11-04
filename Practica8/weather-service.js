const express = require('express');
const axios = require('axios');
const app = express();
const PUERTO = 3002;

// Recibimos latitud y longitud como query params (ej: /weather?lat=19.43&lon=-99.13)
app.get('/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Faltan latitud o longitud' });
    }

    try {
        // Llamada a la API externa
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await axios.get(url);

        const { temperature, windspeed } = response.data.current_weather;

        // Devuelve solo los datos que nos interesan
        res.json({ temperature_celsius: temperature, windspeed_kmh: windspeed });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el clima' });
    }
});

app.listen(PUERTO, () => {
    console.log(`☀️ Servicio de Clima corriendo en http://localhost:${PUERTO}`);
});