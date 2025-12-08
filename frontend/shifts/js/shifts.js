/*************************************************
 *  SIDEBAR, SESIÓN, ROLES, MODO OSCURO (igual)
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList = document.getElementById("menuList");

  /* === ABRIR / CERRAR SIDEBAR === */
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
  });

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active") &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove("active");
      toggle.textContent = "☰";
    }
  });

  /* === SESIÓN === */
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    btnLogin.style.display = "none";
    btnLogout.style.display = "block";
  } else {
    btnLogin.style.display = "block";
    btnLogout.style.display = "none";
    menuList.innerHTML = `
      <li data-no-translate>
        <a href="/menu/index.html" data-no-translate>
          <i class="fas fa-utensils"></i> <span>Menú</span>
        </a>
      </li>`;
    return;
  }

  const sidebarAvatar = document.getElementById("sidebarAvatar");
  if (sidebarAvatar && user) {
    let avatarUrl = user.image_url || user.profile_picture;
    if (avatarUrl) {
      if (avatarUrl.includes("cloudinary")) {
        sidebarAvatar.src = avatarUrl;
      } else if (!avatarUrl.startsWith("http")) {
        sidebarAvatar.src = `https://www.laparrilaazteca.online/uploads/${avatarUrl}`;
      } else {
        sidebarAvatar.src = avatarUrl;
      }
    }
  }

  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");

  if (sidebarUserName && sidebarUserInfo) {
    sidebarUserName.textContent = "Bienvenido";
    sidebarUserInfo.textContent = user.name || "¡Explora el menú!";
  }


  /* === MENÚ POR ROL === */
  if (user.role === "usuario") {
    menuList.innerHTML = `
      <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> <span>Ver Menú</span></a></li>
      <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> <span>Mi Perfil</span></a></li>
      <li><a href="/shifts/shifts.html"><i class="fas fa-clock"></i> <span>Turnos</span></a></li>`;
  }

  if (user.role === "admin") {
    menuList.innerHTML = `
      <li><a href="/personal/admin/dashboard/dashboard.html"><i class="fas fa-gauge"></i> Dashboard</a></li>
      <li><a href="/personal/admin/add-dishes/add_dishes.html"><i class="fas fa-pizza-slice"></i> Platillos</a></li>
      <li><a href="/personal/admin/employee-management/employee.html"><i class="fas fa-users"></i> Empleados</a></li>
      <li><a href="/personal/admin/gestioncajas/gestioncajas.html"><i class="fas fa-cash-register"></i> Cajas</a></li>`;
  }

  /* === MODO OSCURO === */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      updateThemeButton(true);
    }

    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateThemeButton(isDark);
    });

    function updateThemeButton(isDark) {
      const icon = themeToggle.querySelector("i");
      const text = themeToggle.querySelector("span");
      if (isDark) {
        icon.classList.replace("fa-moon", "fa-sun");
        text.textContent = "Modo claro";
      } else {
        icon.classList.replace("fa-sun", "fa-moon");
        text.textContent = "Modo oscuro";
      }
    }
  }
});

/*************************************************
 *                SISTEMA DE TURNOS
 *************************************************/

/* === CARGAR DESDE API === */
async function cargarTurnos() {
  try {
    const res = await fetch("https://www.laparrilaazteca.online/api/orders/all");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos)) return;

    const enProceso = pedidos.filter(t => t.status === "en_proceso");
    const pendientesYProceso = pedidos.filter(
      t => t.status === "pendiente" || t.status === "en_proceso"
    );

    renderTurnoActual(enProceso);
    renderListaTurnos(pendientesYProceso);

  } catch (err) {
    console.warn("⚠ Error cargando turnos:", err);
  }
}

/*************************************************
 *      PANEL DERECHO — TURNO ACTUAL (GRANDE)
 *************************************************/
function renderTurnoActual(lista) {
  const cont = document.getElementById("turnosActuales");
  const nombre = document.getElementById("nombreUsuarioActual");

  cont.innerHTML = "";
  nombre.textContent = "—";

  if (lista.length === 0) {
    cont.innerHTML = `<p style="text-align:center; color:#888;">No hay pedidos en proceso</p>`;
    return;
  }

  const t = lista[0]; // solo el primero en proceso

  cont.innerHTML = `
    <div class="turno-contenedor">
      <span>${t.order_number}</span>
      <span>${t.caja_id ?? "—"}</span>
    </div>
  `;

  nombre.textContent = t.customer_name || "Cliente";
}

/*************************************************
 *    PANEL IZQUIERDO — LISTA COMPLETA DE TURNOS
 *************************************************/
function renderListaTurnos(lista) {
  const cont = document.getElementById("listaTurnos");
  cont.innerHTML = "";

  lista.forEach(t => {
    cont.innerHTML += `
      <div class="turno-item">
        <span>${t.order_number}</span>
        <span>${t.caja_id ?? "—"}</span>
        <span class="nombre">${t.customer_name || "Cliente"}</span>
      </div>
    `;
  });
}

/* AUTOREFRESH */
cargarTurnos();
setInterval(cargarTurnos, 5000);


function showConfirmCustomLogout(message, onYes, onNo) {
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

  overlay.querySelector(".confirm-no").addEventListener("click", () => {
    overlay.remove();
    if (onNo) onNo();
  });

  overlay.querySelector(".confirm-yes").addEventListener("click", () => {
    overlay.remove();
    onYes();
  });
}
