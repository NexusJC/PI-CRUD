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

enlacesMenu.forEach(enlace => {
  enlace.addEventListener("click", () => {
    menuDashboard.classList.add("open");
    iconoMenu?.classList.replace("bx-menu", "bx-x");
  });
});
// =========================
// GESTIÓN EMPLEADOS
// =========================

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

// Imagen
const tabArchivo = document.getElementById("tabArchivo");
const contArchivo = document.getElementById("contenedorArchivo");
const archivoInput = document.getElementById("archivoEmpleado");
const preview = document.getElementById("previewImagen");
const zonaImagen = document.getElementById("zonaImagen");

// Datos en memoria (simulación, luego se reemplaza con BD)
let empleados = [];
// =====================================
// CARGAR EMPLEADOS REALES DESDE BACKEND
// =====================================
fetch("/api/auth/users")
  .then(res => res.json())
  .then(data => {
    console.log("Empleados desde BD:", data);

    // Normalizar los datos según la tabla
    empleados = data.map(emp => ({
        id: emp.id,
        nombre: emp.name,
        telefono: emp.telefono ?? "-",
        caja: emp.caja ?? "-",
        estado: "activo",        // Ajusta si luego tienes columna estado
        fechaRegistro: emp.created_at?.split("T")[0] ?? "",
        foto: emp.profile_picture 
              ? "/uploads/" + emp.profile_picture
              : "https://via.placeholder.com/80/FFE1C8/000000?text=EMP"
    }));

    renderEmpleados();
  })
  .catch(err => {
    console.error("Error cargando empleados:", err);
  });

let idCounter = 1;
let modo = "crear";           // "crear" | "editar"
let empleadoEditandoId = null;

// =========================
// UTILIDADES
// =========================

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

// =========================
// MODAL
// =========================

function abrirModalCrear() {
  modo = "crear";
  empleadoEditandoId = null;

  modalTitulo.textContent = "Crear empleado";
  formEmpleado.reset();
  resetPreview();

  btnEliminarEmpleado.classList.add("oculto");

  overlay.classList.add("activa");
  modal.classList.add("activa");
  modal.setAttribute("aria-hidden", "false");
}

function abrirModalEditar(id) {
  const emp = empleados.find(e => e.id === id);
  if (!emp) return;

  modo = "editar";
  empleadoEditandoId = id;

  modalTitulo.textContent = "Editar empleado";
  inputNombre.value = emp.nombre;
  inputTelefono.value = emp.telefono || "";

  if (emp.foto) setPreview(emp.foto);
  else resetPreview();

  btnEliminarEmpleado.classList.remove("oculto");

  overlay.classList.add("activa");
  modal.classList.add("activa");
  modal.setAttribute("aria-hidden", "false");
}

function cerrarModal() {
  overlay.classList.remove("activa");
  modal.classList.remove("activa");
  modal.setAttribute("aria-hidden", "true");
}

// =========================
// RENDER TABLA
// =========================

function renderEmpleados() {
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtro = filtroEstado?.value || "todos";

  empleados.forEach(emp => {
    const estado = emp.estado || "activo";
    if (filtro !== "todos" && estado !== filtro) return;

    const tr = document.createElement("tr");
    const fotoFinal = emp.foto || "https://via.placeholder.com/80/FFE1C8/000000?text=EMP";

    const esActivo = estado === "activo";
    const bolitaClase = esActivo ? "bolita-verde" : "bolita-roja";
    const estadoTextoClase = esActivo ? "estado-activo" : "estado-inactivo";
    const estadoTexto = esActivo ? "Activo" : "Inactivo";

    tr.innerHTML = `
      <td class="foto-empleado">
        <img src="${fotoFinal}" alt="${emp.nombre}">
        <span>${emp.nombre}</span>
      </td>

      <td>${emp.telefono || "-"}</td>

      <td>${emp.caja ?? "-"}</td>

      <td>
        <span class="estado-pill">
          <span class="bolita ${bolitaClase}"></span>
          <span class="${estadoTextoClase}">${estadoTexto}</span>
        </span>
      </td>

      <td>${emp.fechaRegistro || ""}</td>

      <td style="text-align:right;">
        <button class="btn-accion btn-editar" data-id="${emp.id}">
          <i class='bx bx-edit'></i>
          Editar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =========================
// IMAGEN (SUBIR / DRAG & DROP)
// =========================

archivoInput?.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setPreview(url);
  } else {
    resetPreview();
  }
});

zonaImagen?.addEventListener("dragover", e => {
  e.preventDefault();
  zonaImagen.classList.add("arrastrando");
});

zonaImagen?.addEventListener("dragleave", () => {
  zonaImagen.classList.remove("arrastrando");
});

zonaImagen?.addEventListener("drop", e => {
  e.preventDefault();
  zonaImagen.classList.remove("arrastrando");
  const file = e.dataTransfer.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setPreview(url);
  }
});

// =========================
// EVENTOS GENERALES
// =========================

btnNuevoEmpleado?.addEventListener("click", abrirModalCrear);

btnCerrarModal?.addEventListener("click", cerrarModal);
btnCancelarModal?.addEventListener("click", cerrarModal);

overlay?.addEventListener("click", e => {
  if (e.target === overlay) cerrarModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModal();
});

// Click en botón Editar dentro de la tabla
tbody?.addEventListener("click", e => {
  const btn = e.target.closest(".btn-editar");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (!Number.isInteger(id)) return;
  abrirModalEditar(id);
});

// Guardar (crear / editar)
formEmpleado?.addEventListener("submit", e => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();

  if (!nombre || !telefono) return;

  let fotoFinal = null;
  if (archivoInput?.files[0]) {
    fotoFinal = URL.createObjectURL(archivoInput.files[0]);
  }

  if (modo === "crear") {
  alert("Esta función no está conectada todavía al backend.");
  return;
}

   else if (modo === "editar" && empleadoEditandoId !== null) {
    const idx = empleados.findIndex(e => e.id === empleadoEditandoId);
    if (idx !== -1) {
      empleados[idx].nombre = nombre;
      empleados[idx].telefono = telefono;
      if (fotoFinal) {
        empleados[idx].foto = fotoFinal;
      }
    }
  }

  renderEmpleados();
  cerrarModal();
});

// Eliminar empleado
btnEliminarEmpleado?.addEventListener("click", () => {
  if (empleadoEditandoId === null) return;
  const conf = confirm("¿Seguro que deseas eliminar este empleado?");
  if (!conf) return;

  empleados = empleados.filter(e => e.id !== empleadoEditandoId);
  empleadoEditandoId = null;
  renderEmpleados();
  cerrarModal();
});

// Filtro estado
filtroEstado?.addEventListener("change", renderEmpleados);

// Inicial
renderEmpleados();

// =========================
// SESIÓN / LOGOUT (MISMO QUE EN INDEX)
// =========================
function getLoginUrl() {
    const isLocal =
        location.hostname === "127.0.0.1" ||
        location.hostname === "localhost";

    if (isLocal) {
        return "../../../login/login.html";
    }

    return "/login/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserImg = document.getElementById("sidebarUserImg");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!token || !user || user.role !== "admin") {
    window.location.href = getLoginUrl();
}

if (user && sidebarUserName) {
    sidebarUserName.textContent = user.name || "Usuario";
    if (user.profile_picture) {
        sidebarUserImg.src = "/uploads/" + user.profile_picture;
    }
}

logoutBtn?.addEventListener("click", () => {
    const confirmar = confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirmar) return;

    localStorage.clear();
    window.location.href = getLoginUrl();
});
