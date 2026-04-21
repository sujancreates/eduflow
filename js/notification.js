if (localStorage.getItem("eduflowLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const currentUserEmail = localStorage.getItem("eduflowCurrentUserEmail");
const TASKS_KEY = `eduflow-tasks-${currentUserEmail}`;
const ANNOUNCEMENTS_KEY = `eduflow-announcements-${currentUserEmail}`;

let announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)) || [];
let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];

let currentFilter = "ALL";
let currentSearch = "";

const announcementList = document.getElementById("announcementList");
const announcementCount = document.getElementById("announcementCount");
const announcementSearchInput = document.getElementById("announcementSearchInput");

const filterAllBtn = document.getElementById("filterAllBtn");
const filterUnreadBtn = document.getElementById("filterUnreadBtn");
const filterReadBtn = document.getElementById("filterReadBtn");

const markAllReadBtn = document.getElementById("markAllReadBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

/* NAVIGATION */
function goBack() {
    window.location.href = "dashboard.html";
}

/* HELPERS */
function saveAnnouncements() {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
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

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setActiveFilterButton(activeButton) {
    [filterAllBtn, filterUnreadBtn, filterReadBtn].forEach(btn => {
        if (btn) btn.classList.remove("active");
    });

    if (activeButton) {
        activeButton.classList.add("active");
    }
}

/* MISSED TASK NOTIFICATIONS */
function generateMissedTaskNotifications() {
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
        saveAnnouncements();
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
}

/* RENDER */
function renderAnnouncements() {
    let filtered = [...announcements];

    if (currentFilter === "UNREAD") {
        filtered = filtered.filter(item => !item.isRead);
    }

    if (currentFilter === "READ") {
        filtered = filtered.filter(item => item.isRead);
    }

    if (currentSearch.trim() !== "") {
        const query = currentSearch.trim().toLowerCase();
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.message.toLowerCase().includes(query)
        );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (announcementCount) {
        announcementCount.textContent = `${filtered.length} announcement${filtered.length === 1 ? "" : "s"}`;
    }

    if (!announcementList) return;

    if (filtered.length === 0) {
        announcementList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>No announcements</h3>
                <p>You have no notifications right now.</p>
            </div>
        `;
        return;
    }

    announcementList.innerHTML = filtered.map(item => `
        <div class="announcement-card ${item.isRead ? "read" : "unread"}">
            <div class="announcement-left">
                <h4>${item.title}</h4>
                <p>${item.message}</p>

                <div class="announcement-meta">
                    <span class="announcement-time">${formatDateTime(item.createdAt)}</span>
                    <span class="announcement-type">${item.type === "missed-task" ? "Missed Task" : "General"}</span>
                </div>
            </div>

            <div class="announcement-actions">
                ${!item.isRead ? `<button class="small-btn" onclick="markAsRead(${item.id})">Mark as read</button>` : ""}
                <button class="small-btn delete" onclick="deleteAnnouncement(${item.id})">Delete</button>
            </div>
        </div>
    `).join("");
}

/* ACTIONS */
function markAsRead(id) {
    announcements = announcements.map(item =>
        item.id === id ? { ...item, isRead: true } : item
    );
    saveAnnouncements();
    renderAnnouncements();
}

function deleteAnnouncement(id) {
    announcements = announcements.filter(item => item.id !== id);
    saveAnnouncements();
    renderAnnouncements();
}

function markAllAsRead() {
    announcements = announcements.map(item => ({ ...item, isRead: true }));
    saveAnnouncements();
    renderAnnouncements();
}

function clearAllAnnouncements() {
    if (confirm("Clear all announcements?")) {
        announcements = [];
        saveAnnouncements();
        renderAnnouncements();
    }
}

/* EVENTS */
if (filterAllBtn) {
    filterAllBtn.addEventListener("click", function () {
        currentFilter = "ALL";
        setActiveFilterButton(filterAllBtn);
        renderAnnouncements();
    });
}

if (filterUnreadBtn) {
    filterUnreadBtn.addEventListener("click", function () {
        currentFilter = "UNREAD";
        setActiveFilterButton(filterUnreadBtn);
        renderAnnouncements();
    });
}

if (filterReadBtn) {
    filterReadBtn.addEventListener("click", function () {
        currentFilter = "READ";
        setActiveFilterButton(filterReadBtn);
        renderAnnouncements();
    });
}

if (announcementSearchInput) {
    announcementSearchInput.addEventListener("input", function (e) {
        currentSearch = e.target.value;
        renderAnnouncements();
    });
}

if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
}

if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllAnnouncements);
}

/* INIT */
generateMissedTaskNotifications();
renderAnnouncements();
setActiveFilterButton(filterAllBtn);