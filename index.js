// TASK: import helper functions from utils
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from './utils/taskFunctions.js';
// TASK: import initialData
import {initialData} from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  logo: document.getElementById('logo'),
  boardsNavLinks: document.getElementById('boards-nav-links-div'),
  themeToggleSwitch: document.getElementById('switch'),
  hideSideBarButton: document.getElementById('hide-side-bar-btn'),
  showSideBarButton: document.getElementById('show-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskButton: document.getElementById('add-new-task-btn'),
  editBoardButton: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  deleteBoardButton: document.getElementById('deleteBoardBtn'),
  
  // Columns
  todoColumn: document.querySelector('[data-status="todo"] .tasks-container'),
  doingColumn: document.querySelector('[data-status="doing"] .tasks-container'),
  doneColumn: document.querySelector('[data-status="done"] .tasks-container'),
  
  // New Task Modal
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descriptionInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  createTaskButton: document.getElementById('create-task-btn'),

  // Edit Task Modal
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  cancelEditButton: document.getElementById('cancel-edit-btn'),
 

  // Filters
  filterDiv: document.getElementById('filterDiv'),
  columnDivs: document.querySelectorAll('.column-div'),  // Select all divs with class "column-div"
}
export default elements;

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  if (!tasks || !Array.isArray(tasks)) {
    console.error("No tasks found or tasks is not an array.");
    return;
}

  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard: boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
  else {
    elements.headerBoardName.textContent = "No Boards Available";
    // Optionally clear task display UI here
}
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    //Attaching click event listener
    boardElement.addEventListener("click", () =>  { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);// '===' for comparison

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status)
    .forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { 
       
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { //foreach to forEach
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }                                        //added '.classlist'
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarButton.addEventListener('click', () => toggleSidebar(false) );
  elements.showSideBarButton.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeToggleSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createTaskButton.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    event.preventDefault();// stops defualt submission
    addTask(event)
  });

  elements.addNewTaskButton.addEventListener('click', () => 
    toggleModal(true, elements.newTaskModalWindow)
  );
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal) {
  modal.style.display = show ? 'block':'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/


function addTask(event) {
  event.preventDefault(); 

  // Assign user input to the task object
  const task = {
    title: event.target['title-input'].value, // Assuming input name is 'title-input'
    description: event.target['desc-input'].value, // Assuming input name is 'desc-input'
    status: event.target['select-status'].value, // Assuming select name is 'select-status'
    board: activeBoard, // Use active board from the context
    id: Date.now() // Generate a unique ID using timestamp
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset(); // Reset the form inputs
    refreshTasksUI(); // Refresh the UI to show the new task
  }
}


function toggleSidebar(show) {
  const sideBar = document.getElementById('side-bar-div');
  const showButton = elements.showSideBarButton; // Reference to the show button
  const hideButton = elements.hideSideBarButton; // Reference to the hide button

  sideBar.style.display = show ? 'block' : 'none'; // Show or hide sidebar
  localStorage.setItem('showSideBar', show); // Save preference to local storage

  // Show/hide buttons based on sidebar visibility
  if (show) {
    showButton.style.display = 'none'; // Hide show button when sidebar is visible
    hideButton.style.display = 'block'; // Show hide button when sidebar is visible
  } else {
    showButton.style.display = 'block'; // Show show button when sidebar is hidden
    hideButton.style.display = 'none'; // Hide hide button when sidebar is hidden
  }
}




function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled'); // Save theme preference
}


function openEditTaskModal(task) {
  // Set task details in the modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal

  // Get button elements from the modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Save changes on clicking "Save Changes" button
  saveChangesBtn.onclick = () => {
    saveTaskChanges(task.id); // Call the function to update the task
  };

  // Delete task on clicking "Delete Task" button
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id); // Use deleteTask() to remove the task
    toggleModal(false, elements.editTaskModalWindow); // Hide the modal
    refreshTasksUI(); // Refresh the UI after deleting the task
  };
}



function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
  };
  
  // Update task using a helper function
  patchTask(taskId, updatedTask); // Update task fields only

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI(); // Ensure UI is updated
}




/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
  initializeData()
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}


