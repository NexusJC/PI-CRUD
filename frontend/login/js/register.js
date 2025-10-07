const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value
  };
  try {
    const resp = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if (resp.ok) {
      alert("Registro exitoso");
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error("Error en fetch:", err);
    alert("Error en el registro");
  }
});
