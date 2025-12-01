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


// Obtener los datos del perfil del usuario
const getProfileData = async () => {
  const token = localStorage.getItem("token"); // Obtenemos el token desde localStorage
  if (!token) {
    alert("No estás autenticado");
    return;
  }

  try {
    const response = await fetch("/api/profile/get-profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`  // Enviamos el token para autenticar la solicitud
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      // Rellenamos los campos con los datos obtenidos
      document.getElementById("perfilNombreText").value = data.name;
      document.getElementById("perfilNumeroText").value = data.telefono;
      document.getElementById("perfilEmail").textContent = data.email;

      // Rellenar género
      if (data.gender === "masculino") {
        document.getElementById("masculino").checked = true;
      } else {
        document.getElementById("femenino").checked = true;
      }

      // Rellenar imagen de perfil
      document.getElementById("perfilImg").src = `/uploads/${data.profile_picture}`;
    } else {
      alert("No se pudo obtener el perfil");
    }
  } catch (error) {
    console.error("Error al obtener datos del perfil", error);
    alert("Error al obtener datos del perfil");
  }
};
window.onload = getProfileData;

// Llamamos a la función para cargar los datos al cargar la página
getProfileData();


// Enviar los datos actualizados del perfil
document.getElementById("guardarCambios").addEventListener("click", async () => {
  const name = document.getElementById("perfilNombreText").value;
  const telefono = document.getElementById("perfilNumeroText").value;
  const genero = document.querySelector('input[name="genero"]:checked').value;
  const token = localStorage.getItem("token");

  if (!name || !telefono) {
    alert("Nombre y teléfono son obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/profile/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Enviar el token para autenticar la solicitud
      },
      body: JSON.stringify({ name, telefono, gender: genero }) // Enviar los datos modificados
    });

    const result = await response.json();
    if (response.ok) {
      alert("Perfil actualizado correctamente");
      getProfileData(); // Volver a cargar los datos después de la actualización
    } else {
      alert(result.message || "Error al actualizar el perfil");
    }
  } catch (error) {
    console.error("Error al enviar los cambios:", error);
    alert("Error al enviar los cambios");
  }
});


// Subir nueva foto de perfil
document.getElementById("btnEditarImg").addEventListener("click", () => {
  document.getElementById("inputImg").click(); // Abre el selector de archivo
});

document.getElementById("inputImg").addEventListener("change", async (e) => {
  const token = localStorage.getItem("token"); // Obtener el token desde localStorage
  const file = e.target.files[0];  // Obtener el archivo seleccionado

  if (!file) {
    alert("No se seleccionó ninguna imagen.");
    return;
  }

  const formData = new FormData();
  formData.append("profile", file); // Agregar la imagen al formulario

  try {
    const response = await fetch("/api/profile/upload-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}` // Enviar el token para autenticar la solicitud
      },
      body: formData
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById("perfilImg").src = `/uploads/${result.image}`; // Actualizar la imagen en el perfil
  } catch (error) {
    console.error("Error al subir la imagen", error);
    alert("Error al subir la imagen");
  }
});