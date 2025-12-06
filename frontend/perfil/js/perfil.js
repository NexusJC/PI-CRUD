const token = localStorage.getItem("token");


if (!token) {
  alert("No estás autenticado. Inicia sesión de nuevo.");
  window.location.href = "../login/login.html";
}

const inputNombre = document.getElementById("perfilNombreText");
const inputNumero = document.getElementById("perfilNumeroText");
const spanEmail   = document.getElementById("perfilEmail");
const imgPerfil   = document.getElementById("perfilImg");

// Máximo de dígitos permitidos
const MAX_PHONE_LENGTH = 10;

inputNumero.addEventListener("input", () => {
  // quitar todo lo que no sea número
  inputNumero.value = inputNumero.value.replace(/\D/g, "");

  if (inputNumero.value.length > MAX_PHONE_LENGTH) {
    inputNumero.value = inputNumero.value.slice(0, MAX_PHONE_LENGTH);
  }
});

document.getElementById("btnEditarNombre").addEventListener("click", () => {
  inputNombre.readOnly = !inputNombre.readOnly;
  if (!inputNombre.readOnly) inputNombre.focus();
});

document.getElementById("btnEditarNumero").addEventListener("click", () => {
  inputNumero.readOnly = !inputNumero.readOnly;
  if (!inputNumero.readOnly) inputNumero.focus();
});


const getProfileData = async () => {
  try {
    const response = await fetch(
      "https://www.laparrilaazteca.online/api/profile/get-profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      alert("Tu sesión ha expirado. Inicia sesión de nuevo.");
      window.location.href = "../login/login.html";
      return;
    }

    const data = await response.json();

    if (response.ok) {

      inputNombre.value = data.name || "";
      inputNumero.value = data.telefono || "";


      spanEmail.textContent = data.email || "";

      if (data.gender === "masculino") {
        document.getElementById("masculino").checked = true;
      } else if (data.gender === "femenino") {
        document.getElementById("femenino").checked = true;
      }

      imgPerfil.src = data.profile_picture
        ? `/uploads/${data.profile_picture}`
        : "../img/default.png";
    } else {
      alert(data.message || "No se pudo obtener el perfil");
    }
  } catch (error) {
    console.error("Error al obtener datos del perfil", error);
    alert("Error al obtener datos del perfil");
  }
};

window.addEventListener("load", getProfileData);

document
  .getElementById("guardarCambios")
  .addEventListener("click", async () => {
    let name = inputNombre.value.trim();
    let telefono = inputNumero.value.trim();
    const generoInput = document.querySelector('input[name="genero"]:checked');
    const gender = generoInput ? generoInput.value : null;
    
    if (!name) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (telefono.length !== MAX_PHONE_LENGTH) {
      alert(`El número debe tener exactamente ${MAX_PHONE_LENGTH} dígitos.`);
      return;
    }

    if (telefono === "") {
      telefono = null;
    }

    try {
      const response = await fetch(
        "https://www.laparrilaazteca.online/api/profile/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, telefono, gender }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Perfil actualizado correctamente");
        // Volvemos a leer desde la BD para tener los datos frescos
        getProfileData();
      } else {
        alert(result.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al enviar los cambios:", error);
      alert("Error al enviar los cambios");
    }
  });

document.getElementById("btnEditarImg").addEventListener("click", () => {
  document.getElementById("inputImg").click();
});

document.getElementById("inputImg").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append("profile", file);

  try {
    const response = await fetch(
      "https://www.laparrilaazteca.online/api/profile/upload-profile",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (response.ok) {
      imgPerfil.src = `/uploads/${result.image}`;
      alert(result.message || "Foto actualizada correctamente");
    } else {
      alert(result.message || "Error al subir la imagen");
    }
  } catch (error) {
    console.error("Error al subir imagen", error);
    alert("Error al subir la imagen");
  }
});