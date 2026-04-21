const currentUserEmail = localStorage.getItem("eduflowCurrentUserEmail");
const SCHEDULE_KEY = `eduflow-schedule-${currentUserEmail}`;

let scheduleItems = JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
scheduleItems = scheduleItems.map((item, index) => ({
    ...item,
    id: Number.isFinite(Number(item.id)) ? Number(item.id) : index + 1
}));

let nextId = scheduleItems.length ? Math.max(...scheduleItems.map(item => item.id)) + 1 : 1;
let currentFilter = "ALL";
let currentSearch = "";

const scheduleList = document.getElementById("scheduleList");
const scheduleCount = document.getElementById("scheduleCount");

const currentMonthLabel = document.getElementById("currentMonthLabel");
const calendarDates = document.getElementById("calendarDates");

const todayCount = document.getElementById("todayCount");
const weekCount = document.getElementById("weekCount");
const upcomingCount = document.getElementById("upcomingCount");
const totalCount = document.getElementById("totalCount");

const openScheduleModalBtn = document.getElementById("openScheduleModalBtn");
const scheduleModal = document.getElementById("scheduleModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const modalTitle = document.getElementById("modalTitle");
const scheduleForm = document.getElementById("scheduleForm");
const editIdField = document.getElementById("editId");
const scheduleTitle = document.getElementById("scheduleTitle");
const scheduleType = document.getElementById("scheduleType");
const scheduleDate = document.getElementById("scheduleDate");
const scheduleTime = document.getElementById("scheduleTime");
const scheduleNote = document.getElementById("scheduleNote");

const filterAllBtn = document.getElementById("filterAllBtn");
const filterTodayBtn = document.getElementById("filterTodayBtn");
const filterWeekBtn = document.getElementById("filterWeekBtn");
const filterUpcomingBtn = document.getElementById("filterUpcomingBtn");
const scheduleSearchInput = document.getElementById("scheduleSearchInput");

/* NAVIGATION */
function goBack() {
    window.location.href = "dashboard.html";
}

/* HELPERS */
function saveSchedule() {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleItems));
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

function getTypeClass(type) {
    return type.toLowerCase();
}

function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getWeekEnd() {
    const today = getTodayStart();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}

function setActiveFilter(activeBtn) {
    [filterAllBtn, filterTodayBtn, filterWeekBtn, filterUpcomingBtn].forEach(btn => {
        if (btn) btn.classList.remove("active");
    });

    if (activeBtn) activeBtn.classList.add("active");
}

/* SUMMARY */
function updateSummary() {
    const today = getTodayStart();
    const weekEnd = getWeekEnd();

    const todayItems = scheduleItems.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
    }).length;

    const weekItems = scheduleItems.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today && itemDate <= weekEnd;
    }).length;

    const upcomingItems = scheduleItems.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today;
    }).length;

    todayCount.textContent = todayItems;
    weekCount.textContent = weekItems;
    upcomingCount.textContent = upcomingItems;
    totalCount.textContent = scheduleItems.length;
}

/* CALENDAR */
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const todayDate = today.getDate();

    currentMonthLabel.textContent = now.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
    });

    let calendarHtml = "";

    for (let i = 0; i < firstDay; i++) {
        calendarHtml += `<div class="calendar-date muted"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateStr = fullDate.toISOString().slice(0, 10);

        const hasEvent = scheduleItems.some(item => item.date === dateStr);
        const isToday =
            day === todayDate &&
            month === today.getMonth() &&
            year === today.getFullYear();

        calendarHtml += `
            <div class="calendar-date ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""}">
                ${day}
            </div>
        `;
    }

    calendarDates.innerHTML = calendarHtml;
}

/* RENDER SCHEDULE */
function renderSchedule() {
    let filtered = [...scheduleItems];
    const today = getTodayStart();
    const weekEnd = getWeekEnd();

    if (currentFilter === "TODAY") {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === today.getTime();
        });
    }

    if (currentFilter === "WEEK") {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= today && itemDate <= weekEnd;
        });
    }

    if (currentFilter === "UPCOMING") {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= today;
        });
    }

    if (currentSearch.trim() !== "") {
        const query = currentSearch.trim().toLowerCase();
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            (item.note || "").toLowerCase().includes(query)
        );
    }

    filtered.sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time || "00:00"}`);
        const bDateTime = new Date(`${b.date}T${b.time || "00:00"}`);
        return aDateTime - bDateTime;
    });

    scheduleCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;

    if (filtered.length === 0) {
        scheduleList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-xmark"></i>
                <h3>No schedule items</h3>
                <p>Add your first lecture, meeting, or deadline.</p>
            </div>
        `;
        updateSummary();
        renderCalendar();
        saveSchedule();
        return;
    }

    scheduleList.innerHTML = filtered.map(item => `
        <div class="schedule-item">
            <div class="schedule-main">
                <span class="schedule-type ${getTypeClass(item.type)}">${item.type}</span>
                <h3>${item.title}</h3>

                <div class="schedule-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
                    <span><i class="fas fa-clock"></i> ${item.time || "No time set"}</span>
                </div>

                <p class="schedule-note">${item.note || "No additional note provided."}</p>
            </div>

            <div class="schedule-actions">
                <button class="action-btn" onclick="editSchedule(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteSchedule(${item.id})" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join("");

    updateSummary();
    renderCalendar();
    saveSchedule();
}

/* MODAL */
function openModal(editMode = false, item = null) {
    scheduleModal.classList.add("show");

    if (editMode && item) {
        modalTitle.textContent = "Edit Schedule Item";
        editIdField.value = item.id;
        scheduleTitle.value = item.title;
        scheduleType.value = item.type;
        scheduleDate.value = item.date;
        scheduleTime.value = item.time || "";
        scheduleNote.value = item.note || "";
    } else {
        modalTitle.textContent = "Add Schedule Item";
        editIdField.value = "";
        scheduleTitle.value = "";
        scheduleType.value = "Lecture";
        scheduleDate.value = new Date().toISOString().slice(0, 10);
        scheduleTime.value = "";
        scheduleNote.value = "";
    }
}

function closeModal() {
    scheduleModal.classList.remove("show");
}

/* ACTIONS */
function editSchedule(id) {
    const item = scheduleItems.find(item => item.id === id);
    if (!item) return;
    openModal(true, item);
}

function deleteSchedule(id) {
    const item = scheduleItems.find(item => item.id === id);
    if (!item) return;

    if (confirm(`Delete "${item.title}"?`)) {
        scheduleItems = scheduleItems.filter(item => item.id !== id);
        renderSchedule();
    }
}

/* FORM SUBMIT */
scheduleForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const editId = editIdField.value;

    const newItem = {
        title: scheduleTitle.value.trim(),
        type: scheduleType.value,
        date: scheduleDate.value,
        time: scheduleTime.value,
        note: scheduleNote.value.trim()
    };

    if (!newItem.title) {
        alert("Title is required.");
        return;
    }

    if (!newItem.date) {
        alert("Date is required.");
        return;
    }

    if (editId) {
        const index = scheduleItems.findIndex(item => item.id == editId);
        if (index !== -1) {
            scheduleItems[index] = { ...scheduleItems[index], ...newItem, id: Number(editId) };
        }
    } else {
        newItem.id = nextId++;
        scheduleItems.push(newItem);
    }

    closeModal();
    renderSchedule();
});

/* EVENTS */
openScheduleModalBtn.addEventListener("click", function () {
    openModal(false);
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

window.addEventListener("click", function (e) {
    if (e.target === scheduleModal) {
        closeModal();
    }
});

filterAllBtn.addEventListener("click", function () {
    currentFilter = "ALL";
    setActiveFilter(filterAllBtn);
    renderSchedule();
});

filterTodayBtn.addEventListener("click", function () {
    currentFilter = "TODAY";
    setActiveFilter(filterTodayBtn);
    renderSchedule();
});

filterWeekBtn.addEventListener("click", function () {
    currentFilter = "WEEK";
    setActiveFilter(filterWeekBtn);
    renderSchedule();
});

filterUpcomingBtn.addEventListener("click", function () {
    currentFilter = "UPCOMING";
    setActiveFilter(filterUpcomingBtn);
    renderSchedule();
});

scheduleSearchInput.addEventListener("input", function (e) {
    currentSearch = e.target.value;
    renderSchedule();
});

/* INIT */
renderSchedule();