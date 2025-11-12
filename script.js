const els = {
    taskTitle: document.querySelector('#taskTitle'),
    cancelAdd: document.querySelector('#cancelAdd'),
    saveAdd: document.querySelector('#saveAdd'),
    cardToday: document.querySelector('#cardToday'),
    graphMount: document.querySelector('#graphMount'),
    cardPrev1: document.querySelector('#cardPrev1'),
    cardPrev2: document.querySelector('#cardPrev2'),
}
const addBtn = document.querySelector('header button');
const modal = document.getElementById('addTask');

addBtn.addEventListener('click', () => {
    modal.classList.add('open');
    els.taskTitle.value = '';
    els.taskTitle.focus();
});

document.querySelector('#addTask button:first-of-type')
    .addEventListener('click', () => {
        modal.classList.remove('open');
    });
//save event listener
els.saveAdd.addEventListener('click', () => {
    const title = els.taskTitle.value.trim();
    if(!title) return;
    getTodayTasks().push({id: crypto.randomUUID(), text: title, done: false});
    renderToday();
    saveState();
    els.taskTitle.value = '';
    modal.classList.remove('open');
});
// Data Definitions v

const todayKey = dateKeyFromOffset(0);

const state = { tasksByDate: {} }
renderPastCard(els.cardPrev1, -1);
renderPastCard(els.cardPrev2, -2);

// DOM References

//helper function
function getTodayTasks() {
    if (!state.tasksByDate[todayKey]) {
      state.tasksByDate[todayKey] = [];
    }
    return state.tasksByDate[todayKey];
  }
  // render function

function renderToday() {
    const todayTasks = getTodayTasks();
    const card = els.cardToday;
    card.innerHTML = '';
    const h2 = document.createElement('h2');
    h2.textContent = 'Today';
    card.appendChild(h2);
    // list wrapper
    const ul = document.createElement('ul');
    todayTasks.forEach(task => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.done;
    cb.id = 't-' + task.id;
    cb.dataset.id = task.id;
    const label = document.createElement('label')  
    label.textContent = task.text;
    label.setAttribute('for', cb.id);
    li.appendChild(label);
    li.appendChild(cb);
    ul.appendChild(li); 
    });
    card.appendChild(ul);
    updateGraph();
    renderPastCard(els.cardPrev1, -1);
    renderPastCard(els.cardPrev2, -2);

}

els.cardToday.addEventListener('change', (e) => {
    const el = e.target;
    if(el.type !== 'checkbox') return;
    const id = el.dataset.id;
    const task = getTodayTasks().find(t => t.id === id);
    task.done = el.checked;
    renderToday();
    saveState();
});

//calculate percentage
function updateGraph(){
    const tasks = getTodayTasks();
    let percent = 0;
    if (tasks.length > 0){
        const total = tasks.length;
        const doneCount = tasks.filter(t => t.done).length;
        percent = Math.round((doneCount / total) * 100);
    }
    els.graphMount.textContent = percent + "% done today";
}
function saveState() {
    localStorage.setItem('dailyDash', JSON.stringify({tasksByDate: state.tasksByDate }));
}
function loadState() {
    const raw = localStorage.getItem('dailyDash');
    if(!raw) return;
    const parsed = JSON.parse(raw);
    if(parsed.tasksByDate){
        state.tasksByDate = parsed.tasksByDate;
    }
    if(!state.tasksByDate[todayKey]){
        state.tasksByDate[todayKey] = [];
    }
}
// offset dates
function dateKeyFromOffset(offset) {
    const base = new Date();
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
}
function getTasksFor(dateKey) {
    if(!state.tasksByDate[dateKey]){
        state.tasksByDate[dateKey] = [];
    }
    return state.tasksByDate[dateKey];
}
function percentFrom(tasks) {
    let percent = 0;
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    if(total !== 0){
        percent = Math.round((done / total) * 100);
    }
    return {done, total, percent};
}
function renderPastCard(el, offset) {
    let title = '';
    const key = dateKeyFromOffset(offset);
    const tasks = getTasksFor(key);
    const stats = percentFrom(tasks);
    el.innerHTML = '';
    if(offset === -1){
        title = 'Yesterday';
    } else if(offset === -2){
        title = '2 days ago';
    } else {
        title = `${Math.abs(offset)} days ago`;
    }
    const h2 = document.createElement('h2');
    h2.textContent = title;
    el.appendChild(h2);
    const p = document.createElement('p');
    p.textContent = `${stats.done}/${stats.total} done (${stats.percent}%)`
    el.appendChild(p);
}