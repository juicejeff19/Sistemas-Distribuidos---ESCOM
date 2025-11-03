// gateway.js (API Gateway)
const express = require('express');
const axios = require('axios'); // Para reenviar peticiones

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware para JSON

// Ruta 1: Creación de URL -> Reenvía al servicio 3001
app.post('/api/shorten', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3001/api/v1/shorten', req.body);
        // Devolvemos la respuesta del servicio de Creación directamente al cliente
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error interno en el Gateway' });
    }
});

// Ruta 2: Acceso a URL corta -> Reenvía al servicio 3002 (Redirección)
// NOTE: El gateway NO debe manejar la redirección; solo enruta al servicio que lo hace
app.get('/:shortCode', (req, res) => {
    // Redirige al cliente al puerto del Microservicio de Redirección (3002)
    // El Microservicio 3002 se encarga de la lógica de DB y tracking
    res.redirect(307, `http://localhost:3002/${req.params.shortCode}`);
});

// Ruta 3: Obtener Métricas -> Reenvía al servicio 3003
app.get('/api/stats/:shortCode', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:3003/api/v1/stats/${req.params.shortCode}`);
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al obtener métricas' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ [4. API Gateway] Punto de entrada en ${PORT}`);
});