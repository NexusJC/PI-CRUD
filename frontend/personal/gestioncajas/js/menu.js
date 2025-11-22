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
// ===========================================
//       REDIRECCIONES ENTRE SECCIONES
// ===========================================

document.querySelectorAll(".menu .enlace").forEach(enlace => {
    const texto = enlace.innerText.trim().toLowerCase();

    if (texto === "empleados") {
        enlace.addEventListener("click", () => {
            window.location.href = "/personal/employees/employee.html";
        });
    }

    if (texto === "cajas") {
        enlace.addEventListener("click", () => {
            window.location.href = "/personal/gestioncajas/gestioncajas.html";
        });
    }

    if (texto === "dashboard") {
        enlace.addEventListener("click", () => {
            window.location.href = "../personal/admin/admin.html";
        });
    }

    if (texto === "usuarios") {
        enlace.addEventListener("click", () => {
            window.location.href = "../personal/admin/users/users.html";
        });
    }

    if (texto === "pedidos") {
        enlace.addEventListener("click", () => {
            window.location.href = "../personal/admin/orders/pedidos.html";
        });
    }

    if (texto === "configuración") {
        enlace.addEventListener("click", () => {
            window.location.href = "../personal/admin/settings/settings.html";
        });
    }
});



/* =========================
   GESTIÓN DE CAJAS (REAL BD)
========================= */

// Si estas en local:
const API_URL = "http://localhost:3000/api/cajas";
// Si estas en Railway luego lo cambiamos.

const contenedorCajas = document.getElementById("contenedorCajas");
const formCaja = document.getElementById("formCaja");
const filtroEstadoCaja = document.getElementById("filtroEstadoCaja");

const empleadoCaja = document.getElementById("empleadoCaja");
const estadoCaja = document.getElementById("estadoCaja");

// Cargar cajas desde la BD
async function cargarCajas() {
  try {
    const res = await fetch(API_URL);
    const cajas = await res.json();
    renderizarCajas(cajas);
  } catch (err) {
    console.error("Error al cargar cajas:", err);
  }
}

// Pintar tarjetas
function renderizarCajas(cajas) {
  contenedorCajas.innerHTML = "";
  const filtro = filtroEstadoCaja.value;

  cajas.forEach(caja => {
    if (filtro !== "todas" && caja.estado !== filtro) return;

    const div = document.createElement("div");
    div.classList.add("tarjeta-caja");

    div.innerHTML = `
      <i class='bx bx-store icono-caja'></i>
      <h3>Caja ${caja.id}</h3>
      <p class="empleado-asignado">${caja.nombres}</p>
      <div class="caja-estado caja-estado--${caja.estado}">
        ${caja.estado === "activo" ? "Activa" : "Inactiva"}
      </div>
    `;

    contenedorCajas.appendChild(div);
  });
}

// Guardar caja nueva
formCaja?.addEventListener("submit", async e => {
  e.preventDefault();

  const nombres = empleadoCaja.value;
  const estado = estadoCaja.value;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombres, estado })
    });

    cerrarModalCaja();
    cargarCajas();
  } catch (err) {
    console.error("Error al crear caja:", err);
  }
});

// Filtro
filtroEstadoCaja?.addEventListener("change", cargarCajas);

// Iniciar
cargarCajas();
