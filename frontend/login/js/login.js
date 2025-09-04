document.getElementById("togglePassword-login").addEventListener("click", function() {
    const passwordField = document.getElementById("password-login");
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Para el formulario de registro
document.getElementById("togglePassword-register").addEventListener("click", function() {
    const passwordField = document.getElementById("password-register");
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Cambio entre formularios
document.getElementById("goToRegister").addEventListener("click", function() {
    // Ocultar el formulario de login
    document.getElementById("loginForm").style.display = "none";
    // Mostrar el formulario de registro
    document.getElementById("registerForm").style.display = "block";
});