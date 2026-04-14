    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay"); 

    // theme toggle - it lets user switch between light and dark mode and save the preference in local storage...   
    const savedTheme = localStorage.getItem("eduassist-theme");
    if(savedTheme === "light") {
        document.body.classList.add("light-mode");
        if(themeIcon) {
            themeIcon.classList.replace("fa-moon", "fa-sun");
        }   
    }

    if(themeToggle){
        themeToggle.addEventListener("click", function(){
            document.body.classList.toggle("light-mode");

            if(document.body.classList.contains("light-mode")){
                localStorage.setItem("eduassist-theme", "light");
                if(themeIcon){
                    themeIcon.classList.replace("fa-moon", "fa-sun");
                }
            }else{
                localStorage.setItem("eduassist-theme", "dark");
                if(themeIcon){
                    themeIcon.classList.replace("fa-sun", "fa-moon");
                }
            }
        });
    }


