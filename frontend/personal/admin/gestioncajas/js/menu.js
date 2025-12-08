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
   MODO OSCURO DASHBOARD (admin)
   ========================= */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle?.querySelector("i");
const themeText = themeToggle?.querySelector("span");

function applySavedAdminTheme() {
  const saved = localStorage.getItem("admin-theme");
  const isDark = saved === "dark";

  document.body.classList.toggle("admin-dark", isDark);

  if (themeIcon && themeText) {
    if (isDark) {
      if (themeIcon.classList.contains("bx-moon")) {
        themeIcon.classList.replace("bx-moon", "bx-sun");
      }
      themeText.textContent = "Modo claro";
    } else {
      if (themeIcon.classList.contains("bx-sun")) {
        themeIcon.classList.replace("bx-sun", "bx-moon");
      }
      themeText.textContent = "Modo oscuro";
    }
  }
}

// Aplicar tema guardado al cargar
applySavedAdminTheme();

themeToggle?.addEventListener("click", () => {
  const nowDark = !document.body.classList.contains("admin-dark");
  document.body.classList.toggle("admin-dark", nowDark);
  localStorage.setItem("admin-theme", nowDark ? "dark" : "light");

  if (themeIcon && themeText) {
    if (nowDark) {
      if (themeIcon.classList.contains("bx-moon")) {
        themeIcon.classList.replace("bx-moon", "bx-sun");
      }
      themeText.textContent = "Modo claro";
    } else {
      if (themeIcon.classList.contains("bx-sun")) {
        themeIcon.classList.replace("bx-sun", "bx-moon");
      }
      themeText.textContent = "Modo oscuro";
    }
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
    try {
        const res = await fetch("/api/users");

        if (!res.ok) {
            console.error("Error en la API de empleados:", res.status);
            empleadoCaja.innerHTML = `<option disabled selected>No disponible</option>`;
            return [];
        }

        const empleados = await res.json();

        if (!Array.isArray(empleados)) {
            console.error("La API no devolvió un array:", empleados);
            empleadoCaja.innerHTML = `<option disabled selected>No disponible</option>`;
            return [];
        }

        empleadoCaja.innerHTML = `<option disabled selected>Seleccionar empleado</option>`;

        empleados.forEach(emp => {
            const op = document.createElement("option");
            op.value = emp.id;
            op.textContent = emp.name;
            empleadoCaja.appendChild(op);
        });

        return empleados;

    } catch (error) {
        console.error("Error cargando empleados:", error);
        empleadoCaja.innerHTML = `<option disabled selected>Error al cargar</option>`;
        return [];
    }
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
        
      <button class="btn-eliminar-caja" onclick="confirmarEliminarCaja(${caja.id})">
        <i class='bx bx-trash'></i> Eliminar
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
function confirmarEliminarCaja(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta caja?\nEsta acción no se puede deshacer.");

    if (confirmar) {
        eliminarCaja(id);
    }
}
async function eliminarCaja(id) {
    try {
        const res = await fetch(`/api/cajas/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.success) {
            await cargarCajas();
        } else {
            alert("Error al eliminar la caja.");
        }
    } catch (error) {
        console.error("Error eliminando la caja:", error);
    }
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
/* =========================
   TRADUCTOR DEL SIDEBAR (usa translate.js)
   ========================= */
const translateBtn = document.getElementById("translateToggle");

const getCurrentLanguage = () =>
  localStorage.getItem("preferredLanguage") ||
  document.documentElement.lang ||
  "es";

const updateTranslateButtonLabel = (lang) => {
  if (!translateBtn) return;
  const span = translateBtn.querySelector("span");
  if (!span) return;

  // Cuando está en ES → muestra "Traducir"
  // Cuando está en EN → muestra "Español"
  span.textContent = lang === "en" ? "Español" : "Traducir";
};

// Estado inicial del texto del botón
updateTranslateButtonLabel(getCurrentLanguage());

async function handleSidebarTranslateToggle() {
  try {
    if (typeof window.translateContent !== "function") {
      console.warn("translateContent no está disponible todavía.");
      return;
    }

    const current = getCurrentLanguage();
    const target = current === "es" ? "en" : "es";

    await window.translateContent(target);

    localStorage.setItem("preferredLanguage", target);
    document.documentElement.lang = target;
    updateTranslateButtonLabel(target);
  } catch (err) {
    console.error("Error al alternar idioma en Gestión de Cajas:", err);
    alert("No se pudo cambiar el idioma en este momento.");
  }
}

translateBtn?.addEventListener("click", () => {
  handleSidebarTranslateToggle();
});

// Si el usuario tenía guardado inglés, lo aplicamos al cargar
document.addEventListener("DOMContentLoaded", async () => {
  const savedLang = getCurrentLanguage();
  if (savedLang === "en" && typeof window.translateContent === "function") {
    try {
      await window.translateContent("en");
      updateTranslateButtonLabel("en");
    } catch (e) {
      console.error("No se pudo aplicar el idioma guardado:", e);
    }
  }
});
