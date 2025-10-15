// Mostrar/ocultar contraseña
const toggleLogin = document.getElementById("togglePassword-login");
if (toggleLogin) {
    toggleLogin.addEventListener("click", function () {
        const passwordField = document.getElementById("contraseña");
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
}

const toggleRegister= document.getElementById("togglePassword-register");
if (toggleRegister) {
    toggleRegister.addEventListener("click", function () {
        const passwordField = document.getElementById("contraseña2");
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
}


// Cambiar entre login y registro
const goToRegister = document.getElementById("goToRegister");
if (goToRegister) {
    goToRegister.addEventListener("click", function () {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "block";
    });
}

// Registrar nuevo usuario
const registerForm = document.getElementById("registerFormElement");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const contraseña = document.getElementById("contraseña").value;

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: nombre,
                email: correo,
                password: contraseña,
                role: "usuario", // puedes cambiar el rol si gustas
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Usuario registrado con éxito");
            // Redirigir o limpiar formulario
        } else {
            alert(data.message || "Hubo un error al registrar el usuario");
        }
    });
}
