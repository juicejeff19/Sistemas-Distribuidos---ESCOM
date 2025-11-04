const express = require('express');
const axios = require('axios');
const app = express();
const PUERTO = 3000;

app.get('/profile/:ip', async (req, res) => {
    const { ip } = req.params;

    try {
        // 1. Llamar al servicio de Geolocalización (en el puerto 3001)
        const geoResponse = await axios.get(`http://localhost:3001/locate/${ip}`);
        const { city, country, lat, lon } = geoResponse.data;

        // 2. Con los datos de geo, llamar al servicio de Clima (en el puerto 3002)
        const weatherResponse = await axios.get(`http://localhost:3002/weather?lat=${lat}&lon=${lon}`);
        const { temperature_celsius, windspeed_kmh } = weatherResponse.data;

        // 3. Combinar las respuestas y enviar el perfil al cliente
        res.json({
            profile_for_ip: ip,
            location: {
                city,
                country
            },
            weather: {
                temperature: `${temperature_celsius}°C`,
                windspeed: `${windspeed_kmh} km/h`
            }
        });

    } catch (error) {
        // Manejo de errores (si alguno de los microservicios falla)
        console.error(error.message);
        res.status(500).json({ error: 'Error al orquestar los servicios' });
    }
});

app.listen(PUERTO, () => {
    console.log(`🚀 Servicio Gateway corriendo en http://localhost:${PUERTO}`);
    console.log(`Prueba con: http://localhost:3000/profile/8.8.8.8`);
});