// redirector.js (Microservicio de Redirección)
const express = require('express');
const axios = require('axios'); // Para hacer peticiones HTTP a otros microservicios

const app = express();
const PORT = 3002;
// La BD global.urlDatabase es compartida (simulando una BD compartida para el ejemplo)

// La ruta pública de acceso (ej: http://localhost:3002/abcde)
app.get('/:shortCode', async (req, res) => {
    const shortCode = req.params.shortCode;
    const data = global.urlDatabase[shortCode]; // Leer de la "DB"

    if (data) {
        // Llama al Microservicio de Métricas (punto 3) de forma asíncrona
        try {
            // Utilizamos una llamada HTTP para simular la comunicación entre microservicios
            await axios.post('http://localhost:3003/api/v1/track', { shortCode });
        } catch (error) {
            console.error(`[Redirección] Error al contactar el servicio de Métricas: ${error.message}`);
        }

        // Redirección al usuario
        return res.redirect(302, data.longUrl);
    } else {
        return res.status(404).json({ error: 'URL corta no encontrada' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ [2. Redirección] Microservicio en ${PORT}`);
});