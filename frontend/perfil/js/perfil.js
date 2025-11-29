  const token = localStorage.getItem("token");

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const file = e.target.profile.files[0];
    formData.append("profile", file);

    const response = await fetch("/api/profile/upload-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById("preview").src = `/uploads/${result.image}`;
  });

  // frontend/perfil/js/perfil.js

document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/profile", {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const userData = await response.json();
    // Cargar los datos en el formulario
    document.getElementById('perfilNombreText').value = userData.name;
    document.getElementById('perfilTelefonoText').value = userData.phone;
    document.querySelector(`input[name="genero"][value="${userData.gender}"]`).checked = true;
    document.getElementById('perfilImg').src = `/uploads/${userData.profile_picture}`;
  }
});

document.getElementById("guardarCambiosBtn").addEventListener("click", async function () {
  const name = document.getElementById("perfilNombreText").value;
  const phone = document.getElementById("perfilTelefonoText").value;
  const gender = document.querySelector('input[name="genero"]:checked').value;

  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ name, phone, gender }),
  });

  const updatedUser = await response.json();
  alert(updatedUser.message);
});

// Subir imagen de perfil
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();
  const file = e.target.profile.files[0];
  formData.append("profile", file);

  const response = await fetch("/api/profile/upload-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  alert(result.message);
  document.getElementById("perfilImg").src = `/uploads/${result.image}`;
});
