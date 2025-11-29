const registerForm = document.getElementById("registerForm");

// Agregar un evento para cuando se envíe el formulario
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  // Obtener los valores de las contraseñas
  const password = registerForm.password.value;
  const confirmPassword = registerForm.password_confirmation.value;

  // Validar si las contraseñas coinciden
  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return; 
  }

  // Si las contraseñas coinciden, crear el objeto con los datos del formulario
  const data = {
    name: registerForm.name.value,
    email: registerForm.email.value,
    password: registerForm.password.value,
    confirmPassword: registerForm.password_confirmation.value // Enviar ambas contraseñas
  };

  // Enviar los datos al backend
  try {
    const resp = await fetch("https://www.laparrilaazteca.online/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await resp.json();

    if (resp.ok) {
      alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
    } else {
      alert("Error: " + (result.error || result.message || "No se pudo registrar."));
    }
  } catch (err) {
    console.error("Error en fetch:", err);
    alert("Error en el registro.");
  }
});

// Código para mostrar/ocultar la contraseña en el registro
document.getElementById("togglePassword-register").addEventListener("click", function () {
  const password = document.getElementById("contraseña2");
  const type = password.type === "password" ? "text" : "password";
  password.type = type;
});

document.getElementById("togglePassword-register2").addEventListener("click", function () {
  const password = document.getElementById("contraseña3");
  const type = password.type === "password" ? "text" : "password";
  password.type = type;
});
