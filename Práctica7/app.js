// Registro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

const lista = document.getElementById('lista');
const texto = document.getElementById('texto');
const boton = document.getElementById('guardar');

async function cargarNotas() {
    const res = await fetch('/api/notas');
    const datos = await res.json();
    lista.innerHTML = '';
    datos.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n.texto;
        lista.appendChild(li);
    });
}

boton.addEventListener('click', async () => {
    const nuevaNota = { texto: texto.value };
    await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaNota)
    });
    texto.value = '';
    cargarNotas();
});

cargarNotas();
