/* ==========================================================
   ALERTA EMERGENTE BONITA (success/error)
========================================================== */
function showAlert(message, type = "success") {
  const alertBox = document.getElementById("alertBox");
  const alertMessage = document.getElementById("alertMessage");

  alertMessage.textContent = message;

  alertBox.className = "alert " + type;
  alertBox.classList.remove("hidden");

  setTimeout(() => alertBox.classList.add("show"), 10);

  setTimeout(() => {
    alertBox.classList.remove("show");
    setTimeout(() => alertBox.classList.add("hidden"), 300);
  }, 2500);
}

/* ==========================================================
   LÓGICA ORIGINAL DEL PERFIL
========================================================== */

const token = localStorage.getItem("token");

if (!token) {
  showAlert("No estás autenticado. Inicia sesión de nuevo.", "error");
  window.location.href = "../login/login.html";
}

const inputNombre = document.getElementById("perfilNombreText");
const inputNumero = document.getElementById("perfilNumeroText");
const spanEmail   = document.getElementById("perfilEmail");
const imgPerfil   = document.getElementById("perfilImg");

// Máximo de dígitos permitidos
const MAX_PHONE_LENGTH = 10;

inputNumero.addEventListener("input", () => {
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
      showAlert("Tu sesión ha expirado. Inicia sesión de nuevo.", "error");
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

      if (data.image_url) {
        imgPerfil.src = data.image_url;
      } else if (data.profile_picture) {
        imgPerfil.src = `https://www.laparrilaazteca.online/uploads/${data.profile_picture}`;
      } else {
        imgPerfil.src = "../img/default.png";
      }

      /* ================================
         ACTUALIZAR LOCALSTORAGE AQUÍ
      ================================= */
      let user = JSON.parse(localStorage.getItem("user") || "null");

      if (user) {
        if (data.image_url) {
          user.image_url = data.image_url;
          if (data.profile_picture) user.profile_picture = data.profile_picture;

        } else if (data.profile_picture) {
          user.profile_picture = data.profile_picture;
          user.image_url = `https://www.laparrilaazteca.online/uploads/${data.profile_picture}`;
        }

        localStorage.setItem("user", JSON.stringify(user));

        const sidebarAvatar = document.getElementById("sidebarAvatar");
        if (sidebarAvatar) {
          sidebarAvatar.src =
            user.image_url ||
            (user.profile_picture
              ? `https://www.laparrilaazteca.online/uploads/${user.profile_picture}`
              : sidebarAvatar.src
            );
        }
      }

    } else {
      showAlert(data.message || "No se pudo obtener el perfil", "error");
    }

  } catch (error) {
    console.error("Error al obtener datos del perfil", error);
    showAlert("Error al obtener datos del perfil", "error");
  }
};

window.addEventListener("load", getProfileData);


/* ==========================================================
   GUARDAR CAMBIOS
========================================================== */
document.getElementById("guardarCambios").addEventListener("click", async () => {
  let name = inputNombre.value.trim();
  let telefono = inputNumero.value.trim();
  const generoInput = document.querySelector('input[name="genero"]:checked');
  const gender = generoInput ? generoInput.value : null;

  if (!name) {
    showAlert("El nombre es obligatorio.", "error");
    return;
  }

  if (telefono.length !== MAX_PHONE_LENGTH) {
    showAlert(`El número debe tener exactamente ${MAX_PHONE_LENGTH} dígitos.`, "error");
    return;
  }

  if (telefono === "") telefono = null;

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
      showAlert(result.message || "Perfil actualizado correctamente", "success");
      getProfileData();
    } else {
      showAlert(result.message || "Error al actualizar el perfil", "error");
    }

  } catch (error) {
    console.error("Error al enviar los cambios:", error);
    showAlert("Error al enviar los cambios", "error");
  }
});


/* ==========================================================
   SUBIR IMAGEN DE PERFIL
========================================================== */
document.getElementById("btnEditarImg").addEventListener("click", () => {
  document.getElementById("inputImg").click();
});

document.getElementById("inputImg").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profile", file);

  try {
    const response = await fetch(
      "https://www.laparrilaazteca.online/api/profile/upload-profile",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const result = await response.json();

    if (response.ok) {
      const newUrl = `https://www.laparrilaazteca.online/uploads/${result.image}`;

      imgPerfil.src = newUrl;

      let user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        user.profile_picture = result.image;
        user.image_url = newUrl;
        localStorage.setItem("user", JSON.stringify(user));
      }

      const sidebarAvatar = document.getElementById("sidebarAvatar");
      if (sidebarAvatar) sidebarAvatar.src = newUrl;

      showAlert(result.message || "Foto actualizada correctamente", "success");
    } else {
      showAlert(result.message || "Error al subir la imagen", "error");
    }

  } catch (error) {
    console.error("Error al subir imagen", error);
    showAlert("Error al subir la imagen", "error");
  }
});