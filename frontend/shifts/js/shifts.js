/*************************************************
 *  SIDEBAR, SESIÓN, ROLES, MODO OSCURO
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  const sidebar   = document.getElementById("sidebar");
  const toggle    = document.getElementById("menuToggle");
  const btnLogin  = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const menuList  = document.getElementById("menuList");
  const sidebarAvatar   = document.getElementById("sidebarAvatar");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserInfo = document.getElementById("sidebarUserInfo");

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

  // LOGOUT desde shifts
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      showConfirmCustomLogout(
        "¿Deseas cerrar sesión?",
        () => {
          try {
            localStorage.clear();
            if (window.sessionStorage) {
              window.sessionStorage.clear();
            }
          } catch (e) {
            console.warn("Error limpiando storage en logout:", e);
          }
          window.location.href = "../login/login.html";
        }
      );
    });
  }

  /* === ABRIR / CERRAR SIDEBAR === */
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggle.textContent = sidebar.classList.contains("active") ? "✖" : "☰";
  });

  /* === CERRAR SI HACE CLICK FUERA === */
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      toggle.textContent = "☰";
    }
  });

  function renderSidebarState() {
    const token = localStorage.getItem("token");
    let user    = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    // Botones login / logout
    if (token && user) {
      btnLogin.style.display  = "none";
      btnLogout.style.display = "block";
    } else {
      btnLogin.style.display  = "block";
      btnLogout.style.display = "none";

      if (menuList) {
        menuList.innerHTML = `
          <li>
            <a href="/menu/index.html">
              <i class="fas fa-utensils"></i>
              <span>Menú</span>
            </a>
          </li>
        `;
      }
    }

    if (!token || !user) {
      // Sin sesión: avatar por defecto, título genérico
      if (sidebarAvatar) {
        sidebarAvatar.src = "../img/user.deflt.png";
      }
      if (sidebarUserName && sidebarUserInfo) {
        sidebarUserName.textContent = "Te Damos La Bienvenida";
        sidebarUserInfo.textContent = "¡Explora el menú!";
      }
      return;
    }

    // === AVATAR EN SIDEBAR ===
    if (sidebarAvatar) {
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

    // === NOMBRE EN SIDEBAR ===
    if (sidebarUserName && sidebarUserInfo) {
      sidebarUserName.textContent = "Bienvenido";
      sidebarUserInfo.textContent = user.name || "¡Explora el menú!";
    }

    // === MENÚ POR ROL ===
    if (!menuList) return;

    if (user.role === "usuario") {
      menuList.innerHTML = `
        <li><a href="/menu/index.html"><i class="fas fa-utensils"></i> <span>Ver Menú</span></a></li>
        <li><a href="/perfil/perfil.html"><i class="fas fa-user"></i> <span>Mi Perfil</span></a></li>
        <li><a href="/shifts/shifts.html"><i class="fas fa-clock"></i> <span>Turnos</span></a></li>
      `;
    } else if (user.role === "admin") {
      menuList.innerHTML = `
        <li><a href="/personal/admin/dashboard/dashboard.html"><i class="fas fa-gauge"></i> Dashboard</a></li>
        <li><a href="/personal/admin/add-dishes/add_dishes.html"><i class="fas fa-pizza-slice"></i> Platillos</a></li>
        <li><a href="/personal/admin/employee-management/employee.html"><i class="fas fa-users"></i> Empleados</a></li>
        <li><a href="/personal/admin/gestioncajas/gestioncajas.html"><i class="fas fa-cash-register"></i> Cajas</a></li>
      `;
    }
  }

  // Inicial
  renderSidebarState();

  // Si vuelves con la flecha ATRÁS al shifts, recalculamos el sidebar:
  window.addEventListener("pageshow", () => {
    renderSidebarState();
  });

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
 *          SISTEMA DE TURNOS – NUEVO DISEÑO
 *************************************************/

/* === Cargar turnos desde API === */
async function cargarTurnos() {
  try {
    const res = await fetch("https://www.laparrilaazteca.online/api/orders/all");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos)) return;

    const enProceso = pedidos.filter(p => p.status === "en_proceso");
    const visibles = pedidos.filter(
      p => p.status === "pendiente" || p.status === "en_proceso"
    );

    renderTurnoActual(enProceso);
    renderListaTurnos(visibles);

  } catch (err) {
    console.warn("Error cargando turnos:", err);
  }
}
  /* === SESIÓN (SOLO ROL "usuario") === */
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  // Solo pueden entrar las personas con rol "usuario"
  if (!token || !user) {
    // Sin sesión -> manda al login
    window.location.href = "../login/login.html";
    return;
  }

  if (user.role !== "usuario") {
    // Si es admin, empleado u otro rol -> lo mandamos al menú
    alert("Solo los usuarios pueden ver sus turnos.");
    window.location.href = "/menu/index.html";
    return;
  }

  // Aquí ya sabemos que es un usuario con sesión
  btnLogin.style.display = "none";
  btnLogout.style.display = "block";

/*************************************************
 *   PANEL DERECHO — TURNO ACTUAL GRANDE
 *************************************************/
function renderTurnoActual(lista) {
  const cont   = document.getElementById("turnosActuales");
  const nombre = document.getElementById("nombreUsuarioActual");

  cont.innerHTML = "";
  nombre.textContent = "—";

  if (lista.length === 0) {
    cont.innerHTML = `
      <p style="text-align:center; color:#777; font-weight:600;">
        No hay pedidos en proceso
      </p>`;
    return;
  }

  const t = lista[0];

  cont.innerHTML = `
    <span>${t.order_number}</span>
    <span>${t.caja_id ?? "—"}</span>
  `;

  nombre.textContent = t.customer_name || "Cliente";
}

/*************************************************
 *   PANEL IZQUIERDO — LISTA DE TURNOS
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

/* Auto-refresh */
cargarTurnos();
setInterval(cargarTurnos, 5000);
