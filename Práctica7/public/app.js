const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registrado'));
}

// Obtener tareas del servidor
async function fetchTasks() {
    const res = await fetch('/tasks');
    const tasks = await res.json();
    renderTasks(tasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.name;
        const btn = document.createElement('button');
        btn.textContent = 'Eliminar';
        btn.onclick = () => deleteTask(task.id);
        li.appendChild(btn);
        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    await fetch(`/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
}

taskForm.addEventListener('submit', async e => {
    e.preventDefault();
    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: taskInput.value })
    });
    taskInput.value = '';
    fetchTasks();
});

fetchTasks();
