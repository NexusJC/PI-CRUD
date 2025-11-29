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

  document.getElementById('btnEditarNombre').addEventListener('click', async () => {
  const nombre = document.getElementById('perfilNombreText').value;
  const telefono = document.getElementById('perfilNumeroText').value;
  
  const response = await fetch('/api/profile/update-profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: nombre, telefono: telefono })
  });

  const result = await response.json();
  alert(result.message); // Mensaje de éxito
});