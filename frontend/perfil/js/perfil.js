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

/* ===============================
   CLOUDINARY CONFIG
==================================*/
const CLOUD_NAME = "dwwaxrr6r";
const UPLOAD_PRESET = "unsigned_preset";

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: fd,
    }
  );

  const data = await res.json();
  return data.secure_url;
}

/* ===============================
   VARIABLES
==================================*/
const token = localStorage.getItem("token");

// 🔒 Si no hay token y entran directo, se manda al login
if (!token) {
  alert("No estás autenticado. Inicia sesión de nuevo.");
  window.location.href = "../login/login.html";
}

// 🧠 Al regresar con el botón ATRÁS, volvemos a checar el token
// y también si hay una bandera de logout en sessionStorage.
// Si ya se cerró sesión, siempre mandamos al login.
window.addEventListener("pageshow", (event) => {
  const currentToken = localStorage.getItem("token");
  const logoutFlag =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("logout")
      : null;

  if (!currentToken || logoutFlag === "1") {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("logout");
    }
    window.location.replace("../login/login.html");
  }
});

const inputNombre = document.getElementById("perfilNombreText");
const inputNumero = document.getElementById("perfilNumeroText");
const spanEmail = document.getElementById("perfilEmail");
const imgPerfil = document.getElementById("perfilImg");

// Máximo de dígitos permitidos
const MAX_PHONE_LENGTH = 10;

/* ===============================
   VALIDACIÓN NÚMERO
==================================*/
inputNumero.addEventListener("input", () => {
  inputNumero.value = inputNumero.value.replace(/\D/g, "");

  if (inputNumero.value.length > MAX_PHONE_LENGTH) {
    inputNumero.value = inputNumero.value.slice(0, MAX_PHONE_LENGTH);
  }
});

/* ===============================
   BOTONES DE EDICIÓN
==================================*/
document
  .getElementById("btnEditarNombre")
  .addEventListener("click", () => {
    inputNombre.readOnly = !inputNombre.readOnly;
    if (!inputNombre.readOnly) inputNombre.focus();
  });

document
  .getElementById("btnEditarNumero")
  .addEventListener("click", () => {
    inputNumero.readOnly = !inputNumero.readOnly;
    if (!inputNumero.readOnly) inputNumero.focus();
  });

/* ===============================
   OBTENER PERFIL DEL BACKEND
==================================*/
const getProfileData = async () => {
  try {
    const response = await fetch(
      "https://www.laparrilaazteca.online/api/profile/get-profile",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      showAlert("Tu sesión expiró, inicia sesión.", "error");
      window.location.href = "../login/login.html";
      return;
    }

    const data = await response.json();

    // Llenar inputs
    inputNombre.value = data.name || "";
    inputNumero.value = data.telefono || "";
    spanEmail.textContent = data.email || "";

    if (data.gender === "masculino") {
      document.getElementById("masculino").checked = true;
    } else if (data.gender === "femenino") {
      document.getElementById("femenino").checked = true;
    }

    // FOTO (solo Cloudinary ya)
    const finalImg = data.image_url || "../img/default.png";
    imgPerfil.src = finalImg;

    // Guardar en localStorage
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    user.name = data.name || user.name;
    user.image_url = finalImg;
    localStorage.setItem("user", JSON.stringify(user));

    // Sidebar avatar
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar) sidebarAvatar.src = finalImg;
  } catch (error) {
    console.error("Error al obtener datos del perfil", error);
    alert("Error al obtener datos del perfil");
  }
};

window.addEventListener("load", getProfileData);

/* ===============================
   GUARDAR CAMBIOS DEL PERFIL
==================================*/
document
  .getElementById("guardarCambios")
  .addEventListener("click", async () => {
    let name = inputNombre.value.trim();
    let telefono = inputNumero.value.trim();
    const generoInput = document.querySelector(
      'input[name="genero"]:checked'
    );
    const gender = generoInput ? generoInput.value : null;

    if (!name) {
      showAlert("El nombre es obligatorio.", "error");
      return;
    }

    if (telefono.length !== MAX_PHONE_LENGTH) {
      showAlert(
        "El número debe tener exactamente 10 dígitos.",
        "error"
      );
      return;
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
        showAlert("Perfil actualizado correctamente", "success");
        getProfileData();
      } else {
        showAlert(
          result.message || "Error al actualizar",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al enviar los cambios:", error);
      showAlert("Error al actualizar", "error");
    }
  });

/* ===============================
   SUBIR FOTO A CLOUDINARY
==================================*/
document
  .getElementById("btnEditarImg")
  .addEventListener("click", () => {
    document.getElementById("inputImg").click();
  });

document
  .getElementById("inputImg")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 1️⃣ Subir a Cloudinary
      const cloudUrl = await uploadToCloudinary(file);

      // 2️⃣ Guardar URL en backend
      const response = await fetch(
        "https://www.laparrilaazteca.online/api/profile/update-profile-image",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image_url: cloudUrl }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showAlert(
          result.message || "Error al actualizar imagen",
          "error"
        );
        return;
      }

      // 3️⃣ Actualizar UI
      imgPerfil.src = cloudUrl;

      const sidebarAvatar = document.getElementById("sidebarAvatar");
      if (sidebarAvatar) sidebarAvatar.src = cloudUrl;

      // 4️⃣ Guardar localmente
      let user = JSON.parse(localStorage.getItem("user") || "{}");
      user.image_url = cloudUrl;
      localStorage.setItem("user", JSON.stringify(user));

      showAlert("Foto actualizada correctamente", "success");
    } catch (error) {
      console.error("Error al actualizar la imagen:", error);
      showAlert("Error al actualizar la imagen", "error");
    }
  });

const btnReset = document.getElementById("btnRestablecer");

btnReset.addEventListener("click", () => {
  showConfirmCustom(
    "¿Deseas continuar y cambiar tu contraseña?",
    () => {
      setTimeout(() => {
        window.location.href = "#";
      }, 800);
    }
  );
});

function showConfirmCustom(message, onYes, onNo) {
  const overlay = document.createElement("div");
  overlay.className = "custom-confirm-overlay";

  overlay.innerHTML = `
    <div class="custom-confirm-box">
      <h3>${message}</h3>
      <div class="confirm-btn-row">
        <button class="confirm-btn confirm-no">Cancelar</button>
        <button class="confirm-btn confirm-yes">Sí, continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay
    .querySelector(".confirm-no")
    .addEventListener("click", () => {
      overlay.remove();
      if (onNo) onNo();
    });

  overlay
    .querySelector(".confirm-yes")
    .addEventListener("click", () => {
      overlay.remove();
      onYes();
    });
}

/* ===============================
   LOGOUT PERFIL (CORREGIDO)
==================================*/

// Helper para cerrar sesión y evitar volver con "atrás"
function handleLogoutRedirect() {
  localStorage.clear();

  if (typeof sessionStorage !== "undefined") {
    // Marcamos que hubo logout para que cualquier "back" fuerce login
    sessionStorage.setItem("logout", "1");
  }

  // replace quita esta página del historial, así que "Atrás" ya no vuelve aquí
  window.location.replace("../login/login.html");
}

const btnLogoutPerfil = document.getElementById("btn-logout");

if (btnLogoutPerfil) {
  btnLogoutPerfil.addEventListener("click", (e) => {
    e.preventDefault();

    showConfirmCustom(
      "¿Seguro que quieres cerrar sesión?",
      () => {
        handleLogoutRedirect();
      }
    );
  });
}
