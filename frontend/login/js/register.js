function showToast(message, type = "error") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.className = "toast";
  toast.classList.add("show");

  if (type === "success") {
    toast.classList.add("success");
  } else {
    toast.classList.add("error");
  }

  // Ocultar después de 3s
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirm = form.password2.value; 

  //valida si son iguales
  if (password !== confirm) {
    showToast("Las contraseñas no coinciden.", "error");
    return; 
  }

  if (password.length < 6) {
    showToast("La contraseña debe tener mínimo 6 caracteres.", "error");
    return;
  }

  const data = { name, email, password };

  try {
    const resp = await fetch("https://www.laparrilaazteca.online/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await resp.json();

    if (resp.ok) {
    showToast("Registro exitoso. Revisa tu correo para confirmar tu cuenta.", "success");
    // Limpiar el formulario
    form.reset();
    // Esperar 2 segundos para que el usuario vea el mensaje
    setTimeout(() => {
        // Redirige al login
        window.location.href = "login.html";
    }, 2000);
}
 else {
      showToast(result.error || result.message || "No se pudo registrar.", "error");
    }
  } catch (err) {
    console.error("Error en fetch:", err);
    showToast("Error en el registro.", "error");
  }
});
