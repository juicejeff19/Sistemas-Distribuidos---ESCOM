const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Crear carpeta public y HTML si no existen
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
const htmlPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(htmlPath)) fs.writeFileSync(htmlPath, getFrontendHTML());

app.use(express.static(publicDir));

const SIMPLE_API_KEY = 'secret123';
let books = [
    { id: 1, title: 'El código limpio', author: 'R. Martin', year: 2008 },
    { id: 2, title: 'Eloquent JavaScript', author: 'M. Haverbeke', year: 2018 },
    { id: 3, title: 'You Don\'t Know JS', author: 'K. Simpson', year: 2015 }
];
let nextId = 4;

function requireApiKey(req, res, next) {
    const key = req.header('x-api-key');
    if (key !== SIMPLE_API_KEY) return res.status(401).json({ error: 'API key inválida' });
    next();
}

function paginateAndFilter(items, { page = 1, limit = 5, search = '' }) {
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));
    search = search.toLowerCase();
    const filtered = items.filter(
        b => b.title.toLowerCase().includes(search) ||
            b.author.toLowerCase().includes(search) ||
            String(b.year).includes(search)
    );
    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);
    return { page, limit, total, pages, data };
}

// Rutas API
app.get('/api/books', (req, res) => {
    const { page, limit, search } = req.query;
    res.json(paginateAndFilter(books, { page, limit, search }));
});

app.get('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const found = books.find(b => b.id === id);
    if (!found) return res.status(404).json({ error: 'No encontrado' });
    res.json(found);
});

app.post('/api/books', requireApiKey, (req, res) => {
    const { title, author, year } = req.body;
    if (!title) return res.status(400).json({ error: 'Título requerido' });
    const book = { id: nextId++, title, author, year };
    books.push(book);
    res.status(201).json(book);
});

app.put('/api/books/:id', requireApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const found = books.find(b => b.id === id);
    if (!found) return res.status(404).json({ error: 'No encontrado' });
    Object.assign(found, req.body);
    res.json(found);
});

app.delete('/api/books/:id', requireApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
    const removed = books.splice(idx, 1);
    res.json(removed[0]);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', hora: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

// HTML incrustado
function getFrontendHTML() {
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Práctica Servicios Web</title>
  <style>
    body { font-family: Arial; max-width:800px; margin:20px auto; }
    input,button,select { padding:6px; margin:4px; }
    .card { border:1px solid #ccc; padding:10px; border-radius:8px; margin:10px 0; }
  </style>
</head>
<body>
<h1>Servicios Web con JavaScript</h1>

<section class="card">
  <h3>Buscar libros</h3>
  <input id="search" placeholder="Buscar">
  <button id="btnSearch">Buscar</button>
  <label>Límite:</label>
  <select id="limit"><option>3</option><option selected>5</option><option>10</option></select>
</section>

<section class="card">
  <h3>Agregar libro</h3>
  <input id="title" placeholder="Título">
  <input id="author" placeholder="Autor">
  <input id="year" placeholder="Año">
  <input id="apiKey" placeholder="API Key" value="secret123">
  <button id="btnAdd">Agregar</button>
</section>

<section class="card">
  <h3>Resultados</h3>
  <div id="list"></div>
  <div id="pager"></div>
</section>

<script>
const API = '/api/books';
let state = { page: 1, limit: 5, search: '' };

async function apiFetch(path, opts={}) {
  const headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  const key = document.getElementById('apiKey').value.trim();
  if (key) headers['x-api-key'] = key;
  const res = await fetch(API + path, { ...opts, headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function load() {
  const q = \`?page=\${state.page}&limit=\${state.limit}&search=\${state.search}\`;
  const data = await apiFetch(q);
  renderList(data);
}

function renderList({data, page, pages, total}) {
  const list = document.getElementById('list');
  list.innerHTML = data.map(b => \`<div><b>\${b.title}</b> — \${b.author} (\${b.year})
    <button onclick=\"view(\${b.id})\">Ver</button>
    <button onclick=\"edit(\${b.id})\">Editar</button>
    <button onclick=\"del(\${b.id})\">Borrar</button></div>\`).join('');
  document.getElementById('pager').innerHTML =
    \`Página \${page} de \${pages} — Total: \${total}\`;
}

async function add() {
  const title=document.getElementById('title').value.trim();
  if(!title)return alert('Título obligatorio');
  await apiFetch('',{
    method:'POST',
    body:JSON.stringify({
      title,
      author:document.getElementById('author').value,
      year:+document.getElementById('year').value||null
    })
  });
  load();
}

async function view(id){
  const b=await apiFetch('/'+id);
  alert(JSON.stringify(b,null,2));
}

async function edit(id){
  const title=prompt('Nuevo título:');
  await apiFetch('/'+id,{method:'PUT',body:JSON.stringify({title})});
  load();
}

async function del(id){
  if(!confirm('¿Borrar?'))return;
  await apiFetch('/'+id,{method:'DELETE'});
  load();
}

document.getElementById('btnSearch').onclick=()=>{
  state.search=document.getElementById('search').value;
  state.limit=document.getElementById('limit').value;
  load();
};
document.getElementById('btnAdd').onclick=add;

load();
</script>
</body>
</html>`;
}
