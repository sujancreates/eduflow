const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginPassword = document.getElementById("login-password");

const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const signupPassword = document.getElementById("password");

<<<<<<< HEAD

=======
>>>>>>> remove-setting/profile
/*    HELPERS */
function showError(input, message) {
    const inputGroup = input.closest(".input-group");
    const inputWrap = inputGroup.querySelector(".input-wrap");
    const errorText = inputGroup.querySelector(".error-text");

    inputWrap.classList.add("error");
    inputWrap.classList.remove("success");
    errorText.textContent = message;
}

function showSuccess(input) {
    const inputGroup = input.closest(".input-group");
    const inputWrap = inputGroup.querySelector(".input-wrap");
    const errorText = inputGroup.querySelector(".error-text");

    inputWrap.classList.remove("error");
    inputWrap.classList.add("success");
    errorText.textContent = "";
}

function clearFieldState(input) {
    const inputGroup = input.closest(".input-group");
    const inputWrap = inputGroup.querySelector(".input-wrap");
    const errorText = inputGroup.querySelector(".error-text");

    inputWrap.classList.remove("error", "success");
    errorText.textContent = "";
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function getStoredUsers() {
    const storedUsers = localStorage.getItem("eduflowUsers");
    return storedUsers ? JSON.parse(storedUsers) : [];
}

function saveUsers(users) {
    localStorage.setItem("eduflowUsers", JSON.stringify(users));
}

/* migrate old single-user storage if it exists */
function migrateOldSingleUser() {
    const oldUser = localStorage.getItem("eduflowUser");
    const users = getStoredUsers();

    if (oldUser && users.length === 0) {
        try {
            const parsedOldUser = JSON.parse(oldUser);
            saveUsers([parsedOldUser]);
        } catch (error) {
            console.error("Failed to migrate old user data:", error);
        }
    }
}

migrateOldSingleUser();

/*    SIGNUP */
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const password = document.getElementById("password");

        let isFormValid = true;

        if (name.value.trim() === "") {
            showError(name, "Full name is required");
            isFormValid = false;
        } else if (name.value.trim().length < 3) {
            showError(name, "Full name must be at least 3 characters");
            isFormValid = false;
        } else {
            showSuccess(name);
        }

        if (email.value.trim() === "") {
            showError(email, "Email is required");
            isFormValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, "Enter a valid email address");
            isFormValid = false;
        } else {
            showSuccess(email);
        }

        if (password.value.trim() === "") {
            showError(password, "Password is required");
            isFormValid = false;
        } else if (password.value.trim().length < 6) {
            showError(password, "Password must be at least 6 characters");
            isFormValid = false;
        } else {
            showSuccess(password);
        }

        if (!isFormValid) return;

        const users = getStoredUsers();
        const normalizedEmail = email.value.trim().toLowerCase();

        const existingUser = users.find(
            user => user.email.toLowerCase() === normalizedEmail
        );

        if (existingUser) {
            showError(email, "An account with this email already exists");
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name.value.trim(),
            email: normalizedEmail,
            password: password.value.trim()
        };

        users.push(newUser);
        saveUsers(users);

        localStorage.setItem("eduflowLoggedIn", "false");

        // alert("Account created successfully! Please login.");
        window.location.href = "login.html";
    });
}

/*    LOGIN */
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("login-email");
        const password = document.getElementById("login-password");

        let isFormValid = true;

        if (email.value.trim() === "") {
            showError(email, "Email is required");
            isFormValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, "Enter a valid email address");
            isFormValid = false;
        } else {
            showSuccess(email);
        }

        if (password.value.trim() === "") {
            showError(password, "Password is required");
            isFormValid = false;
        } else if (password.value.trim().length < 6) {
            showError(password, "Password must be at least 6 characters");
            isFormValid = false;
        } else {
            showSuccess(password);
        }

        if (!isFormValid) return;

        const users = getStoredUsers();

        if (users.length === 0) {
            showError(email, "No account found. Please create an account first");
            return;
        }

        const normalizedEmail = email.value.trim().toLowerCase();

        const matchedUser = users.find(
            user => user.email.toLowerCase() === normalizedEmail
        );

        if (!matchedUser) {
            showError(email, "Email does not match any account");
            clearFieldState(password);
            return;
        }

        if (password.value.trim() !== matchedUser.password) {
            clearFieldState(email);
            showError(password, "Incorrect password");
            return;
        }

        showSuccess(email);
        showSuccess(password);

        localStorage.setItem("eduflowLoggedIn", "true");
        localStorage.setItem("eduflowCurrentUser", matchedUser.name);
        localStorage.setItem("eduflowCurrentUserEmail", matchedUser.email);

        // alert("Login successful!");
        window.location.href = "dashboard.html";
    });
}

/*    PASSWORD TOGGLE */
if (toggleLoginPassword && loginPassword) {
    toggleLoginPassword.addEventListener("click", function () {
        const isPassword = loginPassword.type === "password";
        loginPassword.type = isPassword ? "text" : "password";
        this.innerHTML = isPassword
            ? '<i class="fas fa-eye-slash"></i>'
            : '<i class="fas fa-eye"></i>';
    });
}

if (toggleSignupPassword && signupPassword) {
    toggleSignupPassword.addEventListener("click", function () {
        const isPassword = signupPassword.type === "password";
        signupPassword.type = isPassword ? "text" : "password";
        this.innerHTML = isPassword
            ? '<i class="fas fa-eye-slash"></i>'
            : '<i class="fas fa-eye"></i>';
    });
}