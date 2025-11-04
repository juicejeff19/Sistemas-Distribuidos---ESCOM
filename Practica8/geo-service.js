const express = require('express');
const axios = require('axios');
const app = express();
const PUERTO = 3001;

app.get('/locate/:ip', async (req, res) => {
    const { ip } = req.params;

    try {
        // Llamada a la API externa
        const response = await axios.get(`http://ip-api.com/json/${ip}`);

        const { city, country, lat, lon } = response.data;

        // Devuelve solo los datos que nos interesan
        res.json({ city, country, lat, lon });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la geolocalización' });
    }
});

app.listen(PUERTO, () => {
    console.log(`🌎 Servicio de Geolocalización corriendo en http://localhost:${PUERTO}`);
});