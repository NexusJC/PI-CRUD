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
document.getElementById("registerFormElement").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password-register").value;

    const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password,
            role: "normal" // Asignamos "normal" por defecto, pero puedes cambiarlo
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Usuario registrado con éxito");
        // Redirigir a login o dashboard
    } else {
        alert(data.msg || "Hubo un error al registrar el usuario");
    }
});
