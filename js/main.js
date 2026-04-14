    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay"); 

    // theme toggle
    const savedTheme = localStorage.getItem("eduassist-theme");

    if(savedTheme === "light") {
        document.body.classList.add("light-mode");
        if(themeIcon) {
            themeIcon.classList.replace("fa-moon", "fa-sun");
        }   
    }

