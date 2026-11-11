
const API_URL = "/tasks/";

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const taskList = document.getElementById("taskList");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

let currentFilter = "all";
let editingTaskId = null;


// Load tasks from backend
async function loadTasks() {
    try {
        const response = await fetch(
            `${API_URL}?status_filter=${currentFilter}`
        );

        if (!response.ok) {
            throw new Error("Unable to load tasks");
        }

        const tasks = await response.json();

        displayTasks(tasks);

    } catch (error) {
        taskList.innerHTML =
            '<p class="empty-message">Unable to load tasks. Please try again.</p>';
        console.error(error);
    }
}


// Display tasks
function displayTasks(tasks) {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML =
            '<p class="empty-message">No tasks found.</p>';
        return;
    }

    tasks.forEach(task => {

        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        const content = document.createElement("div");
        content.className = "task-content";

        const heading = document.createElement("h3");
        heading.textContent = task.title;

        if (task.completed) {
            heading.classList.add("completed-title");
        }

        const description = document.createElement("p");
        description.textContent =
            task.description || "No description";

        const status = document.createElement("p");
        status.className = "task-status";
        status.textContent = task.completed
            ? "Status: Completed"
            : "Status: Pending";

        content.appendChild(heading);
        content.appendChild(description);
        content.appendChild(status);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeBtn.addEventListener("click", () => {
            toggleTask(task);
        });

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {
            editTask(task);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(completeBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        taskItem.appendChild(content);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);
    });
}


// Add or update a task
taskForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const taskData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim()
    };

    if (!taskData.title) {
        alert("Please enter a task title.");
        return;
    }

    try {
        let response;

        if (editingTaskId === null) {

            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

        } else {

            response = await fetch(`${API_URL}${editingTaskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

        }

        if (!response.ok) {
            throw new Error("Unable to save task");
        }

        resetForm();
        loadTasks();

        alert(
            editingTaskId === null
                ? "Task added successfully!"
                : "Task updated successfully!"
        );

    } catch (error) {
        alert("Something went wrong. Please try again.");
        console.error(error);
    }
});


// Edit task
function editTask(task) {
    editingTaskId = task.id;

    titleInput.value = task.title;
    descriptionInput.value = task.description || "";

    submitBtn.textContent = "Update Task";
    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Reset form
function resetForm() {
    taskForm.reset();

    editingTaskId = null;

    submitBtn.textContent = "Add Task";
    cancelBtn.hidden = true;
}


// Cancel editing
cancelBtn.addEventListener("click", resetForm);


// Complete or undo task
async function toggleTask(task) {
    try {
        const response = await fetch(`${API_URL}${task.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                completed: !task.completed
            })
        });

        if (!response.ok) {
            throw new Error("Unable to update task");
        }

        loadTasks();

    } catch (error) {
        alert("Unable to update task.");
        console.error(error);
    }
}


// Delete task
async function deleteTask(taskId) {

    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}${taskId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete task");
        }

        loadTasks();

        alert("Task deleted successfully!");

    } catch (error) {
        alert("Unable to delete task.");
        console.error(error);
    }
}


// Filter tasks
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        loadTasks();
    });

});


// Initial loading
loadTasks();
