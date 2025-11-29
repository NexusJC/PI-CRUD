
    // Funcionalidad para cambiar imagen de perfil
    document.getElementById('btnEditarImg').addEventListener('click', function() {
      document.getElementById('inputImg').click();
    });

    document.getElementById('inputImg').addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('perfilImg').src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    // Funcionalidad para editar nombre
    document.getElementById('btnEditarNombre').addEventListener('click', function() {
      const nombreInput = document.getElementById('perfilNombreText');
      if (nombreInput.readOnly) {
        nombreInput.readOnly = false;
        nombreInput.focus();
        nombreInput.style.backgroundColor = '#f9f9f9';
      } else {
        nombreInput.readOnly = true;
        nombreInput.style.backgroundColor = 'transparent';
      }
    });

    // Funcionalidad para editar número de teléfono
    document.getElementById('btnEditarNumero').addEventListener('click', function() {
      const emailInput = document.getElementById('perfilNumeroText');
      if (emailInput.readOnly) {
        emailInput.readOnly = false;
        emailInput.focus();
        emailInput.style.backgroundColor = '#f9f9f9';
      } else {
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = 'transparent';
      }
    });


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
