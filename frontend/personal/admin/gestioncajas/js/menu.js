/* =========================
   SIDEBAR (idéntico empleados)
========================= */
const toggle = document.querySelector(".toggle");
const menuDashboard = document.querySelector(".menu-dashboard");
const iconoMenu = toggle?.querySelector("i");

toggle?.addEventListener("click", () => {
  menuDashboard.classList.toggle("open");

  if (iconoMenu?.classList.contains("bx-menu")) {
    iconoMenu.classList.replace("bx-menu", "bx-x");
  } else {
    iconoMenu?.classList.replace("bx-x", "bx-menu");
  }
});

/* =========================
   GESTIÓN DE CAJAS
========================= */
let cajas = [];
let idCaja = 1;

const empleadosDemo = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "Maria Lopez" },
  { id: 3, nombre: "Carlos Ruiz" }
];

const contenedorCajas = document.getElementById("contenedorCajas");
const btnAbrirModalCaja = document.getElementById("btnAbrirModalCaja");
const overlayCaja = document.getElementById("overlayCaja");
const modalCaja = document.getElementById("modalCaja");
const btnCerrarModalCaja = document.getElementById("btnCerrarModalCaja");
const btnCancelarCaja = document.getElementById("btnCancelarCaja");

const formCaja = document.getElementById("formCaja");
const numCaja = document.getElementById("numCaja");
const empleadoCaja = document.getElementById("empleadoCaja");
const estadoCaja = document.getElementById("estadoCaja");
const filtroEstadoCaja = document.getElementById("filtroEstadoCaja");

function cargarEmpleados() {
  empleadoCaja.innerHTML = `<option disabled selected>Seleccionar empleado</option>`;
  empleadosDemo.forEach(emp => {
    let op = document.createElement("option");
    op.value = emp.id;
    op.textContent = emp.nombre;
    empleadoCaja.appendChild(op);
  });
}

function abrirModalCaja() {
  numCaja.value = idCaja;
  cargarEmpleados();
  modalCaja.classList.add("activa");
  overlayCaja.classList.add("activa");
}

function cerrarModalCaja() {
  modalCaja.classList.remove("activa");
  overlayCaja.classList.remove("activa");
  formCaja.reset();
}

btnAbrirModalCaja?.addEventListener("click", abrirModalCaja);
btnCerrarModalCaja?.addEventListener("click", cerrarModalCaja);
btnCancelarCaja?.addEventListener("click", cerrarModalCaja);
overlayCaja?.addEventListener("click", e => {
  if (e.target === overlayCaja) cerrarModalCaja();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModalCaja();
});

/* ===== RENDER ===== */
function renderCajas() {
  contenedorCajas.innerHTML = "";

  const filtro = filtroEstadoCaja.value;

  cajas.forEach(caja => {
    if (filtro !== "todas" && caja.estado !== filtro) return;

    const div = document.createElement("div");
    div.classList.add("tarjeta-caja");

    div.innerHTML = `
      <i class='bx bx-store icono-caja'></i>
      <h3>Caja ${caja.numero}</h3>
      <p class="empleado-asignado">${caja.empleadoNombre}</p>
      <div class="caja-estado caja-estado--${caja.estado}">
        ${caja.estado === "activa" ? "Activa" : "Inactiva"}
      </div>
    `;

    contenedorCajas.appendChild(div);
  });
}

/* ===== GUARDAR ===== */
formCaja?.addEventListener("submit", e => {
  e.preventDefault();

  const empleadoId = empleadoCaja.value;
  const empleadoNombre = empleadosDemo.find(e => e.id == empleadoId)?.nombre;

  cajas.push({
    numero: idCaja++,
    empleadoId,
    empleadoNombre,
    estado: estadoCaja.value
  });

  renderCajas();
  cerrarModalCaja();
});

/* ===== FILTRO ===== */
filtroEstadoCaja?.addEventListener("change", renderCajas);

/* ===== Inicial ===== */
renderCajas();

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
