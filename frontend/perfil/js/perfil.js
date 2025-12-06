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
  let data = null;

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

    data = await response.json();

    if (response.ok) {
      inputNombre.value = data.name || "";
      inputNumero.value = data.telefono || "";
      spanEmail.textContent = data.email || "";

      if (data.gender === "masculino") document.getElementById("masculino").checked = true;
      if (data.gender === "femenino") document.getElementById("femenino").checked = true;

      if (data.image_url) {
        imgPerfil.src = data.image_url;
      } else if (data.profile_picture) {
        imgPerfil.src = `https://www.laparrilaazteca.online/uploads/${data.profile_picture}`;
      } else {
        imgPerfil.src = "../img/default.png";
      }
    }

  } catch (error) {
    console.error("Error al obtener datos del perfil", error);
  }

  // Guardar en localStorage
  if (data) {
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    user.image_url = data.image_url || null;
    user.profile_picture = data.profile_picture || null;
    localStorage.setItem("user", JSON.stringify(user));

    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar && user.image_url) sidebarAvatar.src = user.image_url;
  }
};

window.addEventListener("load", getProfileData);

document.getElementById("guardarCambios").addEventListener("click", async () => {
  let name = inputNombre.value.trim();
  let telefono = inputNumero.value.trim();
  const generoInput = document.querySelector('input[name="genero"]:checked');
  const gender = generoInput ? generoInput.value : null;

  if (!name) return showAlert("El nombre es obligatorio.", "error");
  if (telefono.length !== MAX_PHONE_LENGTH)
    return showAlert("El número debe tener exactamente 10 dígitos.", "error");

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
      showAlert("Perfil actualizado correctamente");
      getProfileData();
    } else {
      showAlert(result.message || "Error al actualizar", "error");
    }

  } catch (error) {
    console.error(error);
  }
});

const CLOUD_NAME = "TU_CLOUD_NAME";
const UPLOAD_PRESET = "TU_UPLOAD_PRESET";

async function uploadImageToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd
  });

  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  return data.secure_url;
}

document.getElementById("btnEditarImg").addEventListener("click", () => {
  document.getElementById("inputImg").click();
});

document.getElementById("inputImg").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const secureUrl = await uploadImageToCloudinary(file);

    imgPerfil.src = secureUrl;

    const response = await fetch(
      "https://www.laparrilaazteca.online/api/profile/update-image",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url: secureUrl }),
      }
    );

    const result = await response.json();
    if (!response.ok) return showAlert(result.message, "error");

    let user = JSON.parse(localStorage.getItem("user"));
    user.image_url = secureUrl;
    user.profile_picture = null;
    localStorage.setItem("user", JSON.stringify(user));

    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar) sidebarAvatar.src = secureUrl;

    showAlert("Imagen actualizada correctamente");

  } catch (error) {
    console.error(error);
    showAlert("Error subiendo imagen", "error");
  }
});
