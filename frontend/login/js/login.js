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

const toggleConfirmacion= document.getElementById("togglePassword-register2");
if (toggleConfirmacion) {
    toggleConfirmacion.addEventListener("click", function () {
        const passwordField = document.getElementById("contraseña3");
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
        document.getElementById("registerFormContainer").style.display = "block";
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
// iniciar sesión
const loginForm = document.querySelector("#loginForm form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localstorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user.role;

        // redirecciones segun los roles aaaaaa saquenme de aquiiiaaaaaa
        if (role === "admin") {
          window.location.href = "/personal/admin/dashboard/dashboard.html";
        } 
        else if (role === "empleado") {
          window.location.href = "/personal/employees/employee-management/employee.html";
        } 
        else {
          window.location.href = "/menu/index.html";
        }

      } else {
        alert(data.message || "Correo o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar sesión.");
    }
  });
}
