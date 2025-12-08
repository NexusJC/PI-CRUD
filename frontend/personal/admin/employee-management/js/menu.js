// =========================
// BASE DE API (local vs producción)
// =========================
const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://localhost:3000" // 👈 AJUSTA ESTE PUERTO AL DE TU BACKEND
    : "";

// ===============================
// CLOUDINARY CONFIG (igual que en perfil)
// ===============================
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

  if (!res.ok) {
    console.error("Error subiendo a Cloudinary:", await res.text());
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
}

// =========================
// TOGGLE DEL SIDEBAR
// =========================
const toggle = document.querySelector(".toggle");
const menuDashboard = document.querySelector(".menu-dashboard");
const iconoMenu = toggle?.querySelector("i");
const enlacesMenu = document.querySelectorAll(".menu .enlace");

console.log("API_BASE employees:", API_BASE);

toggle?.addEventListener("click", () => {
  menuDashboard.classList.toggle("open");

  if (iconoMenu?.classList.contains("bx-menu")) {
    iconoMenu.classList.replace("bx-menu", "bx-x");
  } else {
    iconoMenu?.classList.replace("bx-x", "bx-menu");
  }
});

enlacesMenu.forEach((enlace) => {
  enlace.addEventListener("click", () => {
    menuDashboard.classList.add("open");
    iconoMenu?.classList.replace("bx-menu", "bx-x");
  });
});

// ===================================================
// GESTIÓN EMPLEADOS (fetch / modal / CRUD)
// ===================================================

// Elementos tabla / controles
const tbody = document.getElementById("tbodyEmpleados");
const filtroEstado = document.getElementById("filtroEstado");
const btnNuevoEmpleado = document.getElementById("btnNuevoEmpleado");

// Modal
const overlay = document.getElementById("overlayEmpleado");
const modal = document.getElementById("modalEmpleado");
const modalTitulo = document.getElementById("modalTitulo");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnCancelarModal = document.getElementById("btnCancelarModal");
const btnEliminarEmpleado = document.getElementById("btnEliminarEmpleado");

// Formulario
const formEmpleado = document.getElementById("formEmpleado");
const inputNombre = document.getElementById("nombreEmpleado");
const inputTelefono = document.getElementById("telefonoEmpleado");
const inputEmail = document.getElementById("emailEmpleado");
const inputPassword = document.getElementById("passwordEmpleado");

// Imagen
const archivoInput = document.getElementById("archivoEmpleado");
const preview = document.getElementById("previewImagen");
const previewIcon = document.getElementById("previewIcon");
const zonaImagen = document.getElementById("zonaImagen");

// Datos
let empleados = [];
let modo = "crear";
let empleadoEditandoId = null;

// Helpers
function hoyISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ==========================
// PREVIEW DE IMAGEN EN EL CÍRCULO
// ==========================
function setPreview(src) {
  if (!preview) return;

  if (!src) {
    // Sin imagen -> mostramos ícono y ocultamos img
    preview.classList.add("preview-empty");
    preview.removeAttribute("src");
    preview.style.display = "none";
    if (previewIcon) previewIcon.style.display = "block";
    return;
  }

  // Con imagen -> mostramos img y ocultamos ícono
  preview.classList.remove("preview-empty");
  preview.src = src;
  preview.style.display = "block";
  preview.style.width = "100%";
  preview.style.height = "100%";
  preview.style.objectFit = "cover";
  preview.style.borderRadius = "50%";
  if (previewIcon) previewIcon.style.display = "none";
}

function resetPreview() {
  setPreview(null);
  if (archivoInput) archivoInput.value = "";
}

// ==========================
// SOLO NÚMEROS Y 10 DÍGITOS EN TELÉFONO
// ==========================
if (inputTelefono) {
  inputTelefono.addEventListener("input", () => {
    let val = inputTelefono.value.replace(/\D/g, "");
    if (val.length > 10) val = val.slice(0, 10);
    inputTelefono.value = val;
  });
}

// ==========================
// SOLO LETRAS (SIN NÚMEROS) Y MÁX 50 CARACTERES EN NOMBRE
// ==========================
if (inputNombre) {
  inputNombre.addEventListener("input", () => {
    let val = inputNombre.value;

    // Permitimos: letras (con acentos y ñ) + espacios
    val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

    // Limitar a 50 caracteres
    if (val.length > 50) {
      val = val.slice(0, 50);
    }

    inputNombre.value = val;
  });
}

// ================== CARGAR EMPLEADOS DESDE BACKEND ==================
(function loadEmpleadosInicial() {
  fetch(`${API_BASE}/api/users`)
    .then((res) => {
      if (!res.ok) {
        console.error("Error /api/users:", res.status, res.statusText);
        return [];
      }
      return res.json();
    })
    .then((data) => {
      console.log("Respuesta cruda /api/users:", data);
      if (!Array.isArray(data)) {
        console.warn("Respuesta inesperada de /api/users (no es array):", data);
        return;
      }

      empleados = data.map((emp) => {
        const rawFoto = emp.profile_picture ?? emp.image_url ?? "";

        const normalizado = {
          id: emp.id,
          nombre: emp.name ?? emp.nombre ?? "",
          telefono:
            emp.telefono ??
            emp.phone ??
            emp.numero_telefono ??
            emp.phone_number ??
            "",
          caja:
            emp.caja ??
            emp.box ??
            emp.box_name ??
            emp.nombre_caja ??
            "",
          estado:
            emp.estado ??
            emp.status ??
            (emp.is_active === 0 || emp.is_active === false
              ? "inactivo"
              : "activo"),
          fechaRegistro: emp.created_at?.split("T")[0] ?? hoyISO(),
          foto: rawFoto,
          email: emp.email ?? emp.correo ?? ""
        };
        return normalizado;
      });

      console.log("Empleados normalizados:", empleados);
      renderEmpleados();
    })
    .catch((err) => {
      console.error("Error cargando empleados:", err);
    });
})();

// ================== RENDER TABLA ==================
function renderEmpleados() {
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtro = filtroEstado?.value || "todos";

  empleados.forEach((emp) => {
    const estado = emp.estado || "activo";
    if (filtro !== "todos" && estado !== filtro) return;

    const tr = document.createElement("tr");

    let fotoFinal = "/img/userplaceholder.png";
    if (emp.foto) {
      if (typeof emp.foto === "string" && emp.foto.startsWith("http")) {
        // URL absoluta (Cloudinary, etc.)
        fotoFinal = emp.foto;
      } else {
        // Nombre de archivo local
        fotoFinal = `/uploads/${emp.foto}`;
      }
    }

    const esActivo = estado === "activo";
    const estadoTexto = esActivo ? "Activo" : "Inactivo";
    const badgeExtraClass = esActivo ? "" : "badge-inactive";

    tr.innerHTML = `
      <td>${emp.id ?? ""}</td>

      <td>
        <div class="employee-cell">
          <div class="table-img-wrapper">
            <img src="${fotoFinal}" alt="${emp.nombre || ""}">
          </div>
          <span class="table-name">${emp.nombre || ""}</span>
        </div>
      </td>

      <td>${emp.telefono || "-"}</td>
      <td>${emp.caja || "-"}</td>

      <td>
        <span class="badge badge-status ${badgeExtraClass}">
          ${estadoTexto}
        </span>
      </td>

      <td>${emp.fechaRegistro || ""}</td>

      <td class="table-actions">
        <button class="btn-icon btn-edit btn-editar" data-id="${emp.id}">
          <i class='bx bx-edit'></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ================== MODAL ==================
function abrirModalCrear() {
  modo = "crear";
  empleadoEditandoId = null;

  modalTitulo.textContent = "Crear empleado";

  formEmpleado.reset();
  resetPreview();

  btnEliminarEmpleado.style.display = "none";

  overlay.style.display = "block";
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

function abrirModalEditar(id) {
  const emp = empleados.find((e) => e.id === id);
  if (!emp) return;

  modo = "editar";
  empleadoEditandoId = id;

  modalTitulo.textContent = "Editar empleado";

  inputNombre.value = emp.nombre || "";
  inputTelefono.value = (emp.telefono || "").toString();
  inputEmail.value = emp.email || "";
  inputPassword.value = "";

  let fotoPreview = null;
  if (emp.foto) {
    fotoPreview =
      typeof emp.foto === "string" && emp.foto.startsWith("http")
        ? emp.foto
        : `/uploads/${emp.foto}`;
  }

  if (fotoPreview) setPreview(fotoPreview);
  else resetPreview();

  btnEliminarEmpleado.style.display = "inline-flex";

  overlay.style.display = "block";
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

function cerrarModal() {
  overlay.style.display = "none";
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

// Eventos modal
btnNuevoEmpleado?.addEventListener("click", abrirModalCrear);
btnCerrarModal?.addEventListener("click", cerrarModal);
btnCancelarModal?.addEventListener("click", cerrarModal);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) cerrarModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

// Imagen (click / drag & drop)
archivoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setPreview(url);
  } else {
    resetPreview();
  }
});

zonaImagen?.addEventListener("dragover", (e) => {
  e.preventDefault();
});

zonaImagen?.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setPreview(url);
  }
});

// Click en botón Editar dentro de la tabla
tbody?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-editar");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (!Number.isInteger(id)) return;
  abrirModalEditar(id);
});

// ================== GUARDAR (crear / editar) ==================
async function uploadImageToCloudinary(file) {
  const CLOUD_NAME = "dwwaxrr6r";
  const UPLOAD_PRESET = "unsigned_preset";

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

formEmpleado?.addEventListener("submit", async (e) => {
  e.preventDefault();

  let nombre = inputNombre.value.trim();
  let telefono = inputTelefono.value.trim();
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  telefono = telefono.replace(/\D/g, "");
  nombre = nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

  if (!nombre || !telefono || !email || !password) {
    alert("Completa todos los campos.");
    return;
  }

  if (nombre.length > 50) {
    alert("El nombre no puede tener más de 50 caracteres.");
    inputNombre.focus();
    return;
  }

  if (/\d/.test(nombre)) {
    alert("El nombre no puede contener números.");
    inputNombre.focus();
    return;
  }

  if (telefono.length !== 10) {
    alert("El número de teléfono debe tener exactamente 10 dígitos.");
    inputTelefono.focus();
    return;
  }

  // ============== CREAR EMPLEADO ==============
  if (modo === "crear") {
    try {
      // 1️⃣ Subir imagen (si hay) a Cloudinary
      let imageUrl = null;
      if (archivoInput?.files[0]) {
        imageUrl = await uploadToCloudinary(archivoInput.files[0]);
      }

      // 2️⃣ Enviar datos al backend, incluyendo image_url
      const payload = {
        name: nombre,
        telefono,
        email,
        password,
        image_url: imageUrl, // puede ser null si no seleccionó foto
      };

      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error(
          "Respuesta POST /api/users no OK:",
          res.status,
          res.statusText,
          text
        );
        throw new Error(
          `Error POST /api/users: ${res.status} ${res.statusText}`
        );
      }

      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      console.log("Empleado creado backend:", json);
      alert("Empleado creado correctamente.");
      cerrarModal();
      // Recargamos para que la tabla vuelva a pedir /api/users
      location.reload();
    } catch (err) {
      console.error("Error creando empleado:", err);
      alert("Error al crear empleado. Revisa la consola para más detalles.");
    }

    return;
  }

  // ============== EDITAR EMPLEADO (SIN CAMBIAR FOTO POR AHORA) ==============
  if (modo === "editar" && empleadoEditandoId !== null) {
    const body = {
      name: nombre,
      telefono: telefono,
      email: email,
      // Si más adelante quieres permitir editar la foto,
      // aquí podrías hacer otra subida a Cloudinary y mandar image_url también.
    };

    try {
      const res = await fetch(`${API_BASE}/api/users/${empleadoEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error(
          `Respuesta PUT /api/users/${empleadoEditandoId} no OK:`,
          res.status,
          res.statusText,
          text
        );
        throw new Error(
          `Error PUT /api/users/${empleadoEditandoId}: ${res.status} ${res.statusText}`
        );
      }

      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      console.log("Empleado actualizado backend:", json);
      alert("Empleado actualizado correctamente.");
      cerrarModal();
      location.reload();
    } catch (err) {
      console.error("Error editando:", err);
      alert(
        "Error al actualizar empleado. Revisa la consola para más detalles."
      );
    }
  }
});

// ================== ELIMINAR ==================
btnEliminarEmpleado?.addEventListener("click", () => {
  if (empleadoEditandoId === null) return;

  const msg = "¿Seguro que deseas eliminar este empleado?";

  if (!confirm(msg)) return;

  fetch(`${API_BASE}/api/users/${empleadoEditandoId}`, { method: "DELETE" })
    .then(async (res) => {
      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error(
          `Respuesta DELETE /api/users/${empleadoEditandoId} no OK:`,
          res.status,
          res.statusText,
          text
        );
        throw new Error(
          `Error DELETE /api/users/${empleadoEditandoId}: ${res.status} ${res.statusText}`
        );
      }
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        json = {};
      }
      return json;
    })
    .then((resp) => {
      console.log("Empleado eliminado backend:", resp);
      alert("Empleado eliminado correctamente.");
      cerrarModal();
      location.reload();
    })
    .catch((err) => console.error("Error al eliminar:", err));
});

// Filtro por estado
filtroEstado?.addEventListener("change", renderEmpleados);

// =========================
// MOSTRAR / OCULTAR CONTRASEÑA
// =========================
const togglePass = document.getElementById("togglePass");

if (togglePass && inputPassword) {
  togglePass.addEventListener("click", () => {
    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      togglePass.classList.replace("bx-hide", "bx-show");
    } else {
      inputPassword.type = "password";
      togglePass.classList.replace("bx-show", "bx-hide");
    }
  });
}

// ===================================================
// MODO OSCURO LOCAL PARA EMPLEADOS
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("adminThemeToggle");
  const icon = themeToggle?.querySelector("i");
  const text = themeToggle?.querySelector("span");

  const savedTheme = localStorage.getItem("admin-theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
    if (icon) icon.classList.replace("bx-moon", "bx-sun");
    if (text) text.textContent = "Modo claro";
  }

  themeToggle?.addEventListener("click", () => {
    const nowDark = document.body.classList.toggle("admin-dark");
    localStorage.setItem("admin-theme", nowDark ? "dark" : "light");

    if (!icon || !text) return;
    if (nowDark) {
      icon.classList.replace("bx-moon", "bx-sun");
      text.textContent = "Modo claro";
    } else {
      icon.classList.replace("bx-sun", "bx-moon");
      text.textContent = "Modo oscuro";
    }
  });

  const langBtn = document.getElementById("banderaIdioma");
  const flagSpan = langBtn?.querySelector(".bandera-container");

  function syncFlagLabel() {
    const lang = localStorage.getItem("preferredLanguage") || "es";
    if (!flagSpan) return;
    flagSpan.setAttribute(
      "data-idioma-text",
      lang === "es" ? "English" : "Español"
    );
  }

  syncFlagLabel();

  window.addEventListener("storage", (e) => {
    if (e.key === "preferredLanguage") {
      syncFlagLabel();
    }
  });
});

// =========================
// SESIÓN / LOGOUT ADMIN (fusionado)
// =========================
function getLoginUrl() {
  const isLocal =
    location.hostname === "127.0.0.1" ||
    location.hostname === "localhost";

  // misma ruta que usas en index/admin
  return isLocal ? "../../../login/login.html" : "/login/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

// Leer user de localStorage de forma segura
function readCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parseando user de localStorage:", e);
    return null;
  }
}

// Verificar que exista sesión de admin
function ensureAdminSession() {
  const token = localStorage.getItem("token");
  const user = readCurrentUser();

  if (!token || !user || user.role !== "admin") {
    // replace para que el botón "atrás" no vuelva a esta página
    window.location.replace(getLoginUrl());
    return null;
  }

  return user;
}

// 🔒 Comprobación inicial al cargar la página
const currentUser = ensureAdminSession();

// Pintar datos del usuario en el sidebar
if (currentUser && sidebarUserName) {
  sidebarUserName.textContent = currentUser.name || "Usuario";

  if (currentUser.profile_picture && sidebarUserImg) {
    // misma lógica que en el index/admin
    sidebarUserImg.src = "/uploads/" + currentUser.profile_picture;
  }
}

// 🔁 Proteger también al usar el botón "atrás" del navegador (bfcache)
window.addEventListener("pageshow", (event) => {
  // event.persisted === true → viene del caché del navegador
  if (event.persisted) {
    const token = localStorage.getItem("token");
    const user = readCurrentUser();

    if (!token || !user || user.role !== "admin") {
      window.location.replace(getLoginUrl());
    }
  }
});

// =========================
// LOGOUT ADMIN CON MODAL BONITO (CLARO / OSCURO)
// =========================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("admin-dark");

    const modalBg      = isDark ? "#020617" : "#ffffff";   // fondo tarjeta
    const modalText    = isDark ? "#e5e7eb" : "#111827";   // texto principal
    const modalShadow  = isDark ? "0 8px 25px rgba(0,0,0,0.65)" : "0 8px 25px rgba(0,0,0,0.25)";

    const cancelBg     = isDark ? "#020617" : "#f9fafb";
    const cancelBorder = isDark ? "#1f2937" : "#e5e7eb";
    const cancelColor  = isDark ? "#e5e7eb" : "#111827";

    const confirmGradient = isDark
      ? "linear-gradient(90deg,#b91c1c,#f97316)"
      : "linear-gradient(90deg,#ef4444,#f97316)";

    const confirmShadow = isDark
      ? "0 0 0 rgba(0,0,0,0)"   // sin sombra extra en oscuro
      : "0 4px 12px rgba(0,0,0,0.25)";

    // Crear overlay del modal
    const modal = document.createElement("div");
    modal.id = "logoutConfirmModal";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.55)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
      <div style="
        background: ${modalBg};
        color: ${modalText};
        padding: 22px 26px;
        border-radius: 14px;
        width: 320px;
        text-align: center;
        font-family: Poppins, system-ui, sans-serif;
        box-shadow: ${modalShadow};
      ">
        <h3 style="margin: 0 0 10px; font-size: 1.1rem; font-weight: 700;">
          Cerrar sesión
        </h3>
        <p style="margin: 0 0 18px; font-size: 0.92rem;">
          ¿Seguro que deseas cerrar tu sesión?
        </p>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="cancelLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid ${cancelBorder};
            background: ${cancelBg};
            cursor: pointer;
            font-weight: 600;
            color: ${cancelColor};
          ">Cancelar</button>

          <button id="confirmLogout" style="
            padding: 8px 14px;
            border-radius: 999px;
            background: ${confirmGradient};
            color:#fff;
            border: none;
            cursor: pointer;
            font-weight: 600;
            box-shadow: ${confirmShadow};
          ">Salir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // ❌ Cancelar → solo cerrar modal
    document.getElementById("cancelLogout").onclick = () => {
      modal.remove();
    };

    // ✅ Confirmar → limpiar sesión + redirigir
    document.getElementById("confirmLogout").onclick = () => {
      // Limpieza completa de localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("preferredLanguage");
      localStorage.removeItem("admin-theme");
      localStorage.removeItem("admin-sidebar-open");

      const box = modal.querySelector("div");
      if (box) {
        box.innerHTML = `
          <p style="font-size:1rem; margin-bottom:12px; color:${modalText};">
            Cerrando sesión...
          </p>
        `;
      }

      setTimeout(() => {
        // replace para que el botón atrás no recupere esta página
        window.location.replace(getLoginUrl());
      }, 500);
    };
  });
}
