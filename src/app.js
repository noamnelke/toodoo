// HTML structure
const appContainer = document.getElementById('app');

// Data structure to store routines and tasks
let routines = JSON.parse(localStorage.getItem('routines')) || [];

// Global state to manage edit mode
let isEditMode = false;

// Global state to manage the currently displayed routine index
let currentRoutineIndex = null;

// Function to save routines to localStorage
function saveRoutines() {
  localStorage.setItem('routines', JSON.stringify(routines));
}

// Function to create a card element
function createCard(textContent, clickHandler, ...classNames) {
  const card = document.createElement('div');
  card.classList.add(...classNames);
  card.textContent = textContent;
  card.addEventListener('click', clickHandler);
  return card;
}

// Function to create a link element
function createLink(textContent, clickHandler) {
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = textContent;
  link.addEventListener('click', clickHandler);
  return link;
}

// Function to create the main screen listing all routines
function renderMainScreen() {
  currentRoutineIndex = null;
  appContainer.innerHTML = '';

  // Show header
  document.getElementById('header').style.display = 'flex';

  // Create a card for each routine
  routines.forEach((routine, index) => {
    const routineCard = createCard(routine.name, () => renderRoutineScreen(index), 'routine-card');
    appContainer.appendChild(routineCard);
  });

  // Create 'New Routine' card
  const newRoutineCard = createCard('New Routine', createNewRoutine, 'routine-card', 'new-routine-card');
  appContainer.appendChild(newRoutineCard);

  // Attach import/export handlers to the menu items
  document.getElementById('import-link').addEventListener('click', handleImport);
  document.getElementById('export-link').addEventListener('click', handleExport);
}

// Function to render a specific routine screen
function renderRoutineScreen(routineIndex) {
  currentRoutineIndex = routineIndex;
  const routine = routines[routineIndex];
  appContainer.innerHTML = '';

  // Hide header
  document.getElementById('header').style.display = 'none';

  const header = document.createElement('h1');
  header.contentEditable = true;
  header.textContent = routine.name;
  header.addEventListener('input', () => {
    routines[routineIndex].name = header.textContent;
    saveRoutines();
  });
  appContainer.appendChild(header);

  // Create a button to go back to the main screen or delete the routine
  const actionButton = document.createElement('button');
  actionButton.classList.add('icon-button', 'left');
  const actionIcon = document.createElement('i');
  actionIcon.classList.add('material-icons');
  actionIcon.textContent = isEditMode ? 'delete' : 'chevron_left';
  actionIcon.style.color = isEditMode ? 'red' : '#333'; // Dark gray
  actionButton.appendChild(actionIcon);
  if (isEditMode) {
    actionButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this routine?')) {
        routines.splice(routineIndex, 1);
        saveRoutines();
        isEditMode = false;
        renderMainScreen();
      }
    });
  } else {
    actionButton.addEventListener('click', renderMainScreen);
  }
  appContainer.appendChild(actionButton);

  // Create an Edit button to toggle edit mode
  const editButton = document.createElement('button');
  editButton.classList.add('icon-button', 'right');
  const editIcon = document.createElement('i');
  editIcon.classList.add('material-icons');
  editIcon.textContent = isEditMode ? 'check' : 'edit';
  editIcon.style.color = isEditMode ? 'green' : '#333'; // Dark gray
  editButton.appendChild(editIcon);
  editButton.addEventListener('click', () => {
    isEditMode = !isEditMode;
    renderRoutineScreen(routineIndex);
  });
  appContainer.appendChild(editButton);

  // Add progress bar container
  const progressBarContainer = document.createElement('div');
  progressBarContainer.classList.add('progress-bar-container');
  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar');
  progressBar.id = 'progress-bar';
  progressBarContainer.appendChild(progressBar);
  appContainer.appendChild(progressBarContainer);

  updateProgressBar();

  // Render each task in the routine
  routine.tasks.forEach((task, taskIndex) => {
    const taskCardContainer = document.createElement('div');
    taskCardContainer.classList.add('task-card-container');
    taskCardContainer.draggable = isEditMode;
    taskCardContainer.addEventListener('dragstart', handleDragStart);
    taskCardContainer.addEventListener('drop', (e) => e.preventDefault());
    taskCardContainer.addEventListener('dragover', handleDragOver);
    taskCardContainer.addEventListener('dragend', handleDragEnd);

    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.dataset.taskIndex = taskIndex;
    taskCard.innerHTML = task.name.replace(/(\p{Extended_Pictographic}(\u200D\p{Extended_Pictographic})*(\uFE0E|\uFE0F)?)/gu, '<span class="emoji">$1</span>');
    taskCard.setAttribute('data-placeholder', isEditMode ? 'Type task name...' : 'Unnamed task');
    if (task.completed) taskCard.classList.add('completed');
    if (isEditMode) {
      taskCard.contentEditable = true;
      taskCard.addEventListener('input', () => {
        routines[routineIndex].tasks[taskIndex].name = taskCard.textContent;
        saveRoutines();
      });
      taskCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          routines[routineIndex].tasks[taskIndex].name = taskCard.textContent;
          saveRoutines();
          routines[routineIndex].tasks.push({ name: '', completed: false });
          saveRoutines();
          renderRoutineScreen(routineIndex);
          // Focus on the new task card
          const taskCards = appContainer.querySelectorAll('.task-card');
          taskCards[taskCards.length - 2].focus();
        }
      });
    } else {
      taskCard.addEventListener('click', (e) => toggleTaskCompletion(e.currentTarget));
    }
    taskCardContainer.appendChild(taskCard);

    if (isEditMode) {
      // Add delete icon in edit mode
      const deleteIcon = document.createElement('span');
      deleteIcon.classList.add('delete-icon');
      deleteIcon.textContent = '✖';
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        routines[routineIndex].tasks.splice(taskIndex, 1);
        saveRoutines();
        renderRoutineScreen(routineIndex);
      });
      taskCardContainer.appendChild(deleteIcon);
    }

    appContainer.appendChild(taskCardContainer);
  });

  if (isEditMode) {
    // Add New Task card
    const newTaskCardContainer = document.createElement('div');
    newTaskCardContainer.classList.add('task-card-container');

    const newTaskCard = createCard('New Task', () => {
      routines[routineIndex].tasks.push({ name: '', completed: false });
      saveRoutines();
      renderRoutineScreen(routineIndex);
      // Focus on the new task card
      const taskCards = appContainer.querySelectorAll('.task-card');
      taskCards[taskCards.length - 2].focus();
    }, 'task-card', 'new-task-card');

    newTaskCardContainer.appendChild(newTaskCard);
    appContainer.appendChild(newTaskCardContainer);
  }
}

// Function to toggle the completion of a task
function toggleTaskCompletion(taskCard) {
  const task = routines[currentRoutineIndex].tasks[taskCard.dataset.taskIndex];
  task.completed = taskCard.classList.toggle('completed');
  saveRoutines();

  updateProgressBar();
}

const gifList = [
  { url: 'https://giphy.com/embed/13hxeOYjoTWtK8', width: 480, height: 480 },
  { url: 'https://giphy.com/embed/DmzqK3goMu5v0W5SIg', width: 480, height: 269 },
  { url: 'https://giphy.com/embed/6YHTDaYbWsV942MuPk', width: 480, height: 274 },
  { url: 'https://giphy.com/embed/1PMVNNKVIL8Ig', width: 480, height: 360 },
  { url: 'https://giphy.com/embed/7SfAXqgRgh0li', width: 480, height: 346 },
  { url: 'https://giphy.com/embed/Xw6yFn7frR3Y4', width: 393, height: 480 },
  { url: 'https://giphy.com/embed/l2GsSPkKjx6ZW', width: 358, height: 480 },
  { url: 'https://giphy.com/embed/11StaZ9Lj74oCY', width: 480, height: 307 },
  { url: 'https://giphy.com/embed/GFHJXPCoVQEec', width: 480, height: 360 },
  { url: 'https://giphy.com/embed/rlkpAmX3gaLWE', width: 480, height: 360 }
];

function showFullScreenEffect() {
  const effectContainer = document.getElementById('full-screen-effect');
  effectContainer.style.display = 'flex';

  // Pick a random GIF
  const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
  const gifContainer = document.getElementById('gif-container');
  gifContainer.innerHTML = `<iframe src="${randomGif.url}" width="${randomGif.width}" height="${randomGif.height}" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>`;

  setTimeout(() => {
    document.getElementById('reset-button').classList.add('visible');
  }, 1000); // Show button after 1 second
}

function resetRoutine() {
  const routine = routines[currentRoutineIndex];
  routine.tasks.forEach(task => task.completed = false);
  saveRoutines();
  document.getElementById('full-screen-effect').style.display = 'none';
  document.getElementById('reset-button').classList.remove('visible');
  renderMainScreen();
}

// Function to create a new routine
function createNewRoutine() {
  const routineName = prompt('Enter the name of the new routine:');
  if (routineName) {
    routines.push({ name: routineName, tasks: [] });
    saveRoutines();
    const newRoutineIndex = routines.length - 1;
    isEditMode = true;
    renderRoutineScreen(newRoutineIndex);
  }
}

// Function to handle import
function handleImport() {
  const json = prompt('Paste your JSON-formatted routines here:');
  if (json) {
    try {
      const importedRoutines = JSON.parse(json);
      if (Array.isArray(importedRoutines)) {
        if (routines.length > 0) {
          if (confirm('This will overwrite your current routines. Are you sure?')) {
            routines = importedRoutines;
            saveRoutines();
            renderMainScreen();
          }
        } else {
          routines = importedRoutines;
          saveRoutines();
          renderMainScreen();
        }
      } else {
        alert('Invalid JSON format.');
      }
    } catch (e) {
      alert('Invalid JSON format.');
    }
  }
}

// Function to handle export
function handleExport() {
  const json = JSON.stringify(routines, null, 2);
  if (navigator.share) {
    navigator.share({
      title: 'My Routines',
      text: 'Here are my routines:',
      url: '',
      files: [new File([json], 'routines.json', { type: 'application/json' })]
    }).catch((e) => {
      console.error('Failed to share routines:', e);
      prompt('Copy the JSON-formatted routines:', json);
    });
  } else {
      navigator.clipboard.writeText(json).then(() => {
        alert('Routines copied to clipboard.');
      }).catch((e) => {
        console.error('Failed to share routines:', e);
        prompt('Copy the JSON-formatted routines:', json);
      });
  }
}

// Function to handle drag start event
function handleDragStart(e) {
  e.target.classList.add('dragging');
  appContainer.classList.add('no-hover');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.dataset.taskIndex);
}

// Function to handle drag over event
function handleDragOver(e) {
  e.preventDefault();
  const draggingTask = document.querySelector('.dragging');
  const taskCards = [...appContainer.querySelectorAll('.task-card-container')];
  const afterElement = taskCards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = e.clientY - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;

  if (afterElement == null) {
    const newTaskCard = appContainer.querySelector('.new-task-card');
    appContainer.insertBefore(draggingTask, newTaskCard);
  } else {
    appContainer.insertBefore(draggingTask, afterElement);
  }
}

// Function to handle drag end event
function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  appContainer.classList.remove('no-hover');
  const taskCards = [...appContainer.querySelectorAll('.task-card:not(.new-task-card)')];
  const newTasksOrder = taskCards.map(taskCard => {
    const taskIndex = taskCard.dataset.taskIndex;
    return routines[currentRoutineIndex].tasks[taskIndex];
  });
  routines[currentRoutineIndex].tasks = newTasksOrder;
  saveRoutines();
}

// Function to check if the app is running in standalone mode
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Function to show the "Add to Home Screen" balloon
function showAddToHomeScreen() {
  const addToHomeScreen = document.getElementById('add-to-home-screen');
  addToHomeScreen.style.display = 'flex';
}

// Function to toggle the settings menu
function toggleMenu() {
  const menu = document.getElementById('settings-menu');
  const overlay = document.getElementById('menu-overlay');
  const isHidden = menu.classList.toggle('hidden');
  overlay.classList.toggle('hidden', isHidden);
}

// Function to update the progress bar
function updateProgressBar() {
  const completedTasks = routines[currentRoutineIndex].tasks.filter(task => task.completed).length;
  const totalTasks = routines[currentRoutineIndex].tasks.length;
  const progressBar = document.getElementById('progress-bar');
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  progressBar.style.left = progress + '%';

  if (progress === 100) {
    showFullScreenEffect();
  }
}

// Check if the app is running on mobile and not in standalone mode
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && !isStandalone()) {
  showAddToHomeScreen();
}

// Initial render of the main screen
renderMainScreen();
