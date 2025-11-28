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
    goToRegister.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerFormContainer").style.display = "block";
    });
}

const goToLogin = document.getElementById("goToLogin");
if (goToLogin) {
    goToLogin.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("registerFormContainer").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
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
      const response = await fetch("https://www.laparrilaazteca.online/api/auth/login", {
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

        // redirecciones segun los roles
        if (role === "admin") {
          window.location.href = "/personal/admin/dashboard/dashboard.html";
        } 
        else if (role === "empleado") {
          window.location.href = "/personal/employees/carousel/carousel.html";
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
