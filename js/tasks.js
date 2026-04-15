function goBack() {
    window.location.href = "index.html";
}

const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks yet</p>";
        return;
    }

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        let div = document.createElement("div");

        div.className = "task-card";

        if (task.completed) {
            div.className += " completed";
        }

        div.innerHTML =
            "<div class='task-card-header'>" +
                "<h3 class='task-card-title'>" + task.title + "</h3>" +
                "<span class='priority-badge " + task.priority.toLowerCase() + "'>" + task.priority + "</span>" +
            "</div>" +
            "<p class='task-card-description'>" + (task.description || "No description provided.") + "</p>" +
            "<div class='task-meta'>" +
                "<span class='meta-chip'>Due: " + task.dueDate + "</span>" +
                "<span class='meta-chip'>" + (task.completed ? "Completed" : "Pending") + "</span>" +
            "</div>" +
            "<div class='task-actions'>" +
                "<button class='complete-btn' onclick='completeTask(" + i + ")'>Complete</button>" +
                "<button class='delete-btn' onclick='deleteTask(" + i + ")'>Delete</button>" +
            "</div>";

        taskList.appendChild(div);
    }
}

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const dueDate = document.getElementById("dueDate").value;
        const priority = document.getElementById("priority").value;

        if (title === "" || dueDate === "") {
            alert("Please fill required fields");
            return;
        }

        let task = {
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            completed: false
        };

        tasks.push(task);
        saveTasks();
        renderTasks();
        form.reset();
    });
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function completeTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

renderTasks();