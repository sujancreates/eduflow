if (localStorage.getItem("eduflowLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const currentUserEmail = localStorage.getItem("eduflowCurrentUserEmail");
const TASKS_KEY = `eduflow-tasks-${currentUserEmail}`;
const ANNOUNCEMENTS_KEY = `eduflow-announcements-${currentUserEmail}`;

let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];

/* FIX OLD TASKS WITHOUT IDS */
tasks = tasks.map((task, index) => ({
    ...task,
    id: Number.isFinite(Number(task.id)) ? Number(task.id) : index + 1
}));

let nextId = tasks.length ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
let currentFilterPriority = "ALL";
let currentSearchQuery = "";

const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const statsGrid = document.getElementById("statsGrid");
const tableBody = document.getElementById("tableBody");

const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskForm = document.getElementById("taskForm");
const editIdField = document.getElementById("editId");
const titleField = document.getElementById("taskTitle");
const priorityField = document.getElementById("taskPriority");
const statusField = document.getElementById("taskStatus");
const dateField = document.getElementById("taskDate");

const globalSearchInput = document.getElementById("globalSearchInput");

const heroAddBtn = document.getElementById("heroAddBtn");
const quickAddBtn = document.getElementById("quickAddBtn");
const navAddTask = document.getElementById("navAddTask");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const filterHighBtn = document.getElementById("filterHighBtn");
const filterMediumBtn = document.getElementById("filterMediumBtn");
const filterLowBtn = document.getElementById("filterLowBtn");
const filterAllBtn = document.getElementById("filterAllBtn");

const userNameElement = document.getElementById("userName");
const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");
const profileAvatarLarge = document.getElementById("profileAvatarLarge");

const profileDropdown = document.getElementById("profileDropdown");
const profileTrigger = document.getElementById("profileTrigger");
const logoutBtn = document.getElementById("logoutBtn");

const viewAllTasksBtn = document.getElementById("viewAllTasksBtn");
const viewTasksModal = document.getElementById("viewTasksModal");
const closeViewTasksModalBtn = document.getElementById("closeViewTasksModalBtn");
const viewTasksList = document.getElementById("viewTasksList");

/* THEME */
const savedTheme = localStorage.getItem("eduflow-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeIcon) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("eduflow-theme", "dark");
            if (themeIcon) {
                themeIcon.classList.remove("fa-moon");
                themeIcon.classList.add("fa-sun");
            }
        } else {
            localStorage.setItem("eduflow-theme", "light");
            if (themeIcon) {
                themeIcon.classList.remove("fa-sun");
                themeIcon.classList.add("fa-moon");
            }
        }
    });
}

/* MOBILE MENU */
if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove("active");
        }
    });
}

/* NOTIFICATION BADGE */
function getAnnouncements() {
    return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)) || [];
}

function updateNotifications() {
    const badge = document.getElementById("notificationCount");
    if (!badge) return;

    const announcements = getAnnouncements();
    const unreadCount = announcements.filter(item => !item.isRead).length;

    badge.textContent = unreadCount;

    if (unreadCount === 0) {
        badge.style.display = "none";
    } else {
        badge.style.display = "inline-block";
    }
}

function refreshNotifications() {
    generateMissedTaskNotifications();
    updateNotifications();
}

/* HELPERS */
function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getStatusClass(status) {
    if (status === "Completed") return "completed";
    if (status === "Pending") return "pending";
    if (status === "In Progress") return "in-progress";
    return "";
}

function getPriorityClass(priority) {
    if (priority === "High") return "high";
    if (priority === "Medium") return "medium";
    if (priority === "Low") return "low";
    return "";
}

function getStoredUser() {
    const users = JSON.parse(localStorage.getItem("eduflowUsers")) || [];
    if (!currentUserEmail) return null;
    return users.find(user => user.email === currentUserEmail) || null;
}

function getInitials(name) {
    if (!name) return "L";

    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function loadLoggedInUser() {
    const isLoggedIn = localStorage.getItem("eduflowLoggedIn");
    const currentUserName = localStorage.getItem("eduflowCurrentUser");
    const storedUser = getStoredUser();

    if (isLoggedIn !== "true") {
        window.location.href = "login.html";
        return;
    }

    const firstName = currentUserName ? currentUserName.trim().split(" ")[0] : "Lecturer";

    if (userNameElement) {
        userNameElement.textContent = firstName;
    }

    if (profileFullName && currentUserName) {
        profileFullName.textContent = currentUserName;
    }

    if (profileEmail && storedUser?.email) {
        profileEmail.textContent = storedUser.email;
    }

    const initials = getInitials(currentUserName);

    if (profileAvatar) {
        profileAvatar.textContent = initials;
    }

    if (profileAvatarLarge) {
        profileAvatarLarge.textContent = initials;
    }
}

function logoutUser() {
    localStorage.setItem("eduflowLoggedIn", "false");
    localStorage.removeItem("eduflowCurrentUser");
    localStorage.removeItem("eduflowCurrentUserEmail");
    window.location.href = "index.html";
}

function setActiveFilterButton(activeButton) {
    [filterHighBtn, filterMediumBtn, filterLowBtn, filterAllBtn].forEach(btn => {
        if (btn) btn.classList.remove("active");
    });

    if (activeButton) {
        activeButton.classList.add("active");
    }
}

function generateMissedTaskNotifications() {
    const announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)) || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let changed = false;

    tasks.forEach(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);

        const isMissed = taskDate <= today && task.status !== "Completed";

        if (isMissed && !task.notified) {
            announcements.unshift({
                id: Date.now() + Math.random(),
                taskId: Number(task.id),
                title: "Missed Task Alert",
                message: `You missed "${task.title}" (Due: ${formatDate(task.date)}). Please review it as soon as possible.`,
                type: "missed-task",
                isRead: false,
                createdAt: new Date().toISOString()
            });

            task.notified = true;
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
}

/* STATS */
function updateStats() {
    if (!statsGrid) return;

    const total = tasks.length;
    const pending = tasks.filter(task => task.status === "Pending").length;
    const completed = tasks.filter(task => task.status === "Completed").length;
    const upcoming = tasks.filter(task => task.status !== "Completed").length;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-info">
                <h4>Total Tasks</h4>
                <div class="stat-number">${total}</div>
            </div>
            <div class="stat-icon"><i class="fas fa-layer-group"></i></div>
        </div>

        <div class="stat-card">
            <div class="stat-info">
                <h4>Pending Tasks</h4>
                <div class="stat-number">${pending}</div>
            </div>
            <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
        </div>

        <div class="stat-card">
            <div class="stat-info">
                <h4>Completed Tasks</h4>
                <div class="stat-number">${completed}</div>
            </div>
            <div class="stat-icon"><i class="fas fa-circle-check"></i></div>
        </div>

        <div class="stat-card">
            <div class="stat-info">
                <h4>Upcoming Work</h4>
                <div class="stat-number">${upcoming}</div>
            </div>
            <div class="stat-icon"><i class="fas fa-calendar-week"></i></div>
        </div>
    `;
}

/* TASK ACTIONS */
function viewTask(id) {
    id = Number(id);
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    alert(
        `Task: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue Date: ${formatDate(task.date)}`
    );
}

function editTask(id) {
    id = Number(id);
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    openModal(true, task);
}

function deleteTask(id) {
    id = Number(id);

    if (isNaN(id)) {
        console.error("Invalid task ID:", id);
        return;
    }

    const task = tasks.find(task => task.id === id);
    if (!task) return;

    if (confirm(`Delete "${task.title}"?`)) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        refreshNotifications();
    }
}

/* RENDER TASKS */
function renderTasks() {
    let filtered = [...tasks];

    if (currentFilterPriority !== "ALL") {
        filtered = filtered.filter(task => task.priority === currentFilterPriority);
    }

    if (currentSearchQuery.trim() !== "") {
        const query = currentSearchQuery.trim().toLowerCase();
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(query) ||
            task.priority.toLowerCase().includes(query) ||
            task.status.toLowerCase().includes(query)
        );
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!tableBody) return;

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 60px;">
                    <div style="opacity:0.8;">
                        <i class="fas fa-clipboard-list" style="font-size:2rem; margin-bottom:10px;"></i>
                        <h3>No tasks yet</h3>
                        <p>Start by adding your first task 🚀</p>
                    </div>
                </td>
            </tr>
        `;
        updateStats();
        updateNotifications();
        return;
    }

    tableBody.innerHTML = filtered.map(task => `
        <tr>
            <td>${formatDate(task.date)}</td>
            <td><strong>${task.title}</strong></td>
            <td>
                <span class="priority-badge ${getPriorityClass(task.priority)}">
                    ${task.priority}
                </span>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(task.status)}">
                    ${task.status}
                </span>
            </td>
            <td class="action-icons">
                <i class="fas fa-eye" title="View" onclick="viewTask(${task.id})"></i>
                <i class="fas fa-edit" title="Edit" onclick="editTask(${task.id})"></i>
                <i class="fas fa-trash-alt" title="Delete" onclick="deleteTask(${task.id})"></i>
            </td>
        </tr>
    `).join("");

    updateStats();
    saveTasks();
    updateNotifications();
}

/* MODAL */
function openModal(editMode = false, taskData = null) {
    if (!modal) return;

    modal.classList.add("show");

    if (editMode && taskData) {
        modalTitle.textContent = "Edit Task";
        editIdField.value = taskData.id;
        titleField.value = taskData.title;
        priorityField.value = taskData.priority;
        statusField.value = taskData.status;
        dateField.value = taskData.date;
    } else {
        modalTitle.textContent = "Add New Task";
        editIdField.value = "";
        titleField.value = "";
        priorityField.value = "High";
        statusField.value = "Pending";
        dateField.value = new Date().toISOString().slice(0, 10);
    }
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
}

function openViewTasksModal() {
    if (!viewTasksModal || !viewTasksList) return;

    const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedTasks.length === 0) {
        viewTasksList.innerHTML = `
            <div class="empty-tasks-message">
                No tasks available.
            </div>
        `;
    } else {
        viewTasksList.innerHTML = sortedTasks.map(task => `
            <div class="view-task-item">
                <div class="view-task-main">
                    <h4>${task.title}</h4>
                    <div class="view-task-meta">
                        <span>Due: ${formatDate(task.date)}</span>
                        <span class="priority-badge ${getPriorityClass(task.priority)}">${task.priority}</span>
                        <span class="status-badge ${getStatusClass(task.status)}">${task.status}</span>
                    </div>
                </div>
            </div>
        `).join("");
    }

    viewTasksModal.classList.add("show");
}

function closeViewTasksModal() {
    if (!viewTasksModal) return;
    viewTasksModal.classList.remove("show");
}

/* FORM SUBMIT */
if (taskForm) {
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const editId = editIdField.value;

        const newTask = {
            title: titleField.value.trim(),
            priority: priorityField.value,
            status: statusField.value,
            date: dateField.value
        };

        if (!newTask.title) {
            alert("Task title is required.");
            return;
        }

        if (!newTask.date) {
            alert("Date is required.");
            return;
        }

        if (editId) {
            const index = tasks.findIndex(task => task.id == editId);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...newTask, id: Number(editId) };
            }
        } else {
            newTask.id = nextId++;
            tasks.push(newTask);
        }

        saveTasks();
        closeModal();
        renderTasks();
        refreshNotifications();
    });
}

/* FILTERS */
if (filterHighBtn) {
    filterHighBtn.addEventListener("click", function () {
        currentFilterPriority = "High";
        currentSearchQuery = globalSearchInput ? globalSearchInput.value : "";
        setActiveFilterButton(filterHighBtn);
        renderTasks();
    });
}

if (filterMediumBtn) {
    filterMediumBtn.addEventListener("click", function () {
        currentFilterPriority = "Medium";
        currentSearchQuery = globalSearchInput ? globalSearchInput.value : "";
        setActiveFilterButton(filterMediumBtn);
        renderTasks();
    });
}

if (filterLowBtn) {
    filterLowBtn.addEventListener("click", function () {
        currentFilterPriority = "Low";
        currentSearchQuery = globalSearchInput ? globalSearchInput.value : "";
        setActiveFilterButton(filterLowBtn);
        renderTasks();
    });
}

if (filterAllBtn) {
    filterAllBtn.addEventListener("click", function () {
        currentFilterPriority = "ALL";
        currentSearchQuery = globalSearchInput ? globalSearchInput.value : "";
        setActiveFilterButton(filterAllBtn);
        renderTasks();
    });
}

/* SEARCH */
if (globalSearchInput) {
    globalSearchInput.addEventListener("input", function (e) {
        currentSearchQuery = e.target.value;
        renderTasks();
    });
}

/* VIEW TASKS MODAL */
if (viewAllTasksBtn) {
    viewAllTasksBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openViewTasksModal();
    });
}

if (closeViewTasksModalBtn) {
    closeViewTasksModalBtn.addEventListener("click", closeViewTasksModal);
}

/* OPEN MODAL BUTTONS */
if (heroAddBtn) {
    heroAddBtn.addEventListener("click", function () {
        openModal(false);
    });
}

if (quickAddBtn) {
    quickAddBtn.addEventListener("click", function () {
        openModal(false);
    });
}

if (navAddTask) {
    navAddTask.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(false);
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", closeModal);
}

window.addEventListener("click", function (e) {
    if (e.target === modal) {
        closeModal();
    }

    if (e.target === viewTasksModal) {
        closeViewTasksModal();
    }
});

/* PROFILE DROPDOWN */
if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        profileDropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
        if (!profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove("active");
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        logoutUser();
    });
}

/* KEEP BADGE IN SYNC ACROSS PAGES */
window.addEventListener("focus", function () {
    refreshNotifications();
});

window.addEventListener("storage", function (e) {
    if (e.key === ANNOUNCEMENTS_KEY || e.key === TASKS_KEY) {
        refreshNotifications();
    }
});

/* INIT */
loadLoggedInUser();
saveTasks();
renderTasks();
setActiveFilterButton(filterAllBtn);
refreshNotifications();