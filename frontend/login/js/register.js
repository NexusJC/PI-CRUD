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
      alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      // opcional: regresar al login
      // document.getElementById("registerFormContainer").style.display = "none";
      // document.getElementById("loginForm").style.display = "block";
    } else {
      alert("Error: " + (result.error || result.message || "No se pudo registrar."));
    }
  } catch (err) {
    console.error("Error en fetch:", err);
    alert("Error en el registro.");
  }
});
