const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ---------------- GO BACK ---------------- */
function goBack() {
    window.location.href = "index.html";
}

/* ---------------- THEME TOGGLE ---------------- */
const savedTheme = localStorage.getItem("eduassist-theme");

if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeIcon) {
        themeIcon.classList.replace("fa-moon", "fa-sun");
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("eduassist-theme", "light");
            if (themeIcon) {
                themeIcon.classList.replace("fa-moon", "fa-sun");
            }
        } else {
            localStorage.setItem("eduassist-theme", "dark");
            if (themeIcon) {
                themeIcon.classList.replace("fa-sun", "fa-moon");
            }
        }
    });
}

/* ---------------- MOBILE SIDEBAR ---------------- */
if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
}

/* ---------------- TASK LOCAL STORAGE ---------------- */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------------- TASK RENDER ---------------- */
function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No tasks yet</h3>
        <p>Add your first task to get started.</p>
      </div>
    `;
        return;
    }

    tasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.classList.add("task-card");

        if (task.completed) {
            div.classList.add("completed");
        }

        const priorityClass = task.priority.toLowerCase();

        div.innerHTML = `
      <div class="task-card-header">
        <div>
          <h3 class="task-card-title">${task.title}</h3>
        </div>
        <span class="priority-badge ${priorityClass}">${task.priority}</span>
      </div>

      <p class="task-card-description">
        ${task.description ? task.description : "No description provided."}
      </p>

      <div class="task-meta">
        <span class="meta-chip">
          <i class="fas fa-calendar-alt"></i> ${task.dueDate}
        </span>
        <span class="meta-chip">
          <i class="fas fa-circle-info"></i> ${task.completed ? "Completed" : "Pending"}
        </span>
      </div>

      <div class="task-actions">
        <button class="complete-btn" onclick="completeTask(${index})">
          <i class="fas fa-check"></i>
          ${task.completed ? "Completed" : "Mark Complete"}
        </button>

        <button class="delete-btn" onclick="deleteTask(${index})">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    `;

        taskList.appendChild(div);
    });
}

/* ---------------- ADD TASK ---------------- */
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const dueDate = document.getElementById("dueDate").value;
        const priority = document.getElementById("priority").value;

        if (!title || !dueDate) return;

        const task = {
            title,
            description,
            dueDate,
            priority,
            completed: false
        };

        tasks.push(task);
        saveTasks();
        renderTasks();
        form.reset();
    });
}

/* ---------------- DELETE TASK ---------------- */
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

/* ---------------- COMPLETE TASK ---------------- */
function completeTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

/* ---------------- INITIAL RENDER ---------------- */
renderTasks();


