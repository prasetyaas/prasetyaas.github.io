let currentUser = null;
let tasks = JSON.parse(localStorage.getItem('tf_tasks')) || [];

// Seed data
if (tasks.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
    tasks = [
        { id: Date.now() + 1, title: 'Desain landing page client', desc: 'Membuat wireframe dan mockup di Figma', priority: 'high', due: tomorrow.toISOString().split('T')[0], done: false },
        { id: Date.now() + 2, title: 'Integrasi payment gateway', desc: 'Midtrans / Xendit untuk toko online', priority: 'high', due: nextWeek.toISOString().split('T')[0], done: false },
        { id: Date.now() + 3, title: 'Testing fitur search produk', desc: 'Pastikan tidak ada bug di pencarian', priority: 'medium', due: '', done: false },
        { id: Date.now() + 4, title: 'Meeting dengan client', desc: 'Diskusi revisi landing page', priority: 'medium', due: tomorrow.toISOString().split('T')[0], done: true },
        { id: Date.now() + 5, title: 'Update dependencies project', desc: 'npm audit fix', priority: 'low', due: '', done: false }
    ];
    saveTasks();
}

function saveTasks() { localStorage.setItem('tf_tasks', JSON.stringify(tasks)); }

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user && pass) {
        currentUser = user;
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('navUser').textContent = '👤 ' + user;
        document.getElementById('welcomeName').textContent = user;
        updateDashboard();
        renderTasks();
        renderCalendar();
        document.getElementById('dashboardDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
});

function logout() {
    currentUser = null;
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + item.dataset.view).classList.add('active');
        if (item.dataset.view === 'dashboard') updateDashboard();
        if (item.dataset.view === 'tasks') renderTasks();
        if (item.dataset.view === 'calendar') renderCalendar();
        closeSidebar();
    });
});

// Sidebar mobile
document.getElementById('menuBtnMobile').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
});
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

// Dashboard
function updateDashboard() {
    document.getElementById('statTotal').textContent = tasks.length;
    document.getElementById('statDone').textContent = tasks.filter(t => t.done).length;
    document.getElementById('statPending').textContent = tasks.filter(t => !t.done).length;
    document.getElementById('statHigh').textContent = tasks.filter(t => t.priority === 'high' && !t.done).length;

    const urgent = tasks.filter(t => !t.done && t.priority === 'high').slice(0, 5);
    const container = document.getElementById('urgentTasks');
    if (urgent.length === 0) {
        container.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">Tidak ada tugas mendesak 🎉</div>';
    } else {
        container.innerHTML = urgent.map(t => `
            <div class="task-card priority-high" style="border-radius:0;border:none;border-bottom:1px solid var(--border)">
                <div class="task-info">
                    <h3 class="task-title">${t.title}</h3>
                    ${t.desc ? `<p>${t.desc}</p>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-done" onclick="toggleDone(${t.id})">✓ Selesai</button>
                </div>
            </div>
        `).join('');
    }
}

// Tasks
function renderTasks() {
    const search = document.getElementById('searchTask').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    let filtered = [...tasks];
    if (status !== 'all') filtered = filtered.filter(t => status === 'done' ? t.done : !t.done);
    if (priority !== 'all') filtered = filtered.filter(t => t.priority === priority);
    if (search) filtered = filtered.filter(t => t.title.toLowerCase().includes(search) || (t.desc && t.desc.toLowerCase().includes(search)));

    const list = document.getElementById('tasksList');
    const empty = document.getElementById('emptyState');
    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = filtered.map(t => `
            <div class="task-card priority-${t.priority} ${t.done ? 'done' : ''}">
                <div class="task-info">
                    <h3 class="task-title">${t.title}</h3>
                    ${t.desc ? `<p>${t.desc}</p>` : ''}
                    <div class="task-meta">
                        <span class="tag-${t.priority}">${t.priority === 'high' ? '🔴 Tinggi' : t.priority === 'medium' ? '🟡 Sedang' : '🟢 Rendah'}</span>
                        ${t.due ? `<span>📅 ${formatDate(t.due)}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    ${!t.done ? `<button class="btn-done" onclick="toggleDone(${t.id})">✓</button>` : ''}
                    <button class="btn-delete" onclick="deleteTask(${t.id})">✕</button>
                </div>
            </div>
        `).join('');
    }
    updateDashboard();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// Calendar
function renderCalendar() {
    const withDue = tasks.filter(t => t.due).sort((a, b) => new Date(a.due) - new Date(b.due));
    const container = document.getElementById('calendarList');
    if (withDue.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">Belum ada tugas dengan tenggat waktu</div>';
        return;
    }
    let html = '';
    let currentDate = '';
    withDue.forEach(t => {
        if (t.due !== currentDate) {
            currentDate = t.due;
            html += `<div class="calendar-date">${new Date(t.due + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>`;
        }
        html += `
            <div class="task-card priority-${t.priority} ${t.done ? 'done' : ''}" style="margin-bottom:4px">
                <div class="task-info">
                    <h3 class="task-title">${t.title}</h3>
                    <div class="task-meta">
                        <span class="tag-${t.priority}">${t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'} ${t.priority}</span>
                        ${t.done ? '<span>✅ Selesai</span>' : '<span>⏳ Pending</span>'}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Task CRUD
function openTaskModal(data = null) {
    document.getElementById('taskModal').classList.add('active');
    if (data) {
        document.getElementById('modalTitle').textContent = 'Edit Tugas';
        document.getElementById('editTaskId').value = data.id;
        document.getElementById('taskTitle').value = data.title;
        document.getElementById('taskDesc').value = data.desc || '';
        document.getElementById('taskPriority').value = data.priority;
        document.getElementById('taskDue').value = data.due || '';
    } else {
        document.getElementById('modalTitle').textContent = 'Tambah Tugas';
        document.getElementById('editTaskId').value = '';
        document.getElementById('taskForm').reset();
    }
}

function closeTaskModal() { document.getElementById('taskModal').classList.remove('active'); }

document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editTaskId').value;
    const data = {
        title: document.getElementById('taskTitle').value,
        desc: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        due: document.getElementById('taskDue').value
    };
    if (id) {
        const idx = tasks.findIndex(t => t.id === parseInt(id));
        if (idx !== -1) tasks[idx] = { ...tasks[idx], ...data };
    } else {
        tasks.push({ id: Date.now(), ...data, done: false });
    }
    saveTasks();
    renderTasks();
    renderCalendar();
    updateDashboard();
    closeTaskModal();
});

function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (task) { task.done = !task.done; saveTasks(); renderTasks(); renderCalendar(); updateDashboard(); }
}

function deleteTask(id) {
    if (confirm('Hapus tugas ini?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        renderCalendar();
        updateDashboard();
    }
}

// Init
document.getElementById('dashboardDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });