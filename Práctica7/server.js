const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let notas = [];

app.get('/api/notas', (req, res) => res.json(notas));

app.post('/api/notas', (req, res) => {
    const nota = { id: Date.now(), texto: req.body.texto };
    notas.push(nota);
    res.json(nota);
});

app.listen(PORT, () => console.log(`Servidor divino en http://localhost:${PORT}`));
