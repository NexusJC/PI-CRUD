function showToast(message, type = "error") {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.className = "toast"; // reset classes
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

  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value
  };

  try {
    const resp = await fetch("https://www.laparrilaazteca.online/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    
    const result = await resp.json();

    if (resp.ok) {
      showToast("Registro exitoso. Revisa tu correo para confirmar tu cuenta.", "success");
      // opcional: regresar al login
      // document.getElementById("registerFormContainer").style.display = "none";
      // document.getElementById("loginForm").style.display = "block";
    } else {
      showToast(result.error || result.message || "No se pudo registrar.", "error");
    }
  } catch (err) {
    console.error("Error en fetch:", err);
    showToast("Error en el registro.", "error");
  }
});
