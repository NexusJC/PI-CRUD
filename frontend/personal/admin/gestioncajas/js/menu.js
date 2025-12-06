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

/* =============================
   GESTIÓN DE CAJAS — DINÁMICO
=============================*/

// Referencias
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

let cajas = [];
let numeroSiguienteCaja = 1;

/* =============================
   CARGAR EMPLEADOS (desde BACKEND)
=============================*/
async function cargarEmpleados() {
    const res = await fetch("/api/users?role=empleado");
    const empleados = await res.json();

    empleadoCaja.innerHTML = `<option disabled selected>Seleccionar empleado</option>`;

    empleados.forEach(emp => {
        const op = document.createElement("option");
        op.value = emp.id;
        op.textContent = emp.name;
        empleadoCaja.appendChild(op);
    });
}

/* =============================
   CARGAR CAJAS DESDE EL SERVIDOR
=============================*/
async function cargarCajas() {
    const res = await fetch("/api/cajas");
    cajas = await res.json();

    // Sacar siguiente número disponible
    numeroSiguienteCaja = cajas.length > 0
        ? Math.max(...cajas.map(c => c.numero_caja)) + 1
        : 1;

    renderCajas();
}

/* =============================
   MOSTRAR CAJAS
=============================*/
function renderCajas() {
    contenedorCajas.innerHTML = "";
    const filtro = filtroEstadoCaja.value;

    cajas.forEach(caja => {
        if (filtro !== "todas" && caja.estado !== filtro) return;

        const div = document.createElement("div");
        div.classList.add("tarjeta-caja");

        div.innerHTML = `
    <i class='bx bx-store icono-caja'></i>

    <h3>Caja ${caja.numero_caja}</h3>

    <p class="empleado-asignado">${caja.empleado_nombre || "Sin empleado asignado"}</p>

    <div class="caja-estado caja-estado--${caja.estado}">
        ${caja.estado === "activa" ? "Activa" : "Inactiva"}
    </div>

    <button class="btn-editar-caja" onclick="editarCaja(${caja.id})">
        <i class='bx bx-edit'></i> Editar
    </button>
`;


        contenedorCajas.appendChild(div);
    });
}

/* =============================
   ABRIR / CERRAR MODAL
=============================*/
function abrirModalCaja() {
    numCaja.value = numeroSiguienteCaja;
    cargarEmpleados();
    modalCaja.classList.add("activa");
    overlayCaja.classList.add("activa");
}

function cerrarModalCaja() {
    modalCaja.classList.remove("activa");
    overlayCaja.classList.remove("activa");
    formCaja.reset();
    cajaEditando = null;
}


btnAbrirModalCaja.onclick = abrirModalCaja;
btnCerrarModalCaja.onclick = cerrarModalCaja;
btnCancelarCaja.onclick = cerrarModalCaja;
overlayCaja.onclick = e => { if (e.target === overlayCaja) cerrarModalCaja(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModalCaja(); });

/* =============================
   GUARDAR CAJA EN BACKEND
=============================*/
formCaja.addEventListener("submit", async e => {
    e.preventDefault();

    const datosCaja = {
        numero_caja: numCaja.value,
        empleado_id: empleadoCaja.value === "Seleccionar empleado" ? null : empleadoCaja.value,
        estado: estadoCaja.value
    };

    let url = "/api/cajas";
    let method = "POST";

    // Si estamos editando, usar PUT
    if (cajaEditando) {
        url = `/api/cajas/${cajaEditando.id}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCaja)
    });

    const data = await res.json();

    if (data.success) {
        cerrarModalCaja();
        cajaEditando = null;
        await cargarCajas();
    }
});


/* =============================
   FILTRO
=============================*/
filtroEstadoCaja.onchange = renderCajas;

/* =============================
   INICIAR
=============================*/
cargarCajas();


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
let cajaEditando = null;

async function editarCaja(id) {
    // Buscar caja por ID
    cajaEditando = cajas.find(c => c.id === id);

    if (!cajaEditando) return;

    // Cargar empleados en el select
    await cargarEmpleados();

    // Rellenar datos actuales
    numCaja.value = cajaEditando.numero_caja;
    empleadoCaja.value = cajaEditando.empleado_id || "";
    estadoCaja.value = cajaEditando.estado;

    // Abrir modal
    modalCaja.classList.add("activa");
    overlayCaja.classList.add("activa");
}
