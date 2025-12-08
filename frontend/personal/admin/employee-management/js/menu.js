// =========================
// BASE DE API (local vs producción)
// =========================
const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://localhost:3000" // 👈 AJUSTA ESTE PUERTO AL DE TU BACKEND
    : "";

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

function setPreview(src) {
  if (!preview) return;

  if (!src) {
    // Sin imagen -> mostramos ícono
    preview.classList.add("preview-empty");
    preview.removeAttribute("src");
    if (previewIcon) previewIcon.style.display = "block";
    return;
  }

  // Con imagen -> ocultamos ícono y mostramos foto
  preview.classList.remove("preview-empty");
  preview.src = src;
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
    // quitar todo lo que no sea dígito
    let val = inputTelefono.value.replace(/\D/g, "");
    // limitar a 10
    if (val.length > 10) val = val.slice(0, 10);
    inputTelefono.value = val;
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
        // tomamos tanto profile_picture como image_url por compatibilidad
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

    // Construimos la URL final de la foto
    let fotoFinal = "/img/userplaceholder.png";
    if (emp.foto) {
      if (typeof emp.foto === "string" && emp.foto.startsWith("http")) {
        // Cloudinary u otra URL completa
        fotoFinal = emp.foto;
      } else {
        // archivo local guardado con multer
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

  // reconstruimos la preview igual que en la tabla
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
formEmpleado?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  let telefono = inputTelefono.value.trim();
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  // normalizar teléfono a solo dígitos
  telefono = telefono.replace(/\D/g, "");

  if (!nombre || !telefono || !email || !password) {
    alert("Completa todos los campos.");
    return;
  }

  if (telefono.length !== 10) {
    alert("El número de teléfono debe tener exactamente 10 dígitos.");
    inputTelefono.focus();
    return;
  }

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

    fetch(`${API_BASE}/api/users`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
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
        } catch (e) {
          json = {};
        }
        return json;
      })
      .then((nuevo) => {
        console.log("Empleado creado backend:", nuevo);
        alert("Empleado creado correctamente.");
        cerrarModal();
        location.reload();
      })
      .catch((err) => {
        console.error("Error creando empleado:", err);
        alert("Error al crear empleado. Revisa la consola para más detalles.");
      });

    return;
  }

  // Editar
  if (modo === "editar" && empleadoEditandoId !== null) {
    const body = {
      name: nombre,
      telefono: telefono,
      email: email,
    };

    fetch(`${API_BASE}/api/users/${empleadoEditandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
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
        } catch (e) {
          json = {};
        }
        return json;
      })
      .then((actualizado) => {
        console.log("Empleado actualizado backend:", actualizado);
        alert("Empleado actualizado correctamente.");
        cerrarModal();
        location.reload();
      })
      .catch((err) => {
        console.error("Error editando:", err);
        alert("Error al actualizar empleado. Revisa la consola para más detalles.");
      });
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

  // Texto del botón de idioma según localStorage
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
