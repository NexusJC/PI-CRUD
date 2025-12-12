// ===============================
//     CARGAR DATOS REALES DEL DASHBOARD
// ===============================
async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();

    document.getElementById("topDish").textContent = data.topDish;
    document.getElementById("totalUsers").textContent = data.totalUsers;
    document.getElementById("totalEmployees").textContent = data.totalEmployees;
    document.getElementById("totalAdmins").textContent = data.totalAdmins;
    document.getElementById("totalDishes").textContent = data.totalDishes;

    renderCharts(data);

  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
  }
}

loadDashboardData();


// ===============================
//     GRÁFICAS DEL DASHBOARD
// ===============================
function renderCharts(data) {

  // === Ventas últimos 7 días ===
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const salesLabels = data.salesLast7Days.map(item => item.day);
  const salesValues = data.salesLast7Days.map(item => item.total_sales);

  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: salesLabels,
      datasets: [{
        label: "Ventas (MXN)",
        data: salesValues,
        borderWidth: 3,
        tension: 0.3
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // === Top 5 platillos más vendidos ===
  const topDishesCtx = document.getElementById("topDishesChart").getContext("2d");
  const dishLabels = data.top5Dishes.map(item => item.dish_name);
  const dishValues = data.top5Dishes.map(item => item.total_sold);

  new Chart(topDishesCtx, {
    type: "bar",
    data: {
      labels: dishLabels,
      datasets: [{
        label: "Cantidad vendida",
        data: dishValues,
        borderWidth: 1
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}



// =======================================================
//     SIDEBAR COLAPSABLE
// =======================================================
const toggle = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const main = document.querySelector(".main");

toggle.addEventListener("click", (event) => {
  event.stopPropagation();
  sidebar.classList.toggle("collapsed");
  main.classList.toggle("collapsed");
});

document.addEventListener("click", (event) => {
  const clickInsideSidebar = sidebar.contains(event.target);
  const clickToggle = toggle.contains(event.target);

  if (!clickInsideSidebar && !clickToggle) {
    if (!sidebar.classList.contains("collapsed")) {
      sidebar.classList.add("collapsed");
      main.classList.add("collapsed");
    }
  }
});



// =======================================================
//     MODO OSCURO
// =======================================================
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
});



// =======================================================
//     SIDEBAR ACTIVE + HOVER SYSTEM
// =======================================================
const menuItems = document.querySelectorAll('.sidebar-menu li');
let currentActive = document.querySelector('.sidebar-menu .active');

menuItems.forEach(item => {

  item.addEventListener('mouseenter', () =>
    menuItems.forEach(i => i.classList.remove('hover-active')) || item.classList.add('hover-active')
  );

  item.addEventListener('mouseleave', () => item.classList.remove('hover-active'));

  item.addEventListener('click', () => {
    currentActive?.classList.remove('active');
    item.classList.remove('hover-active');
    item.classList.add('active');
    currentActive = item;
  });
});



// =======================================================
//     SISTEMA DE SESIÓN (VALIDACIÓN + ADMIN + BLOQUEO ATRÁS)
// =======================================================

// Leer usuario del localStorage
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error leyendo usuario:", e);
    return null;
  }
}

// Validar sesión y que sea ADMIN
function ensureSession() {
  const token = localStorage.getItem("token");
  const user  = getCurrentUser();

  if (!token || !user) {
    window.location.replace("/login/login.html");
    return null;
  }

  if (user.role !== "admin") {
    window.location.replace("/login/login.html");
    return null;
  }

  return user;
}

const currentUser = ensureSession();


// Protección avanzada contra botón "Atrás"
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    const token = localStorage.getItem("token");
    const user  = getCurrentUser();

    if (!token || !user || user.role !== "admin") {
      window.location.replace("/login/login.html");
    }
  }
});



// =======================================================
//     LOGOUT PROFESIONAL CON MODAL BONITO
// =======================================================
const logoutBtnDashboard = document.getElementById("logoutBtn");

if (logoutBtnDashboard) {
  logoutBtnDashboard.addEventListener("click", () => {

    const isDark = document.body.classList.contains("dark-mode");

    const modalBg      = isDark ? "#020617" : "#ffffff";
    const modalText    = isDark ? "#e5e7eb" : "#111827";
    const modalShadow  = isDark ? "0 8px 25px rgba(0,0,0,0.65)" : "0 8px 25px rgba(0,0,0,0.25)";

    const cancelBg     = isDark ? "#020617" : "#f9fafb";
    const cancelBorder = isDark ? "#1f2937" : "#e5e7eb";
    const cancelColor  = isDark ? "#e5e7eb" : "#111827";

    const confirmGradient = isDark
      ? "linear-gradient(90deg,#b91c1c,#f97316)"
      : "linear-gradient(90deg,#ef4444,#f97316)";


    const modal = document.createElement("div");
    modal.id = "logoutModalDashboard";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.55)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
      <div style="
        background:${modalBg};
        color:${modalText};
        padding:22px 26px;
        border-radius:14px;
        width:320px;
        text-align:center;
        font-family:Poppins, system-ui, sans-serif;
        box-shadow:${modalShadow};
      ">
        <h3 style="margin-bottom:10px;">Cerrar sesión</h3>
        <p style="margin-bottom:18px;">¿Seguro que deseas cerrar tu sesión?</p>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="cancelLogoutDashboard" style="
            padding:8px 14px;
            border-radius:999px;
            border:1px solid ${cancelBorder};
            background:${cancelBg};
            color:${cancelColor};
            cursor:pointer;
            font-weight:600;
          ">Cancelar</button>

          <button id="confirmLogoutDashboard" style="
            padding:8px 14px;
            border-radius:999px;
            background:${confirmGradient};
            color:white;
            cursor:pointer;
            font-weight:600;
            border:none;
          ">Salir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cancelar
    document.getElementById("cancelLogoutDashboard").onclick = () => modal.remove();

    // Confirmar → logout real
    document.getElementById("confirmLogoutDashboard").onclick = async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch (e) {}

      // limpiar sesión completa
      localStorage.clear();
      sessionStorage.clear();

      modal.remove();

      window.location.replace("/login/login.html");
    };
  });
}
