// =========================
// TOGGLE DEL SIDEBAR
// =========================
const toggle = document.querySelector(".toggle");
const menuDashboard = document.querySelector(".menu-dashboard");
const iconoMenu = toggle?.querySelector("i");
const enlacesMenu = document.querySelectorAll(".menu .enlace");

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

function setPreview(src) {
  if (!preview) return;
  if (!src) {
    preview.classList.add("preview-empty");
    preview.removeAttribute("src");
    return;
  }
  preview.classList.remove("preview-empty");
  preview.src = src;
}

function resetPreview() {
  setPreview(null);
  if (archivoInput) archivoInput.value = "";
}

// ================== CARGAR EMPLEADOS DESDE BACKEND ==================
(function loadEmpleadosInicial() {
  fetch("/api/users")
    .then((res) => {
      if (!res.ok) {
        console.error("Error /api/users:", res.status, res.statusText);
        return [];
      }
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        console.warn("Respuesta inesperada de /api/users:", data);
        return;
      }

      empleados = data.map((emp) => ({
        id: emp.id,
        nombre: emp.name,
        telefono: emp.telefono ?? "-",
        caja: emp.caja ?? "-",
        estado: emp.estado || "activo",
        fechaRegistro: emp.created_at?.split("T")[0] ?? hoyISO(),
        foto: emp.profile_picture
          ? "/uploads/" + emp.profile_picture
          : "/img/userplaceholder.png",
      }));

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
    const fotoFinal = emp.foto || "/img/userplaceholder.png";

    const esActivo = estado === "activo";
    // Texto base SIEMPRE en español; la API de traducción se encarga
    const estadoTexto = esActivo ? "Activo" : "Inactivo";
    const badgeExtraClass = esActivo ? "" : "badge-inactive";

    tr.innerHTML = `
      <td>${emp.id}</td>

      <td>
        <div class="employee-cell">
          <div class="table-img-wrapper">
            <img src="${fotoFinal}" alt="${emp.nombre}">
          </div>
          <span class="table-name">${emp.nombre}</span>
        </div>
      </td>

      <td>${emp.telefono || "-"}</td>
      <td>${emp.caja ?? "-"}</td>

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

  // Texto base en español (Google Translate lo traducirá si hace falta)
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

  inputNombre.value = emp.nombre;
  inputTelefono.value = emp.telefono || "";
  inputEmail.value = emp.email || "";
  inputPassword.value = "";

  if (emp.foto) setPreview(emp.foto);
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
formEmpleado?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  if (!nombre || !telefono || !email || !password) return;

  // Crear
  if (modo === "crear") {
    const formData = new FormData();
    formData.append("name", nombre);
    formData.append("telefono", telefono);
    formData.append("email", email);
    formData.append("password", password);

    if (archivoInput?.files[0]) {
      formData.append("profile_picture", archivoInput.files[0]);
    }

    fetch("/api/users", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        alert("Empleado creado correctamente.");
        cerrarModal();
        location.reload();
      })
      .catch((err) => {
        console.error("Error creando empleado:", err);
        alert("Error al crear empleado");
      });

    return;
  }

  // Editar
  if (modo === "editar" && empleadoEditandoId !== null) {
    const body = {
      name: nombre,
      telefono: telefono,
    };

    fetch(`/api/users/${empleadoEditandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Empleado actualizado correctamente.");
        cerrarModal();
        location.reload();
      })
      .catch((err) => {
        console.error("Error editando:", err);
      });
  }
});

// ================== ELIMINAR ==================
btnEliminarEmpleado?.addEventListener("click", () => {
  if (empleadoEditandoId === null) return;

  const msg = "¿Seguro que deseas eliminar este empleado?";

  if (!confirm(msg)) return;

  fetch(`/api/users/${empleadoEditandoId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then(() => {
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
// (independiente, pero visual igual al de Add Dishes)
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

  // 🔹 SOLO sincronizamos el texto del botón de idioma con el idioma guardado.
  // La traducción real la maneja translate.js usando la API.
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

  // Si cambia preferredLanguage (otra pestaña, etc) actualizamos texto
  window.addEventListener("storage", (e) => {
    if (e.key === "preferredLanguage") {
      syncFlagLabel();
    }
  });
});
