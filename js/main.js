//connecting javascript with html by using DOM(Document Object Model)
let settingToggle = document.getElementById("settings-toggle");
let settingsCard = document.getElementById("settings-card");
let themeSwitch = document.getElementById("theme-switch");

let menuToggle = document.getElementById("menu-toggle");
let sidebar = document.getElementById("sidebar");
let overlay = document.getElementById("overlay");

// Theme -----Local Storage is a features in the browser that lets us to save data in the browser itself..
let savedTheme = localStorage.getItem("eduassist-theme");

if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}

if (themeSwitch) { //making the theme switch work only if it exists on the page
    //addEventListner is a method that allows us to listen for events on an element and execute a function when that event occurs.
    themeSwitch.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");
        //toggle()- if the class is present, it removes it; if it's not present, it adds it.

        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("eduassist-theme", "light");
        } else {
            localStorage.setItem("eduassist-theme", "dark");
        }
    });
}

// Settings Toggle -- 
if (settingToggle && settingsCard) {
    settingToggle.addEventListener("click", function (event) {
        event.stopPropagation(); //stopPropagation() is a method that prevents the event from bubbling up to parent elements, ensuring that only the intended element responds to the click.
        settingsCard.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!settingsCard.contains(event.target) && !settingToggle.contains(event.target)) {
            settingsCard.classList.remove("active");
        }
    });
}

//Mobile sidebar 
if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", function () {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });


}

//Recent Tasks
function loadRecentTasks() {
    const recentTasksContainer = document.getElementById("recent-tasks-list");
    if (!recentTasksContainer) return;

    //JSON.parse() is a method that parses a JSON string and converts it into a JavaScript object. localStorage.getItem("tasks") retrieves the stringified tasks from local storage, and if there are no tasks, it defaults to an empty array.
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    recentTasksList.innerHTML = "";

    if (tasks.length === 0) {
        recentTasksList.innerHTML = "<li>No recent tasks added yet.</li>";
        return;
    }
}


