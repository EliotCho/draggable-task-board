// Retrieve tasks and nextId from localStorage
// let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const todoList = $("#todo-cards");
const formModal = $("#formModal");

// get localstorage items of taskList OR make empty array
function readLocalStorage() {
  let taskList = JSON.parse(localStorage.getItem("taskList")) || [];
  return taskList;
}

// save the task list to local storage as taskList
function saveLocalStorage(taskList) {
  localStorage.setItem("taskList", JSON.stringify(taskList));
}

// create a function to generate a unique task id
function generateTaskId() {
  const taskId = "id" + new Date().getTime();
  uniquetaskId = taskId;
  return uniquetaskId;
}

// create a function to create a task card
function createTaskCard(task) {
  console.log("we are creating cards");
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  // sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // if the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  // gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}

// create a function to render the task list and make cards draggable
function renderTaskList() {
  console.log("we are rendering the task list");
  const taskList = readLocalStorage();

  const todoColumn = $("#todo-cards");
  const inProgressColumn = $("#in-progress-cards");
  const doneColumn = $("#done-cards");
  todoColumn.empty();
  inProgressColumn.empty();
  doneColumn.empty();

  for (let i of taskList) {
    if (i.status === "to-do") {
      todoColumn.append(createTaskCard(i));
    } else if (i.status === "in-progress") {
      inProgressColumn.append(createTaskCard(i));
    } else {
      doneColumn.append(createTaskCard(i));
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
  });
}

// create a function to handle adding a new task
function handleAddTask(event) {
  const taskList = readLocalStorage();
  event.preventDefault();
  console.log("we are adding a task");

  let taskTitle = $("#taskTitle");
  let taskDueDate = $("#taskDueDate");
  let taskDescription = $("#taskDescription");

  const taskObj = {
    title: taskTitle.val().trim(),
    dueDate: taskDueDate.val().trim(),
    description: taskDescription.val().trim(),
    id: generateTaskId(),
    status: "to-do",
  };

  taskList.push(taskObj);
  saveLocalStorage(taskList);

  renderTaskList();
  $("#taskTitle").val("");
  $("#taskDueDate").val("");
  $("#taskDescription").val("");
}

// create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
  const taskList = readLocalStorage();

  taskList.forEach((task) => {
    if (task.id === taskId) {
      taskList.splice(taskList.indexOf(task), 1);
    }
  });

  // function to save the projects to localStorage
  saveLocalStorage(taskList);

  //  use other function to print projects back to the screen
  renderTaskList();
}

// create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskList = readLocalStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  console.log(taskId);
  console.log("ui.draggable");
  console.log(ui.draggable);
  const status = event.target.id;

  for (let task of taskList) {
    if (task.id === taskId) {
      task.status = status;
      console.log(`task status is now: ${task.status}`);
    }
  }
  localStorage.setItem("taskList", JSON.stringify(taskList));
  renderTaskList();
}

// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  formModal.on("submit", handleAddTask);
  renderTaskList();

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
