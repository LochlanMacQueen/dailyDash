const addBtn = document.querySelector('header button');
const modal = document.getElementById('addTask');

addBtn.addEventListener('click', () => {
    modal.classList.add('open');
});

document.querySelector('#addTask button:first-of-type')
    .addEventListener('click', () => {
        modal.classList.remove('open');
    });

// Data Definitions v

const todayKey = new Date().toISOString().slice(0, 10);

const state = { tasksByDate: {} }
state.tasksByDate[todayKey] = []

const seed = getTodayTasks();
seed.push(
    {id: crypto.randomUUID(), text: "Make Breakfast", done: true},
    {id: crypto.randomUUID(), text: "Dont Poop", done: false},
    {id: crypto.randomUUID(), text: "Go To Bed at 8pm", done: false}
)

// DOM References

const els = {
    taskTitle: document.querySelector('#taskTitle'),
    cancelAdd: document.querySelector('#cancelAdd'),
    saveAdd: document.querySelector('#saveAdd'),
    cardToday: document.querySelector('#cardToday'),
    graphMount: document.querySelector('#graphMount'),
}
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
}

els.cardToday.addEventListener('change', (e) => {
    const el = e.target;
    if(el.type !== 'checkbox') return;
    const id = el.dataset.id;
    const task = getTodayTasks().find(t => t.id === id);
    task.done = el.checked;
    renderToday();
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
renderToday();
